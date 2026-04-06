import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, setPersistence, browserLocalPersistence } from "firebase/auth";
import { 
  initializeFirestore, 
  persistentLocalCache, 
  persistentSingleTabManager, 
  doc, 
  getDocFromServer,
  enableNetwork,
  disableNetwork,
  terminate,
  clearIndexedDbPersistence
} from "firebase/firestore";
import { getStorage } from "firebase/storage";
import firebaseConfig from "../firebase-applet-config.json";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const storage = getStorage(app);

// Ensure persistence is set to local
setPersistence(auth, browserLocalPersistence).catch((err) => {
  console.error("Auth persistence error:", err);
});

// Initialize Firestore with robust settings
const firestoreSettings = {
  localCache: persistentLocalCache({ 
    tabManager: persistentSingleTabManager({}) 
  }),
  // Auto-detect if long polling is needed
  experimentalAutoDetectLongPolling: true,
  // Increase timeout for long polling to prevent "Backend didn't respond within 10 seconds"
  longPollingOptions: {
    timeoutSeconds: 30
  },
  // Disable fetch streams as they can be flaky on some mobile networks
  useFetchStreams: false,
  ignoreUndefinedProperties: true,
  // Explicitly set host and SSL to avoid common connectivity issues
  host: "firestore.googleapis.com",
  ssl: true,
};

// Use the firestoreDatabaseId from the config
const dbId = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== "(default)" 
  ? firebaseConfig.firestoreDatabaseId 
  : undefined;

// Initialize Firestore with robust settings
export let db = initializeFirestore(app, firestoreSettings, dbId);

/**
 * Forcefully clears the Firestore cache and restarts the instance.
 */
export async function clearFirestoreCache() {
  console.log("Attempting to clear Firestore cache...");
  try {
    await terminate(db);
    await clearIndexedDbPersistence(db);
    db = initializeFirestore(app, firestoreSettings, dbId);
    console.log("Firestore cache cleared and restarted.");
    setTimeout(() => testConnection(5), 1000);
    return true;
  } catch (error) {
    console.error("Failed to clear Firestore cache:", error);
    return false;
  }
}

/**
 * Forcefully tries to re-enable the network connection.
 */
export async function forceReconnect() {
  console.log("Forcefully attempting to reconnect to Firestore...");
  try {
    await disableNetwork(db);
    await new Promise(resolve => setTimeout(resolve, 1000));
    await enableNetwork(db);
    await testConnection(3);
    return true;
  } catch (error) {
    console.error("Force reconnect failed:", error);
    return false;
  }
}

export const googleProvider = new GoogleAuthProvider();

// Connection status tracking
let isFirestoreConnected = false;
const connectionListeners: ((connected: boolean) => void)[] = [];

export const getFirestoreStatus = () => isFirestoreConnected;
export const onFirestoreStatusChange = (callback: (connected: boolean) => void) => {
  connectionListeners.push(callback);
  callback(isFirestoreConnected);
  return () => {
    const index = connectionListeners.indexOf(callback);
    if (index > -1) connectionListeners.splice(index, 1);
  };
};

const setFirestoreStatus = (status: boolean) => {
  if (isFirestoreConnected !== status) {
    isFirestoreConnected = status;
    connectionListeners.forEach(cb => cb(status));
  }
};

/**
 * CRITICAL CONSTRAINT: Test connection to Firestore on boot.
 */
export async function testConnection(retries = 30) {
  // Wait for initial app load and network stabilization
  await new Promise(resolve => setTimeout(resolve, 5000));

  for (let i = 0; i < retries; i++) {
    // Check browser online status
    if (!navigator.onLine) {
      setFirestoreStatus(false);
      await new Promise(resolve => {
        const handleOnline = () => {
          window.removeEventListener('online', handleOnline);
          resolve(true);
        };
        window.addEventListener('online', handleOnline);
        setTimeout(resolve, 10000); 
      });
    }

    try {
      console.log(`Firestore connection attempt ${i + 1}/${retries}...`);
      
      // Ensure network is enabled
      await enableNetwork(db).catch(() => {});
      
      // Test connectivity by fetching a document from the server
      // Use a path that is likely to exist or at least reachable
      const testDoc = doc(db, '_internal', 'connection_test');
      
      // Use a longer timeout per attempt to allow for slow long-polling
      const fetchPromise = getDocFromServer(testDoc);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 30000)
      );

      await Promise.race([fetchPromise, timeoutPromise]);
      
      console.log("Firestore connection established successfully.");
      setFirestoreStatus(true);
      return; 
    } catch (error: any) {
      const errorMessage = error?.message || '';
      const errorCode = error?.code || '';
      
      console.warn(`Attempt ${i + 1} failed:`, errorCode || errorMessage);

      // If it's a permission error or 404, we reached the server!
      if (errorCode && errorCode !== 'unavailable' && errorCode !== 'failed-precondition' && !errorMessage.includes('offline') && !errorMessage.includes('10 seconds')) {
        console.log("Firestore server reached (confirmed by response code):", errorCode);
        setFirestoreStatus(true);
        return;
      }

      setFirestoreStatus(false);
      
      if (i < retries - 1) {
        // Try to "kick" the connection by toggling network
        try {
          await disableNetwork(db);
          await new Promise(resolve => setTimeout(resolve, 1000));
          await enableNetwork(db);
        } catch (e) {}

        // Backoff: 3s, 6s, 9s... max 20s
        const delay = Math.min(3000 * (i + 1), 20000);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  console.error("Firestore connection failed after multiple attempts. Operating in offline mode.");
}

// Start connection test after a short delay
setTimeout(() => testConnection(), 1000);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

/**
 * CRITICAL DIRECTIVE: Specific error handler for Firestore permissions and connectivity.
 */
export function handleFirestoreError(error: any, operationType: OperationType, path: string | null) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorCode = error?.code || '';
  
  const errInfo: FirestoreErrorInfo = {
    error: errorMessage,
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  };
  
  const errorString = JSON.stringify(errInfo);
  console.error('Firestore Error Details:', errorString);
  
  // Do not throw for offline/network errors to prevent app crashes
  if (
    errorCode === 'unavailable' || 
    errorMessage.includes('offline') || 
    errorMessage.includes('Could not reach Cloud Firestore') || 
    errorMessage.includes('network') ||
    errorMessage.includes('Internet connection')
  ) {
    console.warn('Network error ignored to prevent crash:', errorMessage);
    return;
  }
  
  // Return a user-friendly message but throw the JSON for the system
  throw new Error(errorString);
}
