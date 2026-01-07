/**
 * @file api.config.ts
 * @description Central configuration for API endpoints and settings.
 * This file determines whether to use mock data or real backend APIs.
 */

export const API_CONFIG = {
  /**
   * API Mode: 'mock' for local stub data, 'live' for Django backend
   */
  mode: (import.meta.env.VITE_API_MODE || 'mock') as 'mock' | 'live',

  /**
   * Base URL for Django REST API
   */
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',

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
 * @desc API endpoint paths matching Django backend routes
 */
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/auth/login/',
    REGISTER: '/auth/register/',
    LOGOUT: '/auth/logout/',
    REFRESH: '/auth/refresh/',
    ME: '/auth/me/',
  },

  // Orders
  ORDERS: {
    LIST: '/orders/',
    CREATE: '/orders/',
    DETAIL: (id: string) => `/orders/${id}/`,
    VERIFY: (id: string) => `/orders/${id}/verify/`,
    BY_CODE: (code: string) => `/orders/by-code/${code}/`,
    EXPORT_CSV: '/orders/export/csv/',
  },

  // Products
  PRODUCTS: {
    LIST: '/products/',
    CREATE: '/products/',
    DETAIL: (id: number) => `/products/${id}/`,
    UPDATE: (id: number) => `/products/${id}/`,
    DELETE: (id: number) => `/products/${id}/`,
    BY_SHOP: (shopId: number) => `/products/?shopId=${shopId}`,
  },

  // Shops
  SHOPS: {
    LIST: '/shops/',
    CREATE: '/shops/',
    DETAIL: (id: number) => `/shops/${id}/`,
    UPDATE: (id: number) => `/shops/${id}/`,
    DELETE: (id: number) => `/shops/${id}/`,
  },

  // Reviews
  REVIEWS: {
    LIST: '/reviews/',
    CREATE: '/reviews/',
    BY_SHOP: (shopId: number) => `/reviews/?shopId=${shopId}`,
  },

  // Payments
  PAYMENTS: {
    INITIATE: '/payments/initiate/',
    VERIFY: '/payments/verify/',
    WEBHOOK: '/payments/webhook/',
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
