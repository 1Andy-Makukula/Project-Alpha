
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { authService } from '../services/authService';

interface AuthContextType {
    currentUser: User | null;
    loading: boolean;
    login: (email, password) => Promise<any>;
    register: (email, password) => Promise<any>;
    logout: () => Promise<void>;
    loginWithGoogle: () => Promise<any>;
    resetPassword: (email) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = authService.onAuthStateChanged((user) => {
            setCurrentUser(user);
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    const value = {
        currentUser,
        loading,
        login: authService.login,
        register: authService.register,
        logout: authService.logout,
        loginWithGoogle: authService.loginWithGoogle,
        resetPassword: authService.resetPassword
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
