/**
 * @file secureCheckoutService.ts
 * @description Secure checkout flow using the industry-standard patterns
 * Integrates atomic inventory, secure tokens, and tax compliance
 */

import { SecureOrderSchema, SecureOrderInput } from './validation';
import { generatePickupToken, generateCollectionCode } from './security';
import { calculateOrderFinancials, formatZMW } from './tax';
import { toNgwee } from '../utils/moneyUtils';
import { decrementMultipleStock } from '../services/inventoryService';
import { firestoreOrdersService } from '../services/firestoreOrdersService';
import { CartItem } from '../types';

// ==============================================
// TYPES
// ==============================================

export interface CheckoutResult {
  success: boolean;
  orderId?: string;
  txRef?: string;
  totalNgwee?: number;
  pickupCode?: string;
  error?: string;
  stockErrors?: string[];
}

export interface SecureCheckoutData {
  cart: CartItem[];
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shopId: number;
  shopName: string;
  message?: string;
  pickupTime?: string;
  isVatRegistered?: boolean;
}

// ==============================================
// SECURE CHECKOUT FLOW
// ==============================================

/**
 * Execute a secure checkout with atomic inventory locking
 * 
 * Flow:
 * 1. Validate inputs (Zod)
 * 2. Calculate totals with tax (integer math)
 * 3. Reserve inventory atomically (Firestore transaction)
 * 4. Create pending order
 * 5. Generate secure pickup token
 * 
 * @returns Checkout result with order ID and transaction reference
 */
export async function executeSecureCheckout(
  data: SecureCheckoutData
): Promise<CheckoutResult> {
  try {
    // 1. Validate inputs
    const validationResult = SecureOrderSchema.safeParse({
      shopId: data.shopId,
      products: data.cart.map(item => ({
        id: item.product.id,
        quantity: item.quantity,
      })),
      customerEmail: data.customerEmail,
      customerPhone: data.customerPhone,
      customerName: data.customerName,
      message: data.message,
      pickupTime: data.pickupTime,
    });

    if (!validationResult.success) {
      const errors = validationResult.error.issues.map(
        issue => `${issue.path.join('.')}: ${issue.message}`
      );
      return { success: false, error: 'VALIDATION_FAILED', stockErrors: errors };
    }

    // 2. Calculate totals with integer math
    const subtotalNgwee = data.cart.reduce(
      (sum, item) => sum + toNgwee(item.product.price) * item.quantity,
      0
    );

    const financials = calculateOrderFinancials(subtotalNgwee, data.isVatRegistered);

    // 3. ATOMIC INVENTORY LOCK
    // This prevents race conditions - if two users buy the last item,
    // only one will succeed
    const stockResult = await decrementMultipleStock(
      data.cart.map(item => ({
        productId: item.product.id.toString(),
        quantity: item.quantity,
      }))
    );

    if (!stockResult.success) {
      return {
        success: false,
        error: 'INSUFFICIENT_STOCK',
        stockErrors: [stockResult.error || 'Stock reservation failed']
      };
    }

    // 4. Create pending order
    const txRef = `KITH-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const collectionCode = generateCollectionCode();

    const orderId = await firestoreOrdersService.create({
      customerName: data.customerName,
      customerAvatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(data.customerName)}`,
      paidOn: new Date().toISOString(),
      collectedOn: null,
      total: financials.totalNgwee / 100, // Convert back to ZMW for display
      itemCount: data.cart.reduce((sum, item) => sum + item.quantity, 0),
      status: 'pending',
      collectionCode,
      shopName: data.shopName,
      shopId: data.shopId,
      message: data.message,
      items: data.cart.map(item => ({
        productId: item.product.id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
      })),
      pickupTime: data.pickupTime,
      recipient_phone: data.customerPhone,
    });

    // 5. Generate secure pickup token
    const pickupToken = generatePickupToken(orderId, data.shopId);

    console.log('[Checkout] Order created successfully:', orderId);

    return {
      success: true,
      orderId,
      txRef,
      totalNgwee: financials.totalNgwee,
      pickupCode: collectionCode,
    };

  } catch (error: any) {
    console.error('[Checkout] Failed:', error);
    return {
      success: false,
      error: error.message || 'CHECKOUT_FAILED'
    };
  }
}

/**
 * Get a summary of checkout financials for display
 */
export function getCheckoutSummary(
  cart: CartItem[],
  isVatRegistered: boolean = false
) {
  const subtotalNgwee = cart.reduce(
    (sum, item) => sum + toNgwee(item.product.price) * item.quantity,
    0
  );

  const financials = calculateOrderFinancials(subtotalNgwee, isVatRegistered);

  return {
    subtotal: formatZMW(financials.subtotalNgwee),
    taxType: financials.tax.taxType,
    taxAmount: formatZMW(financials.tax.taxAmountNgwee),
    kithlyFee: formatZMW(financials.kithlyFeeNgwee),
    processingFee: formatZMW(financials.processingFeeNgwee),
    total: formatZMW(financials.totalNgwee),
    shopPayout: formatZMW(financials.shopPayoutNgwee),
    // Raw values for payment
    subtotalNgwee: financials.subtotalNgwee,
    totalNgwee: financials.totalNgwee,
  };
}
