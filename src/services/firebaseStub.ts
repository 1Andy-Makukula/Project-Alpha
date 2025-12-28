
import { Order, Product } from '../types';

/**
 * @file firebaseStub.ts
 * @description This file provides a mock implementation of the database service using localStorage.
 * IMPORTANT: This is a TEMPORARY stub for development and testing purposes only.
 * It is NOT intended for production use.
 *
 * TODO: Replace this entirely with `firebaseReal.ts` (or similar) when connecting to the actual backend.
 * All functions here mimic the signature of the real service to allow for easy swapping.
 */

/**
 * @desc A collection of keys used for storing data in localStorage.
 * This helps prevent key collisions and centralizes storage management.
 */
const DB_KEYS = {
  ORDERS: 'kithly_orders_v2',
  PRODUCTS: 'kithly_products_v2',
};

/**
 * @desc Simulates network latency.
 * @param {number} ms - The number of milliseconds to delay.
 * @returns {Promise<void>}
 */
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * @desc Default mock data for orders to populate the stub database.
 * @todo This should be removed when a real backend is connected.
 */
const mockOrders: Order[] = [
  // ... (mock data)
];

/**
 * @desc Initializes the localStorage database with mock data if it's empty.
 * Ensures the application has data to work with on first load.
 */
const initializeDB = () => {
  if (!localStorage.getItem(DB_KEYS.ORDERS)) {
    localStorage.setItem(DB_KEYS.ORDERS, JSON.stringify(mockOrders));
  }
  if (!localStorage.getItem(DB_KEYS.PRODUCTS)) {
    localStorage.setItem(DB_KEYS.PRODUCTS, JSON.stringify([]));
  }
};

initializeDB();

/**
 * @desc A mock implementation of the Kithly database service.
 * This object simulates the behavior of a real Firebase backend using localStorage.
 * It's designed to be swapped out with a real service without changing frontend components.
 * @implements {ServiceContextType['db']}
 */
export const db = {
  /**
   * @desc Manages all order-related database actions.
   */
  orders: {
    /**
     * @desc Retrieves all orders from localStorage.
     * @returns {Promise<Order[]>} A promise that resolves to an array of orders.
     * @todo Replace with a real Firestore query.
     */
    getAll: async (): Promise<Order[]> => {
      await delay(600);
      const data = localStorage.getItem(DB_KEYS.ORDERS);
      return data ? JSON.parse(data) : [];
    },

    /**
     * @desc Retrieves a single order by its collection code.
     * @param {string} collectionCode - The unique collection code to search for.
     * @returns {Promise<Order | null>} The order if found, null otherwise.
     * @todo Replace with a real Firestore query.
     */
    get: async (collectionCode: string): Promise<Order | null> => {
      await delay(300);
      const data = localStorage.getItem(DB_KEYS.ORDERS);
      const orders: Order[] = data ? JSON.parse(data) : [];
      return orders.find(o => o.collectionCode === collectionCode) || null;
    },

    /**
     * @desc Creates a new order in localStorage.
     * @param {Order} newOrder - The order object to create.
     * @returns {Promise<Order>} The created order.
     * @todo Replace with `firestore.collection('orders').add()`.
     */
    create: async (newOrder: Order): Promise<Order> => {
      await delay(800);
      const orders = JSON.parse(localStorage.getItem(DB_KEYS.ORDERS) || '[]');
      orders.unshift(newOrder);
      localStorage.setItem(DB_KEYS.ORDERS, JSON.stringify(orders));
      return newOrder;
    },

    /**
     * @desc Verifies an order and marks it as collected in localStorage.
     * @param {string} orderId - The unique ID of the order to verify.
     * @param {'scan' | 'manual'} method - The verification method.
     * @returns {Promise<boolean>} True if successful, false otherwise.
     * @todo This should be an atomic server-side operation (e.g., Firebase Function).
     */
    verifyAndCollect: async (orderId: string, method: 'scan' | 'manual'): Promise<boolean> => {
      await delay(500);
      const orders: Order[] = JSON.parse(localStorage.getItem(DB_KEYS.ORDERS) || '[]');
      const index = orders.findIndex(o => o.id === orderId);

      if (index !== -1 && orders[index].status === 'paid') {
        orders[index].status = 'collected';
        orders[index].collectedOn = new Date().toISOString();
        orders[index].verificationMethod = method;
        localStorage.setItem(DB_KEYS.ORDERS, JSON.stringify(orders));
        return true;
      }
      return false;
    }
  },

  /**
   * @desc Manages product-related database actions.
   */
  products: {
    /**
     * @desc Retrieves all products from localStorage.
     * @param {number} [shopId] - (Not implemented in stub) The shop ID to filter by.
     * @returns {Promise<Product[]>} An array of all products.
     * @todo Implement filtering by shopId with a real backend.
     */
    getAll: async (shopId?: number): Promise<Product[]> => {
      await delay(400);
      return JSON.parse(localStorage.getItem(DB_KEYS.PRODUCTS) || '[]');
    },

    /**
     * @desc Adds a new product to localStorage.
     * @param {Product} product - The product to add.
     * @returns {Promise<Product>} The newly added product with a random ID.
     * @todo Replace with `firestore.collection('products').add()`.
     */
    add: async (product: Product): Promise<Product> => {
      await delay(600);
      const products = JSON.parse(localStorage.getItem(DB_KEYS.PRODUCTS) || '[]');
      const newProduct = { ...product, id: Math.floor(Math.random() * 10000) };
      products.push(newProduct);
      localStorage.setItem(DB_KEYS.PRODUCTS, JSON.stringify(products));
      return newProduct;
    },

    /**
     * @desc Deletes a product from localStorage.
     * @param {number} productId - The ID of the product to delete.
     * @returns {Promise<void>}
     * @todo Replace with `firestore.collection('products').doc(productId).delete()`.
     */
    delete: async (productId: number): Promise<void> => {
      await delay(400);
      let products: Product[] = JSON.parse(localStorage.getItem(DB_KEYS.PRODUCTS) || '[]');
      products = products.filter(p => p.id !== productId);
      localStorage.setItem(DB_KEYS.PRODUCTS, JSON.stringify(products));
    }
  }
};
