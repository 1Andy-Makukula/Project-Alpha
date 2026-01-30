/**
 * @desc Real Firebase configuration for KithLy
 * Connected to Project: kithly-mvp
 */
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// 1. Paste your keys from the Firebase Console here
const firebaseConfig = {
  apiKey: "AIzaSyBPGuESAL5kQBYCJ5z8gTRzHfgugrT-oug",
  authDomain: "kithly-mvp.firebaseapp.com",
  projectId: "kithly-mvp",
  storageBucket: "kithly-mvp.firebasestorage.app",
  messagingSenderId: "283236866942",
  appId: "1:283236866942:web:eed2ae159f68ad33a3f12f",
  measurementId: "G-XGXHBWDSLL"
};

// 2. Initialize the App
const app = initializeApp(firebaseConfig);

// 3. Export the Services
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);

console.log("🔥 Firebase initialized!");