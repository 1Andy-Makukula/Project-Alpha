/**
 * @file productsApi.ts
 * @description API service for product operations.
 * Uses Firestore as the backend.
 */

import { Product } from '../../types';
import { firestoreProductsService } from '../firestoreProductsService';

/**
 * @desc Products API Service
 * Uses Firestore for all operations
 */
export const productsApi = {
  /**
   * @desc Retrieves all products, optionally filtered by shop
   * @param {number} [shopId] - Optional shop ID to filter products
   */
  getAll: async (shopId?: number): Promise<Product[]> => {
    return firestoreProductsService.getAll(shopId);
  },

  /**
   * @desc Retrieves a single product by ID
   * @param {number | string} productId - The product ID
   */
  getById: async (productId: number | string): Promise<Product | null> => {
    return firestoreProductsService.getById(productId.toString());
  },

  /**
   * @desc Creates a new product
   * @param {Product} product - The product data
   */
  create: async (product: Product): Promise<Product> => {
    const id = await firestoreProductsService.create(product);
    return { ...product, id };
  },

  /**
   * @desc Adds a new product (alias for create)
   * @param {Product} product - The product data
   */
  add: async (product: Product): Promise<Product> => {
    return productsApi.create(product);
  },

  /**
   * @desc Updates an existing product
   * @param {number | string} productId - The product ID
   * @param {Partial<Product>} updates - The fields to update
   */
  update: async (
    productId: number | string,
    updates: Partial<Product>
  ): Promise<Product> => {
    await firestoreProductsService.update(productId.toString(), updates);
    const updated = await firestoreProductsService.getById(productId.toString());
    if (!updated) throw new Error('Product not found');
    return updated;
  },

  /**
   * @desc Deletes a product
   * @param {number | string} productId - The product ID
   */
  delete: async (productId: number | string): Promise<void> => {
    await firestoreProductsService.delete(productId.toString());
  },
};
