import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCA_0sY_0eBgQED7jiOauu6YdCDVt3gROg",
  authDomain: "westgojampolice.firebaseapp.com",
  projectId: "westgojampolice",
  storageBucket: "westgojampolice.firebasestorage.app",
  messagingSenderId: "911546138163",
  appId: "1:911546138163:web:b630ed0273c3db60e72d46"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
