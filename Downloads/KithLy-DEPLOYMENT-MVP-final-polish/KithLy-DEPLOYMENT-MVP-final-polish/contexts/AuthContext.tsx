
import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../services/firebase'; // Assuming you have an auth export from firebase
import { User } from 'firebase/auth';

interface AuthContextType {
    currentUser: User | null;
    isShopOwner: boolean;
}

const AuthContext = createContext<AuthContextType>({
    currentUser: null,
    isShopOwner: false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [isShopOwner, setIsShopOwner] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            setCurrentUser(user);
            if (user) {
                // Check if user is a shop owner
                const token = await user.getIdTokenResult();
                setIsShopOwner(!!token.claims.shopOwner);
            } else {
                setIsShopOwner(false);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const value = {
        currentUser,
        isShopOwner,
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
