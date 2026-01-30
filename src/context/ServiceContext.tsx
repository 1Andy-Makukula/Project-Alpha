

import React, { createContext, useContext, useMemo, ReactNode } from 'react';
import { Order, Product } from '../types';
import { api } from '../services/api';
import { notify as mockNotify } from '../services/notificationService';

/**
 * @desc Defines the contract for all backend services.
 * This interface ensures that any service implementation (mock or real)
 * adheres to the same set of methods, making the backend swappable.
 * @todo This is the primary contract for the backend team to implement.
 */
interface ServiceContextType {
  /**
   * @desc Database-related operations.
   * @todo Implement collections for 'users', 'shops', etc.
   */
  db: {
    /**
     * @desc Manages all order-related database actions.
     */
    orders: {
      /**
       * @desc Retrieves all orders.
       * @returns {Promise<Order[]>} A promise that resolves to an array of orders.
       * @todo Replace with a real Firestore query, potentially with user-scoping and pagination.
       */
      getAll: () => Promise<Order[]>;
      /**
       * @desc Retrieves a single order by collection code.
       * @param {string} collectionCode - The unique collection code.
       * @returns {Promise<Order | null>} The order if found, null otherwise.
       * @todo Replace with a real Firestore query.
       */
      get: (collectionCode: string) => Promise<Order | null>;
      /**
       * @desc Creates a new order in the database.
       * @param {Order} order - The order object to create.
       * @returns {Promise<Order>} The created order, including its new ID.
       * @todo Replace with a `firestore.collection('orders').add()` call.
       */
      create: (order: Order) => Promise<Order>;
      /**
       * @desc Verifies an order and marks it as collected.
       * @param {string} orderId - The unique ID of the order to verify.
       * @param {'scan' | 'manual'} method - The method used for verification.
       * @returns {Promise<boolean>} True if verification was successful, false otherwise.
       * @todo This should trigger a Firebase Function to ensure atomicity.
       */
      verifyAndCollect: (orderId: string, method: 'scan' | 'manual') => Promise<boolean>;
    };
    /**
     * @desc Manages product-related database actions.
     */
    products: {
      /**
       * @desc Retrieves products, optionally filtered by shop.
       * @param {number} [shopId] - Optional ID of the shop to filter by.
       * @returns {Promise<Product[]>} An array of products.
       * @todo Implement Firestore query with a `where('shopId', '==', shopId)` filter.
       */
      getAll: (shopId?: number) => Promise<Product[]>;
      /**
       * @desc Adds a new product to the database.
       * @param {Product} product - The product to add.
       * @returns {Promise<Product>} The newly added product.
       * @todo Replace with `firestore.collection('products').add()`.
       */
      add: (product: Product) => Promise<Product>;
      /**
       * @desc Deletes a product from the database.
       * @param {number} productId - The ID of the product to delete.
       * @returns {Promise<void>}
       * @todo Replace with `firestore.collection('products').doc(productId).delete()`.
       */
      delete: (productId: number) => Promise<void>;
    };
  };
  /**
   * @desc Notification services for user communication.
   */
  notify: {
    /**
     * @desc Sends an SMS notification to a user.
     * @param {string} phone - The recipient's phone number.
     * @param {string} code - The collection code to send.
     * @param {string} shopName - The name of the shop for context.
     * @todo Integrate with a real SMS gateway like Twilio or Africa's Talking.
     */
    sendSMS: (phone: string, code: string, shopName: string) => void;
  };
}

/**
 * @desc React context for providing the service layer to the application.
 */
const ServiceContext = createContext<ServiceContextType | null>(null);

/**
 * @desc Provides the service layer to its children components.
 * This component is responsible for selecting the backend implementation
 * (e.g., mock stub or real Firebase) and making it available through the context.
 * @param {ReactNode} children - The child components to render.
 */
export const ServiceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  /**
   * The API layer now handles switching between mock and live data
   * based on the VITE_API_MODE environment variable.
   * No need to change this code when switching backends!
   */
  const services = useMemo(() => ({
    db: {
      orders: {
        getAll: api.orders.getAll,
        get: api.orders.getByCode, // Map getByCode to get for backwards compatibility
        create: api.orders.create,
        verifyAndCollect: api.orders.verifyAndCollect,
      },
      products: api.products,
    },
    notify: mockNotify
  }), []);

  return (
    <ServiceContext.Provider value={services}>
      {children}
    </ServiceContext.Provider>
  );
};

/**
 * @desc Custom hook for accessing the service layer from components.
 * This abstracts the `useContext` logic and provides a clean, typed way
 * for components to interact with backend services.
 * @returns {ServiceContextType} The service layer object.
 * @throws Will throw an error if used outside of a `ServiceProvider`.
 */
export const useServices = () => {
  const context = useContext(ServiceContext);
  if (!context) {
    throw new Error('useServices must be used within a ServiceProvider');
  }
  return context;
};
