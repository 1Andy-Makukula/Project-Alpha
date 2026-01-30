/**
 * @file inventoryService.ts
 * @description Atomic inventory operations using Firestore transactions
 * Prevents race conditions where two users buy the last item simultaneously
 */

import { runTransaction, doc, increment, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import { COLLECTIONS } from '../config/api.config';

interface StockResult {
  success: boolean;
  error?: string;
  newStock?: number;
}

/**
 * Atomically decrement stock for a product
 * Uses Firestore transaction to prevent race conditions
 * 
 * @param productId - The product document ID
 * @param quantity - Amount to decrement
 * @returns Result object with success status
 */
export async function decrementStock(
  productId: string,
  quantity: number
): Promise<StockResult> {
  const productRef = doc(db, COLLECTIONS.PRODUCTS, productId);

  try {
    const newStock = await runTransaction(db, async (transaction) => {
      const productDoc = await transaction.get(productRef);

      if (!productDoc.exists()) {
        throw new Error('PRODUCT_NOT_FOUND');
      }

      const currentStock = productDoc.data()?.stock ?? 0;

      if (currentStock < quantity) {
        throw new Error('INSUFFICIENT_STOCK');
      }

      const updatedStock = currentStock - quantity;
      transaction.update(productRef, { stock: updatedStock });

      return updatedStock;
    });

    return { success: true, newStock };
  } catch (error: any) {
    console.error('Stock decrement failed:', error);
    return {
      success: false,
      error: error.message || 'STOCK_UPDATE_FAILED'
    };
  }
}

/**
 * Atomically decrement stock for multiple products in a single transaction
 * All-or-nothing: if any product fails, the entire operation is rolled back
 * 
 * @param items - Array of {productId, quantity} objects
 * @returns Result object with success status
 */
export async function decrementMultipleStock(
  items: Array<{ productId: string; quantity: number }>
): Promise<StockResult> {
  try {
    await runTransaction(db, async (transaction) => {
      // First, read all products and validate stock
      const productData: Array<{ ref: any; currentStock: number; quantity: number }> = [];

      for (const item of items) {
        const productRef = doc(db, COLLECTIONS.PRODUCTS, item.productId);
        const productDoc = await transaction.get(productRef);

        if (!productDoc.exists()) {
          throw new Error(`PRODUCT_NOT_FOUND: ${item.productId}`);
        }

        const currentStock = productDoc.data()?.stock ?? 0;

        if (currentStock < item.quantity) {
          throw new Error(`INSUFFICIENT_STOCK: ${item.productId}`);
        }

        productData.push({
          ref: productRef,
          currentStock,
          quantity: item.quantity,
        });
      }

      // All validations passed, now update all products
      for (const data of productData) {
        transaction.update(data.ref, {
          stock: data.currentStock - data.quantity
        });
      }
    });

    return { success: true };
  } catch (error: any) {
    console.error('Multi-stock decrement failed:', error);
    return {
      success: false,
      error: error.message || 'STOCK_UPDATE_FAILED'
    };
  }
}

/**
 * Restore stock when an order is cancelled or refunded
 * 
 * @param productId - The product document ID
 * @param quantity - Amount to restore
 */
export async function restoreStock(
  productId: string,
  quantity: number
): Promise<StockResult> {
  const productRef = doc(db, COLLECTIONS.PRODUCTS, productId);

  try {
    await runTransaction(db, async (transaction) => {
      const productDoc = await transaction.get(productRef);

      if (!productDoc.exists()) {
        throw new Error('PRODUCT_NOT_FOUND');
      }

      const currentStock = productDoc.data()?.stock ?? 0;
      transaction.update(productRef, { stock: currentStock + quantity });
    });

    return { success: true };
  } catch (error: any) {
    console.error('Stock restore failed:', error);
    return {
      success: false,
      error: error.message || 'STOCK_RESTORE_FAILED'
    };
  }
}

/**
 * Check if sufficient stock exists (read-only, no locking)
 * Use this for UI display only, not for actual purchase decisions
 */
export async function checkStock(productId: string): Promise<number> {
  const productRef = doc(db, COLLECTIONS.PRODUCTS, productId);
  const productDoc = await getDoc(productRef);

  if (!productDoc.exists()) {
    return 0;
  }

  return productDoc.data()?.stock ?? 0;
}
