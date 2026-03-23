import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, setPersistence, browserLocalPersistence } from "firebase/auth";
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager, doc, getDocFromServer } from "firebase/firestore";
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

// Initialize Firestore
console.log("Firebase Config:", firebaseConfig);
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
}, firebaseConfig.firestoreDatabaseId);

export const googleProvider = new GoogleAuthProvider();

/**
 * CRITICAL CONSTRAINT: Test connection to Firestore on boot.
 */
async function testConnection() {
  // Wait a bit before testing to allow network to settle
  await new Promise(resolve => setTimeout(resolve, 2000));
  try {
    // Try to fetch a non-existent doc from server to test connectivity
    await getDocFromServer(doc(db, '_internal', 'connection_test'));
    console.log("Firestore connection test successful.");
  } catch (error) {
    if (error instanceof Error && (error.message.includes('the client is offline') || error.message.includes('Could not reach Cloud Firestore'))) {
      console.error("CRITICAL: Firestore connection failed. This is usually caused by an Adblocker (like Brave Shields or uBlock Origin) or a strict corporate firewall blocking WebSockets. Please disable your adblocker or try in Incognito mode.");
    }
    // Other errors (like 404) are fine, they still mean we reached the server
  }
}

testConnection();

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
