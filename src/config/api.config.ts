/**
 * @file api.config.ts
 * @description Central configuration for API endpoints and settings.
 * Uses Firebase/Firestore as the primary backend.
 */

export const API_CONFIG = {
  /**
   * Payment Mode: 'live' for real Flutterwave, 'simulation' for testing
   */
  paymentMode: (import.meta.env.VITE_PAYMENT_MODE || 'simulation') as 'live' | 'simulation',

  /**
   * Flutterwave public key
   */
  flutterwaveKey: import.meta.env.VITE_FLUTTERWAVE_PUBLIC_KEY || '',

  /**
   * Auth token storage key
   */
  authTokenKey: import.meta.env.VITE_AUTH_TOKEN_KEY || 'kithly_auth_token',

  /**
   * Request timeout in milliseconds
   */
  timeout: 30000,
};

/**
 * @desc Firestore collection names - single source of truth
 */
export const COLLECTIONS = {
  USERS: 'users',
  SHOPS: 'shops',
  PRODUCTS: 'products',
  ORDERS: 'orders',
  REVIEWS: 'reviews',
  TRANSACTIONS: 'transactions',
};

/**
 * @desc Helper to check if payments are in simulation mode
 */
export const isPaymentSimulation = () => API_CONFIG.paymentMode === 'simulation';

/**
 * @desc Helper to get auth token from localStorage
 */
export const getAuthToken = (): string | null => {
  return localStorage.getItem(API_CONFIG.authTokenKey);
};

/**
 * @desc Helper to set auth token in localStorage
 */
export const setAuthToken = (token: string): void => {
  localStorage.setItem(API_CONFIG.authTokenKey, token);
};

/**
 * @desc Helper to clear auth token from localStorage
 */
export const clearAuthToken = (): void => {
  localStorage.removeItem(API_CONFIG.authTokenKey);
};
