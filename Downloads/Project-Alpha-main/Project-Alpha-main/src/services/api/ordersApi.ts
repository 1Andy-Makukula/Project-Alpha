/**
 * @file ordersApi.ts
 * @description API service for order operations.
 * This will call the Django backend when ready.
 */

import { Order } from '../../types';
import { API_ENDPOINTS, isMockMode } from '../../config/api.config';
import { httpClient } from './httpClient';
import { db as mockDb } from '../mockDatabase';

/**
 * @desc Orders API Service
 * Switches between mock data and real API based on configuration
 */
export const ordersApi = {
  /**
   * @desc Retrieves all orders for the current user/shop
   */
  getAll: async (): Promise<Order[]> => {
    if (isMockMode()) {
      return mockDb.orders.getAll();
    }

    return httpClient.get<Order[]>(API_ENDPOINTS.ORDERS.LIST);
  },

  /**
   * @desc Retrieves a single order by collection code
   * @param {string} collectionCode - The unique collection code
   */
  getByCode: async (collectionCode: string): Promise<Order | null> => {
    if (isMockMode()) {
      return mockDb.orders.get(collectionCode);
    }

    try {
      return await httpClient.get<Order>(
        API_ENDPOINTS.ORDERS.BY_CODE(collectionCode)
      );
    } catch (error: any) {
      if (error.statusCode === 404) {
        return null;
      }
      throw error;
    }
  },

  /**
   * @desc Retrieves a single order by ID
   * @param {string} orderId - The order ID
   */
  getById: async (orderId: string): Promise<Order | null> => {
    if (isMockMode()) {
      const orders = await mockDb.orders.getAll();
      return orders.find(o => o.id === orderId) || null;
    }

    try {
      return await httpClient.get<Order>(API_ENDPOINTS.ORDERS.DETAIL(orderId));
    } catch (error: any) {
      if (error.statusCode === 404) {
        return null;
      }
      throw error;
    }
  },

  /**
   * @desc Creates a new order
   * @param {Order} newOrder - The order data
   */
  create: async (newOrder: Order): Promise<Order> => {
    if (isMockMode()) {
      return mockDb.orders.create(newOrder);
    }

    return httpClient.post<Order>(API_ENDPOINTS.ORDERS.CREATE, newOrder);
  },

  /**
   * @desc Verifies and marks an order as collected
   * @param {string} orderId - The order ID
   * @param {'scan' | 'manual'} method - Verification method
   */
  verifyAndCollect: async (
    orderId: string,
    method: 'scan' | 'manual'
  ): Promise<boolean> => {
    if (isMockMode()) {
      return mockDb.orders.verifyAndCollect(orderId, method);
    }

    try {
      await httpClient.patch(API_ENDPOINTS.ORDERS.VERIFY(orderId), {
        verificationMethod: method,
      });
      return true;
    } catch (error) {
      console.error('Failed to verify order:', error);
      return false;
    }
  },

  /**
   * @desc Updates order details (e.g., delivery coordinates)
   * @param {string} orderId - The order ID
   * @param {Partial<Order>} updates - The fields to update
   */
  update: async (orderId: string, updates: Partial<Order>): Promise<Order> => {
    if (isMockMode()) {
      // Mock update by fetching, merging, and returning
      const orders = await mockDb.orders.getAll();
      const order = orders.find(o => o.id === orderId);
      if (!order) {
        throw new Error('Order not found');
      }
      return { ...order, ...updates };
    }

    return httpClient.patch<Order>(
      API_ENDPOINTS.ORDERS.DETAIL(orderId),
      updates
    );
  },

  /**
   * @desc Exports orders ready for dispatch to CSV for Yango
   * (Shop Portal feature)
   */
  exportToCSV: async (): Promise<Blob> => {
    if (isMockMode()) {
      // Return a mock CSV blob
      const csvContent = 'orderId,customerName,deliveryAddress\n123,John Doe,Sample Address';
      return new Blob([csvContent], { type: 'text/csv' });
    }

    const response = await fetch(
      `${httpClient['baseURL']}${API_ENDPOINTS.ORDERS.EXPORT_CSV}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('kithly_auth_token')}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to export CSV');
    }

    return response.blob();
  },
};
