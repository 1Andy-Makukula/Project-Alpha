/**
 * @file api.config.ts
 * @description Central configuration for API endpoints and settings.
 * This file determines whether to use mock data or real backend APIs.
 */

export const API_CONFIG = {
  /**
   * API Mode: 'mock' for local stub data, 'live' for PHP backend
   */
  mode: (import.meta.env.VITE_API_MODE || 'mock') as 'mock' | 'live',

  /**
   * Base URL for PHP API
   */
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost/kithly-api/api',

  /**
   * Auth token storage key
   */
  authTokenKey: import.meta.env.VITE_AUTH_TOKEN_KEY || 'kithly_auth_token',

  /**
   * Request timeout in milliseconds
   */
  timeout: 30000,

  /**
   * Headers to include in all requests
   */
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
};

/**
 * @desc API endpoint paths matching PHP backend routes
 */
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/login.php',
    REGISTER: '/signup.php',
    LOGOUT: '/logout.php',
    REFRESH: '/refresh_token.php',
    ME: '/me.php',
  },

  // Orders
  ORDERS: {
    LIST: '/orders.php',
    CREATE: '/orders.php',
    // For detail, we'll likely use query params in the service layer or path parameters if backend supports it.
    // Assuming simple PHP without routing engine:
    DETAIL: (id: string) => `/orders.php?id=${id}`,
    VERIFY: (id: string) => `/orders_verify.php?id=${id}`, // or orders.php?action=verify&id=...
    BY_CODE: (code: string) => `/orders.php?code=${code}`,
    EXPORT_CSV: '/orders_export.php',
  },

  // Products
  PRODUCTS: {
    LIST: '/products.php',
    CREATE: '/products.php',
    DETAIL: (id: number) => `/products.php?id=${id}`,
    UPDATE: (id: number) => `/products.php?id=${id}`, // Method PUT/PATCH
    DELETE: (id: number) => `/products.php?id=${id}`, // Method DELETE
    BY_SHOP: (shopId: number) => `/products.php?shopId=${shopId}`,
  },

  // Shops
  SHOPS: {
    LIST: '/shops.php',
    CREATE: '/shops.php',
    DETAIL: (id: number) => `/shops.php?id=${id}`,
    UPDATE: (id: number) => `/shops.php?id=${id}`,
    DELETE: (id: number) => `/shops.php?id=${id}`,
  },

  // Reviews
  REVIEWS: {
    LIST: '/reviews.php',
    CREATE: '/reviews.php',
    BY_SHOP: (shopId: number) => `/reviews.php?shopId=${shopId}`,
  },

  // Payments
  PAYMENTS: {
    INITIATE: '/payments_initiate.php',
    VERIFY: '/payments_verify.php',
    WEBHOOK: '/payments_webhook.php',
  },
};

/**
 * @desc Helper to check if we're using mock data
 */
export const isMockMode = () => API_CONFIG.mode === 'mock';

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
