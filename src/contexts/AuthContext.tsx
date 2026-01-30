import React, { createContext, useContext, useEffect, useState } from 'react';
import {
    User,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    signInWithPopup,
    sendPasswordResetEmail,
    updateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, googleProvider, db } from '../services/firebase';
import { COLLECTIONS } from '../config/api.config';

/**
 * @desc User profile stored in Firestore
 */
export interface UserProfile {
    uid: string;
    email: string;
    displayName: string;
    photoURL?: string;
    role: 'customer' | 'shop' | 'admin';
    phone?: string;
    createdAt: any;
    lastLoginAt: any;
    // Shop-specific
    shopId?: string;
    // Customer-specific
    addresses?: any[];
}

interface AuthContextType {
    currentUser: User | null;
    userProfile: UserProfile | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<User>;
    register: (email: string, password: string, displayName: string, role?: 'customer' | 'shop') => Promise<User>;
    logout: () => Promise<void>;
    loginWithGoogle: () => Promise<User>;
    resetPassword: (email: string) => Promise<void>;
    updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

/**
 * @desc Fetch or create user profile in Firestore
 */
async function getOrCreateUserProfile(user: User, role: 'customer' | 'shop' = 'customer'): Promise<UserProfile> {
    const userRef = doc(db, COLLECTIONS.USERS, user.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
        // Update last login
        await setDoc(userRef, { lastLoginAt: serverTimestamp() }, { merge: true });
        return userSnap.data() as UserProfile;
    }

    // Create new profile
    const newProfile: UserProfile = {
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || user.email?.split('@')[0] || 'User',
        photoURL: user.photoURL || undefined,
        role,
        createdAt: serverTimestamp(),
        lastLoginAt: serverTimestamp(),
    };

    await setDoc(userRef, newProfile);
    return newProfile;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    // Listen to auth state changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setCurrentUser(user);

            if (user) {
                try {
                    const profile = await getOrCreateUserProfile(user);
                    setUserProfile(profile);
                } catch (error) {
                    console.error('Error fetching user profile:', error);
                    setUserProfile(null);
                }
            } else {
                setUserProfile(null);
            }

            setLoading(false);
        });

        return unsubscribe;
    }, []);

    /**
     * @desc Login with email and password
     */
    const login = async (email: string, password: string): Promise<User> => {
        const result = await signInWithEmailAndPassword(auth, email, password);
        const profile = await getOrCreateUserProfile(result.user);
        setUserProfile(profile);
        return result.user;
    };

    /**
     * @desc Register with email and password
     */
    const register = async (
        email: string,
        password: string,
        displayName: string,
        role: 'customer' | 'shop' = 'customer'
    ): Promise<User> => {
        const result = await createUserWithEmailAndPassword(auth, email, password);

        // Update Firebase Auth profile
        await updateProfile(result.user, { displayName });

        // Create Firestore profile with role
        const profile = await getOrCreateUserProfile(result.user, role);
        setUserProfile(profile);

        return result.user;
    };

    /**
     * @desc Logout
     */
    const logout = async (): Promise<void> => {
        await signOut(auth);
        setUserProfile(null);
    };

    /**
     * @desc Login with Google
     */
    const loginWithGoogle = async (): Promise<User> => {
        const result = await signInWithPopup(auth, googleProvider);
        const profile = await getOrCreateUserProfile(result.user);
        setUserProfile(profile);
        return result.user;
    };

    /**
     * @desc Request password reset email
     */
    const resetPassword = async (email: string): Promise<void> => {
        await sendPasswordResetEmail(auth, email);
    };

    /**
     * @desc Update user profile in Firestore
     */
    const updateUserProfile = async (updates: Partial<UserProfile>): Promise<void> => {
        if (!currentUser) throw new Error('No user logged in');

        const userRef = doc(db, COLLECTIONS.USERS, currentUser.uid);
        await setDoc(userRef, updates, { merge: true });

        // Update local state
        setUserProfile(prev => prev ? { ...prev, ...updates } : null);

        // Sync displayName with Firebase Auth if changed
        if (updates.displayName) {
            await updateProfile(currentUser, { displayName: updates.displayName });
        }
    };

    const value = {
        currentUser,
        userProfile,
        loading,
        login,
        register,
        logout,
        loginWithGoogle,
        resetPassword,
        updateUserProfile,
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
