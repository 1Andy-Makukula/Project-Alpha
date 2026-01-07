
import React, { createContext, useContext, useEffect, useState } from 'react';

// Mock User interface (replaces Firebase User)
interface MockUser {
    uid: string;
    email: string;
    displayName: string;
    role: 'customer' | 'shop' | 'admin';
}

interface AuthContextType {
    currentUser: MockUser | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<MockUser>;
    register: (email: string, password: string, displayName?: string) => Promise<MockUser>;
    logout: () => Promise<void>;
    loginWithGoogle: () => Promise<MockUser>;
    resetPassword: (email: string) => Promise<void>;
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
    const [currentUser, setCurrentUser] = useState<MockUser | null>(null);
    const [loading, setLoading] = useState(true);

    // Check for existing session on mount
    useEffect(() => {
        const storedUser = localStorage.getItem('kithly_user');
        if (storedUser) {
            try {
                const user = JSON.parse(storedUser);
                setCurrentUser(user);
            } catch (error) {
                console.error('Failed to parse stored user:', error);
                localStorage.removeItem('kithly_user');
            }
        }
        setLoading(false);
    }, []);

    // Mock login function
    const login = async (email: string, password: string): Promise<MockUser> => {
        // Simulate network delay for professional feel
        await new Promise(resolve => setTimeout(resolve, 800));

        // Determine role based on email pattern
        let role: 'customer' | 'shop' | 'admin' = 'customer';
        if (email.includes('shop') || email.includes('vendor')) {
            role = 'shop';
        } else if (email.includes('admin')) {
            role = 'admin';
        }

        const mockUser: MockUser = {
            uid: 'mock-user-id-' + Math.random().toString(36).substr(2, 9),
            email: email,
            displayName: email.split('@')[0],
            role: role,
        };

        setCurrentUser(mockUser);
        localStorage.setItem('kithly_user', JSON.stringify(mockUser));
        return mockUser;
    };

    // Mock signup function
    const register = async (email: string, password: string, displayName?: string): Promise<MockUser> => {
        await new Promise(resolve => setTimeout(resolve, 800));

        // Determine role based on email pattern
        let role: 'customer' | 'shop' | 'admin' = 'customer';
        if (email.includes('shop') || email.includes('vendor')) {
            role = 'shop';
        }

        const mockUser: MockUser = {
            uid: 'mock-new-user-' + Math.random().toString(36).substr(2, 9),
            email,
            displayName: displayName || email.split('@')[0],
            role: role
        };

        setCurrentUser(mockUser);
        localStorage.setItem('kithly_user', JSON.stringify(mockUser));
        return mockUser;
    };

    // Mock logout function
    const logout = async (): Promise<void> => {
        await new Promise(resolve => setTimeout(resolve, 300));
        setCurrentUser(null);
        localStorage.removeItem('kithly_user');
    };

    // Mock Google login
    const loginWithGoogle = async (): Promise<MockUser> => {
        await new Promise(resolve => setTimeout(resolve, 800));

        const mockUser: MockUser = {
            uid: 'mock-google-user-' + Math.random().toString(36).substr(2, 9),
            email: 'user@gmail.com',
            displayName: 'Google User',
            role: 'customer'
        };

        setCurrentUser(mockUser);
        localStorage.setItem('kithly_user', JSON.stringify(mockUser));
        return mockUser;
    };

    // Mock password reset
    const resetPassword = async (email: string): Promise<void> => {
        await new Promise(resolve => setTimeout(resolve, 500));
        console.log('Password reset email would be sent to:', email);
        // In production, this would trigger Django API to send reset email
    };

    const value = {
        currentUser,
        loading,
        login,
        register,
        logout,
        loginWithGoogle,
        resetPassword
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
