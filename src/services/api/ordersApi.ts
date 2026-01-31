/**
 * @file ordersApi.ts
 * @description API service for order operations.
 * Uses Firestore as the backend.
 */

import { Order } from '../../types';
import { firestoreOrdersService } from '../firestoreOrdersService';

/**
 * @desc Orders API Service
 * Uses Firestore for all operations
 */
export const ordersApi = {
  /**
   * @desc Retrieves all orders for the current user/shop
   */
  getAll: async (): Promise<Order[]> => {
    return firestoreOrdersService.getAll();
  },

  /**
   * @desc Retrieves a single order by collection code
   * @param {string} collectionCode - The unique collection code
   */
  getByCode: async (collectionCode: string): Promise<Order | null> => {
    return firestoreOrdersService.getByCode(collectionCode);
  },

  /**
   * @desc Retrieves a single order by ID
   * @param {string} orderId - The order ID
   */
  getById: async (orderId: string): Promise<Order | null> => {
    return firestoreOrdersService.getById(orderId);
  },

  /**
   * @desc Creates a new order
   * @param {Order} newOrder - The order data
   */
  create: async (newOrder: Order): Promise<Order> => {
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
    try {
      await firestoreOrdersService.markAsCollected(orderId);
      return true;
    } catch (error) {
      console.error('Failed to verify order:', error);
      return false;
    }
  },

  /**
   * @desc Updates order details
   * @param {string} orderId - The order ID
   * @param {Partial<Order>} updates - The fields to update
   */
  update: async (orderId: string, updates: Partial<Order>): Promise<Order> => {
    if (updates.status) {
      await firestoreOrdersService.updateStatus(orderId, updates.status);
    }
    const updated = await firestoreOrdersService.getById(orderId);
    if (!updated) throw new Error('Order not found');
    return updated;
  },

  /**
   * @desc Exports orders ready for dispatch to CSV
   */
  exportToCSV: async (): Promise<Blob> => {
    const orders = await firestoreOrdersService.getAll();

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
