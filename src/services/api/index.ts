/**
 * @file api/index.ts
 * @description Central export for all API services.
 * Import this in components instead of individual API files.
 */

export { httpClient, ApiError } from './httpClient';
export { ordersApi } from './ordersApi';
export { productsApi } from './productsApi';

// Import for unified API object
import { ordersApi } from './ordersApi';
import { productsApi } from './productsApi';

/**
 * @desc Unified API object for easy imports
 * Usage: import { api } from '@/services/api';
 *        const orders = await api.orders.getAll();
 */
export const api = {
  orders: ordersApi,
  products: productsApi,
  // Add more services here as they're created (shops, reviews, etc.)
} as const;
