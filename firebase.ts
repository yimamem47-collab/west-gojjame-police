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
  experimentalAutoDetectLongPolling: true,
  longPollingOptions: {
    timeoutSeconds: 20 // ወደ 20 ዝቅ ተደርጓል ለፍጥነት
  },
  useFetchStreams: false,
  ignoreUndefinedProperties: true,
  host: "firestore.googleapis.com",
  ssl: true,
};

const dbId = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== "(default)" 
  ? firebaseConfig.firestoreDatabaseId 
  : undefined;

// Initialize Firestore
export let db = initializeFirestore(app, firestoreSettings, dbId);

/**
 * Forcefully clears the Firestore cache and restarts the instance.
 */
export async function clearFirestoreCache() {
  try {
    await terminate(db);
    await clearIndexedDbPersistence(db);
    db = initializeFirestore(app, firestoreSettings, dbId);
    setTimeout(() => testConnection(2), 500);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Forcefully tries to re-enable the network connection.
 */
export async function forceReconnect() {
  try {
    await disableNetwork(db);
    await new Promise(resolve => setTimeout(resolve, 500));
    await enableNetwork(db);
    await testConnection(2);
    return true;
  } catch (error) {
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
 * ተሻሽሏል፡ አፑ በፍጥነት እንዲከፍት retries ወደ 3 ዝቅ ተደርጓል፣ 5 ሰከንድ መጠበቁ ቀርቷል
 */
export async function testConnection(retries = 3) {
  // ወዲያውኑ መሞከር እንዲጀምር (ያለ 5 ሰከንድ ቆይታ)
  for (let i = 0; i < retries; i++) {
    if (!navigator.onLine) {
      setFirestoreStatus(false);
      return; // ኢንተርኔት ከሌለ ወዲያውኑ አቁም
    }

    try {
      await enableNetwork(db).catch(() => {});
      const testDoc = doc(db, '_internal', 'connection_test');
      
      const fetchPromise = getDocFromServer(testDoc);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 5000) // 5 ሰከንድ ብቻ ጠብቅ
      );

      await Promise.race([fetchPromise, timeoutPromise]);
      setFirestoreStatus(true);
      return; 
    } catch (error: any) {
      const errorCode = error?.code || '';
      // ሰርቨሩን ከነካነው (ባይፈቀድልንም እንኳ) እንደተገናኘን እንቆጥራለን
      if (errorCode && errorCode !== 'unavailable' && errorCode !== 'failed-precondition') {
        setFirestoreStatus(true);
        return;
      }

      if (i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }
  // መገናኘት ባይችል እንኳ አፑን አያግደውም (Offline Mode)
  setFirestoreStatus(false);
}

// አፑ እንደተከፈተ ወዲያውኑ ቼክ እንዲያደርግ
setTimeout(() => testConnection(), 500);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

/**
 * ስህተቶች አፑን እንዳያቆሙ ተደርጓል
 */
export function handleFirestoreError(error: any, operationType: OperationType, path: string | null) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorCode = error?.code || '';
  
  console.warn('Firestore Operation Issue:', errorCode, errorMessage);
  
  if (
    errorCode === 'unavailable' || 
    errorMessage.includes('offline') || 
    errorMessage.includes('network')
  ) {
    return; // ዝም ብለህ እለፈው (Don't crash)
  }
}
