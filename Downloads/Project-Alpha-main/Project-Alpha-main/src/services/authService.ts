/**
 * @file authService.ts
 * @description Authentication service using PHP backend.
 * Replaces Firebase authentication with custom PHP endpoints.
 */

import { API_ENDPOINTS, setAuthToken, clearAuthToken, isMockMode } from '../config/api.config';
import { httpClient } from './api/httpClient';

// Mock User for development
const MOCK_USER = {
    uid: 'mock-user-123',
    email: 'test@kithly.com',
    displayName: 'Test User',
    emailVerified: true,
    isAnonymous: false,
    metadata: {
        creationTime: new Date().toISOString(),
        lastSignInTime: new Date().toISOString()
    },
    providerData: [],
    refreshToken: 'mock-refresh-token',
    tenantId: null,
    delete: async () => {},
    getIdToken: async () => 'mock-token',
    getIdTokenResult: async () => ({
        token: 'mock-token',
        signInProvider: 'password',
        claims: {},
        authTime: new Date().toISOString(),
        issuedAtTime: new Date().toISOString(),
        expirationTime: new Date(Date.now() + 3600000).toISOString()
    }),
    reload: async () => {},
    toJSON: () => ({}),
    phoneNumber: null,
    photoURL: null
};

export const authService = {
    /**
     * @desc Logs in a user using email and password.
     */
    login: async (email, password) => {
        if (isMockMode()) {
            console.log('Mock login successful');
            setAuthToken('mock-token');
            return { user: MOCK_USER };
        }

        try {
            const response: any = await httpClient.post(API_ENDPOINTS.AUTH.LOGIN, { email, password });
            if (response.token) {
                setAuthToken(response.token);
                return { user: response.user }; // Adjust based on PHP response structure
            }
            throw new Error('Login failed: No token received');
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    },

    /**
     * @desc Registers a new user.
     */
    register: async (email, password) => {
        if (isMockMode()) {
            console.log('Mock register successful');
            setAuthToken('mock-token');
            return { user: MOCK_USER };
        }

        try {
            const response: any = await httpClient.post(API_ENDPOINTS.AUTH.REGISTER, { email, password });
            if (response.token) {
                setAuthToken(response.token);
                return { user: response.user };
            }
             throw new Error('Registration failed: No token received');
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    },

    /**
     * @desc Logs out the current user.
     */
    logout: async () => {
        if (isMockMode()) {
            console.log('Mock logout');
            clearAuthToken();
            return;
        }

        try {
            await httpClient.post(API_ENDPOINTS.AUTH.LOGOUT);
        } catch (error) {
            console.warn('Logout failed on server, clearing local state anyway', error);
        } finally {
            clearAuthToken();
        }
    },

    /**
     * @desc Resets the user's password.
     */
    resetPassword: async (email) => {
         if (isMockMode()) {
            console.log('Mock password reset sent to', email);
            return;
        }
        // Assuming there is a password reset endpoint
        // return httpClient.post('/password_reset.php', { email });
        console.warn("Password reset not implemented in PHP backend yet.");
    },

    /**
     * @desc Logs in with Google (Not supported in basic PHP backend yet).
     */
    loginWithGoogle: async () => {
        console.warn("Google login not supported in this PHP version yet.");
        throw new Error("Google login not supported");
    },

    /**
     * @desc Subscribes to auth state changes.
     * Note: PHP/Session based auth is stateless or token based.
     * This mimics Firebase's listener by checking token presence.
     */
    onAuthStateChanged: (callback) => {
        const token = localStorage.getItem('kithly_auth_token');
        if (token) {
             // Ideally verify token validity with /me.php
             // For now, just assume logged in if token exists
             // We can trigger a fetch to 'me.php' here to get user details
             if (isMockMode()) {
                 callback(MOCK_USER);
             } else {
                 httpClient.get(API_ENDPOINTS.AUTH.ME)
                    .then((user: any) => {
                        // Map PHP user to expected User object if necessary
                         callback(user);
                    })
                    .catch(() => {
                        clearAuthToken();
                        callback(null);
                    });
             }
        } else {
            callback(null);
        }
        // Return unsubscribe function
        return () => {};
    },

    /**
     * @desc Gets the current user.
     */
    getCurrentUser: () => {
        // This is synchronous in Firebase but we might need async fetch here.
        // Returning null for now as we depend on onAuthStateChanged or local storage state.
        return null;
    }
};
