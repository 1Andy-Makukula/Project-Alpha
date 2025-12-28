
// Stub Firebase configuration for development without credentials
// TODO: Replace with real Firebase config when ready for production

import { initializeApp } from 'firebase/app';

// Use a minimal valid config to prevent initialization errors
// This allows the app to run without actual Firebase credentials
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDummy-Key-For-Development-Mode",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "kithly-dev.firebaseapp.com",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "kithly-dev",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "kithly-dev.appspot.com",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
    appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789:web:abc123def456"
};

export const app = initializeApp(firebaseConfig);
