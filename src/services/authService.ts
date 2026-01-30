
import {
    getAuth,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    sendPasswordResetEmail,
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithPopup,
    User
} from 'firebase/auth';
import { app } from './firebaseConfig';
export const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export const authService = {
    login: (email, password) => signInWithEmailAndPassword(auth, email, password),
    register: (email, password) => createUserWithEmailAndPassword(auth, email, password),
    logout: () => signOut(auth),
    resetPassword: (email) => sendPasswordResetEmail(auth, email),
    loginWithGoogle: () => signInWithPopup(auth, googleProvider),
    onAuthStateChanged: (callback) => onAuthStateChanged(auth, callback),
    getCurrentUser: () => auth.currentUser
};
