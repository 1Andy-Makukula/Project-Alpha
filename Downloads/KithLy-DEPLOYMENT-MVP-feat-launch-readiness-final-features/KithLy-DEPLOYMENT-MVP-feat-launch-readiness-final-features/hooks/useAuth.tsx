// hooks/useAuth.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthUser } from '@/lib/auth'; // Import the AuthUser type

// Define the shape of the AuthContext
interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  login: (token: string, userData: AuthUser) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// --- Provider Component ---
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load token and user from local storage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('kithly_token');
    const storedUser = localStorage.getItem('kithly_user');

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse user data from localStorage", e);
        // Clear corrupt data
        localStorage.removeItem('kithly_token');
        localStorage.removeItem('kithly_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = (newToken: string, userData: AuthUser) => {
    setToken(newToken);
    setUser(userData);
    localStorage.setItem('kithly_token', newToken);
    localStorage.setItem('kithly_user', JSON.stringify(userData));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('kithly_token');
    localStorage.removeItem('kithly_user');
  };

  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

// --- Custom Hook ---
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
