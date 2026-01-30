/**
 * @file ordersApi.ts
 * @description API service for order operations.
 * Uses Firestore as the backend.
 */

import { Order } from '../../types';
import { isMockMode } from '../../config/api.config';
import { db as mockDb } from '../mockDatabase';
import { firestoreOrdersService } from '../firestoreOrdersService';

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

    // Use Firestore
    return firestoreOrdersService.getAll();
  },

  /**
   * @desc Retrieves a single order by collection code
   * @param {string} collectionCode - The unique collection code
   */
  getByCode: async (collectionCode: string): Promise<Order | null> => {
    if (isMockMode()) {
      return mockDb.orders.get(collectionCode);
    }

    // Use Firestore
    return firestoreOrdersService.getByCode(collectionCode);
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

    // Use Firestore
    return firestoreOrdersService.getById(orderId);
  },

  /**
   * @desc Creates a new order
   * @param {Order} newOrder - The order data
   */
  create: async (newOrder: Order): Promise<Order> => {
    if (isMockMode()) {
      return mockDb.orders.create(newOrder);
    }

    // Use Firestore
    const id = await firestoreOrdersService.create(newOrder);
    return { ...newOrder, id };
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

    // Use Firestore
    try {
      await firestoreOrdersService.markAsCollected(orderId);
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

    // Use Firestore - update status if provided
    if (updates.status) {
      await firestoreOrdersService.updateStatus(orderId, updates.status);
    }
    const updated = await firestoreOrdersService.getById(orderId);
    if (!updated) throw new Error('Order not found');
    return updated;
  },

  /**
   * @desc Exports orders ready for dispatch to CSV
   * Generates CSV locally from Firestore data
   */
  exportToCSV: async (): Promise<Blob> => {
    // Get all orders from Firestore (or mock)
    const orders = isMockMode()
      ? await mockDb.orders.getAll()
      : await firestoreOrdersService.getAll();

    // Filter for orders that are paid (ready for pickup)
    const readyOrders = orders.filter(o => o.status === 'paid');

    // Build CSV content
    const headers = 'OrderID,CustomerName,RecipientPhone,ShopId,Total,Status,PaidOn';
    const rows = readyOrders.map(o =>
      `${o.id},${o.customerName},${o.recipient_phone || ''},${o.shopId},${o.total},${o.status},${o.paidOn}`
    );

    const csvContent = [headers, ...rows].join('\n');
    return new Blob([csvContent], { type: 'text/csv' });
  },
};
