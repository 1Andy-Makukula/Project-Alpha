/**
 * @file mockDatabase.ts
 * @description Mock database service for development/testing
 * This provides the same interface as the real database but uses localStorage
 */

import { Order, Product } from '../types';

const STORAGE_KEYS = {
  ORDERS: 'kithly_orders',
  PRODUCTS: 'kithly_products',
};

/**
 * Simple mock database using localStorage
 */
export const db = {
  orders: {
    getAll: async (): Promise<Order[]> => {
      const stored = localStorage.getItem(STORAGE_KEYS.ORDERS);
      return stored ? JSON.parse(stored) : [];
    },

    get: async (collectionCode: string): Promise<Order | null> => {
      const orders = await db.orders.getAll();
      return orders.find(o => o.collectionCode === collectionCode) || null;
    },

    create: async (order: Order): Promise<Order> => {
      const orders = await db.orders.getAll();
      orders.unshift(order);
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
      return order;
    },

    verifyAndCollect: async (orderId: string, method: 'scan' | 'manual'): Promise<boolean> => {
      const orders = await db.orders.getAll();
      const index = orders.findIndex(o => o.id === orderId || o.collectionCode === orderId);

      if (index === -1) return false;

      orders[index] = {
        ...orders[index],
        status: 'collected',
        collectedOn: new Date().toISOString(),
        verificationMethod: method,
      };

      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
      return true;
    },
  },

  products: {
    getAll: async (shopId?: number): Promise<Product[]> => {
      const stored = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      const products: Product[] = stored ? JSON.parse(stored) : [];

      // Filter by shopId if provided
      if (shopId !== undefined) {
        return products.filter(p => p.shopId === shopId);
      }

      return products;
    },

    add: async (product: Omit<Product, 'id'>): Promise<Product> => {
      const products = await db.products.getAll();
      const newProduct = {
        ...product,
        id: Date.now() + Math.floor(Math.random() * 1000),
      };
      products.unshift(newProduct);
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
      return newProduct;
    },

    delete: async (productId: number): Promise<void> => {
      const products = await db.products.getAll();
      const filtered = products.filter(p => p.id !== productId);
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(filtered));
    },
  },
};
