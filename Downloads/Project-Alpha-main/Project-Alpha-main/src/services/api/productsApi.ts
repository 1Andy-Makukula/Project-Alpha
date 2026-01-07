/**
 * @file productsApi.ts
 * @description API service for product operations.
 */

import { Product } from '../../types';
import { API_ENDPOINTS, isMockMode } from '../../config/api.config';
import { httpClient } from './httpClient';
import { db as mockDb } from '../mockDatabase';

/**
 * @desc Products API Service
 */
export const productsApi = {
  /**
   * @desc Retrieves all products, optionally filtered by shop
   * @param {number} [shopId] - Optional shop ID to filter products
   */
  getAll: async (shopId?: number): Promise<Product[]> => {
    if (isMockMode()) {
      return mockDb.products.getAll(shopId);
    }

    const endpoint = shopId
      ? API_ENDPOINTS.PRODUCTS.BY_SHOP(shopId)
      : API_ENDPOINTS.PRODUCTS.LIST;

    return httpClient.get<Product[]>(endpoint);
  },

  /**
   * @desc Retrieves a single product by ID
   * @param {number} productId - The product ID
   */
  getById: async (productId: number): Promise<Product | null> => {
    if (isMockMode()) {
      const products = await mockDb.products.getAll();
      return products.find(p => p.id === productId) || null;
    }

    try {
      return await httpClient.get<Product>(
        API_ENDPOINTS.PRODUCTS.DETAIL(productId)
      );
    } catch (error: any) {
      if (error.statusCode === 404) {
        return null;
      }
      throw error;
    }
  },

  /**
   * @desc Creates a new product
   * @param {Product} product - The product data
   */
  create: async (product: Product): Promise<Product> => {
    if (isMockMode()) {
      return mockDb.products.add(product);
    }

    return httpClient.post<Product>(API_ENDPOINTS.PRODUCTS.CREATE, product);
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
   * @param {number} productId - The product ID
   * @param {Partial<Product>} updates - The fields to update
   */
  update: async (
    productId: number,
    updates: Partial<Product>
  ): Promise<Product> => {
    if (isMockMode()) {
      // Mock update
      const products = await mockDb.products.getAll();
      const product = products.find(p => p.id === productId);
      if (!product) {
        throw new Error('Product not found');
      }
      return { ...product, ...updates };
    }

    return httpClient.patch<Product>(
      API_ENDPOINTS.PRODUCTS.UPDATE(productId),
      updates
    );
  },

  /**
   * @desc Deletes a product
   * @param {number} productId - The product ID
   */
  delete: async (productId: number): Promise<void> => {
    if (isMockMode()) {
      return mockDb.products.delete(productId);
    }

    await httpClient.delete(API_ENDPOINTS.PRODUCTS.DELETE(productId));
  },
};
