import { PaymentMethod, Transaction } from '../types';

const API_BASE_URL = 'http://localhost/kithly-api/api';

// ============================================
// TRANSACTIONS
// ============================================

export async function getTransactions(userId: string): Promise<Transaction[]> {
    // For MVP, we might not have a transaction history endpoint yet,
    // or we can mock it based on orders if we had a user_id context.
    return [];
}

export async function getTransactionById(id: string): Promise<Transaction | null> {
    return null;
}

// ============================================
// PAYMENT PROCESSING (FLUTTERWAVE INTEGRATION)
// ============================================

/**
 * Initialize a payment transaction
 */
export async function processPayment(
  userId: string,
  amount: number,
  currency: 'ZMK' | 'USD',
  paymentMethodId: string,
  orderId: string
): Promise<Transaction> {

  // 1. Create order in PHP Backend
  try {
      // In a real app, userId would be actual user ID. For MVP/Guest:
      const payload = {
          buyer_id: 1, // Hardcoded for MVP or fetch from auth context
          shop_id: 1, // This should come from the cart/order context
          recipient_phone: "0960000000",
          total_amount: amount
      };

      const response = await fetch(`${API_BASE_URL}/orders.php`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
      });

      const orderData = await response.json();

      if (!orderData.id) throw new Error("Failed to create order");

      // 2. Return a transaction object representing this pending order
      // The actual Flutterwave integration would happen here or in the UI component
      // using the Flutterwave React hook, passing `orderData.id` as reference.

      return {
        id: `tx_${orderData.id}`,
        userId,
        type: 'purchase',
        amount,
        currency,
        status: orderData.status === 'Paid' ? 'completed' : 'pending',
        paymentMethod: 'card', // simplified
        orderId: String(orderData.id),
        createdAt: new Date().toISOString()
      };

  } catch (e) {
      console.error("Payment processing error", e);
      throw e;
  }
}

// Stub other functions to keep TypeScript happy
export async function getPaymentMethods(userId: string): Promise<PaymentMethod[]> { return []; }
export async function addPaymentMethod(userId: string, methodData: Partial<PaymentMethod>): Promise<PaymentMethod> { return {} as any; }
export async function removePaymentMethod(id: string): Promise<boolean> { return true; }
export async function setDefaultPaymentMethod(userId: string, methodId: string): Promise<boolean> { return true; }
export async function requestRefund(transactionId: string, reason: string): Promise<boolean> { return true; }
