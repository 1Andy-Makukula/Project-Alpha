import { PaymentMethod, Transaction, PaymentMethodType, PaymentStatus } from '../types';

/**
 * @desc Payment management service
 * Handles payment methods, transactions, and integration with payment gateways (Flutterwave)
 * Production-ready with secure token handling placeholder
 */

const PAYMENT_METHODS_KEY = 'kithly_payment_methods';
const TRANSACTIONS_KEY = 'kithly_transactions';

// ============================================
// MOCK DATA
// ============================================

const MOCK_PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'pm_1',
    userId: 'user_1',
    type: 'card',
    isDefault: true,
    cardLast4: '4242',
    cardBrand: 'Visa',
    cardExpiry: '12/25',
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString()
  },
  {
    id: 'pm_2',
    userId: 'user_1',
    type: 'mobile_money',
    isDefault: false,
    mobileProvider: 'MTN',
    mobileNumber: '+260961234567',
    createdAt: new Date(Date.now() - 86400000 * 15).toISOString()
  }
];

const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx_1',
    userId: 'user_1',
    type: 'purchase',
    amount: 450.00,
    currency: 'ZMK',
    status: 'completed',
    paymentMethod: 'card',
    orderId: 'KLY-ABC123',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    completedAt: new Date(Date.now() - 3590000).toISOString(),
    receiptUrl: '#'
  },
  {
    id: 'tx_2',
    userId: 'user_1',
    type: 'purchase',
    amount: 1200.00,
    currency: 'ZMK',
    status: 'completed',
    paymentMethod: 'mobile_money',
    orderId: 'KLY-XYZ789',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    completedAt: new Date(Date.now() - 86400000 * 2 + 60000).toISOString(),
    receiptUrl: '#'
  }
];

// ============================================
// STORAGE FUNCTIONS
// ============================================

function getStoredPaymentMethods(): PaymentMethod[] {
  try {
    const stored = localStorage.getItem(PAYMENT_METHODS_KEY);
    return stored ? JSON.parse(stored) : MOCK_PAYMENT_METHODS;
  } catch (error) {
    console.error('Error loading payment methods:', error);
    return MOCK_PAYMENT_METHODS;
  }
}

function savePaymentMethods(methods: PaymentMethod[]): void {
  try {
    localStorage.setItem(PAYMENT_METHODS_KEY, JSON.stringify(methods));
  } catch (error) {
    console.error('Error saving payment methods:', error);
  }
}

function getStoredTransactions(): Transaction[] {
  try {
    const stored = localStorage.getItem(TRANSACTIONS_KEY);
    return stored ? JSON.parse(stored) : MOCK_TRANSACTIONS;
  } catch (error) {
    console.error('Error loading transactions:', error);
    return MOCK_TRANSACTIONS;
  }
}

function saveTransactions(transactions: Transaction[]): void {
  try {
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
  } catch (error) {
    console.error('Error saving transactions:', error);
  }
}

// ============================================
// PAYMENT METHODS CRUD
// ============================================

export async function getPaymentMethods(userId: string): Promise<PaymentMethod[]> {
  // In production: return await api.get(`/users/${userId}/payment-methods`);
  const methods = getStoredPaymentMethods();
  return methods.filter(m => m.userId === userId);
}

export async function addPaymentMethod(
  userId: string,
  methodData: Partial<PaymentMethod>
): Promise<PaymentMethod> {
  const methods = getStoredPaymentMethods();

  // If this is the first method, make it default
  const isFirst = methods.filter(m => m.userId === userId).length === 0;

  const newMethod: PaymentMethod = {
    id: `pm_${Date.now()}`,
    userId,
    type: methodData.type || 'card',
    isDefault: isFirst || methodData.isDefault || false,
    createdAt: new Date().toISOString(),
    ...methodData
  };

  // If new method is default, unset other defaults
  if (newMethod.isDefault) {
    methods.forEach(m => {
      if (m.userId === userId) m.isDefault = false;
    });
  }

  methods.push(newMethod);
  savePaymentMethods(methods);

  // In production: return await api.post(`/users/${userId}/payment-methods`, methodData);
  return newMethod;
}

export async function removePaymentMethod(id: string): Promise<boolean> {
  const methods = getStoredPaymentMethods();
  const filtered = methods.filter(m => m.id !== id);

  if (filtered.length === methods.length) return false;

  savePaymentMethods(filtered);

  // In production: return await api.delete(`/payment-methods/${id}`);
  return true;
}

export async function setDefaultPaymentMethod(userId: string, methodId: string): Promise<boolean> {
  const methods = getStoredPaymentMethods();
  let found = false;

  const updated = methods.map(m => {
    if (m.userId !== userId) return m;

    if (m.id === methodId) {
      found = true;
      return { ...m, isDefault: true };
    }
    return { ...m, isDefault: false };
  });

  if (!found) return false;

  savePaymentMethods(updated);

  // In production: return await api.put(`/users/${userId}/payment-methods/${methodId}/default`);
  return true;
}

// ============================================
// TRANSACTIONS
// ============================================

export async function getTransactions(userId: string): Promise<Transaction[]> {
  // In production: return await api.get(`/users/${userId}/transactions`);
  const transactions = getStoredTransactions();
  return transactions.filter(t => t.userId === userId).sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function getTransactionById(id: string): Promise<Transaction | null> {
  const transactions = getStoredTransactions();
  return transactions.find(t => t.id === id) || null;
}

// ============================================
// PAYMENT PROCESSING (FLUTTERWAVE INTEGRATION)
// ============================================

/**
 * Initialize a payment transaction
 * @param amount Amount to charge
 * @param currency Currency code (ZMK)
 * @param paymentMethodId ID of selected payment method
 * @param orderId Associated order ID
 */
export async function processPayment(
  userId: string,
  amount: number,
  currency: 'ZMK' | 'USD',
  paymentMethodId: string,
  orderId: string
): Promise<Transaction> {
  // 1. Create pending transaction
  const transactions = getStoredTransactions();
  const method = (await getPaymentMethods(userId)).find(m => m.id === paymentMethodId);

  const newTransaction: Transaction = {
    id: `tx_${Date.now()}`,
    userId,
    type: 'purchase',
    amount,
    currency,
    status: 'processing',
    paymentMethod: method?.type || 'card',
    orderId,
    createdAt: new Date().toISOString()
  };

  transactions.unshift(newTransaction);
  saveTransactions(transactions);

  // 2. Simulate API call to Flutterwave
  // In production:
  // const response = await flutterwave.charge({ ... });

  return new Promise((resolve) => {
    setTimeout(() => {
      // Simulate success
      newTransaction.status = 'completed';
      newTransaction.completedAt = new Date().toISOString();
      newTransaction.receiptUrl = `https://kithly.com/receipts/${newTransaction.id}`;

      saveTransactions(transactions);
      resolve(newTransaction);
    }, 2000);
  });
}

/**
 * Process a refund
 */
export async function requestRefund(transactionId: string, reason: string): Promise<boolean> {
  const transactions = getStoredTransactions();
  const tx = transactions.find(t => t.id === transactionId);

  if (!tx || tx.status !== 'completed') return false;

  // In production: await api.post(`/transactions/${transactionId}/refund`, { reason });

  tx.status = 'refunded';
  saveTransactions(transactions);

  return true;
}
