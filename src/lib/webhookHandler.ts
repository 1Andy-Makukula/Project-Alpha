/**
 * @file webhookHandler.ts
 * @description Secure webhook handler for Flutterwave payment notifications
 * 
 * IMPORTANT: In production, this should run on a server (Firebase Functions, Vercel Edge, etc.)
 * This file provides the logic that would be used in a serverless function
 */

import { FlutterwaveWebhookSchema, FlutterwaveWebhookPayload } from './validation';
import { generatePickupToken, generateCollectionCode } from './security';
import { firestoreOrdersService } from '../services/firestoreOrdersService';
import { updateDocument, COLLECTIONS, stringToTimestamp } from '../services/firestoreService';

// ==============================================
// WEBHOOK VERIFICATION
// ==============================================

/**
 * Verify that a webhook request is authentically from Flutterwave
 * Uses the secret hash configured in your Flutterwave dashboard
 */
export function verifyWebhookSignature(
  requestHash: string | null,
  expectedHash: string
): boolean {
  if (!requestHash) return false;

  // Constant-time comparison to prevent timing attacks
  if (requestHash.length !== expectedHash.length) return false;

  let isEqual = true;
  for (let i = 0; i < requestHash.length; i++) {
    if (requestHash[i] !== expectedHash[i]) {
      isEqual = false;
    }
  }
  return isEqual;
}

// ==============================================
// WEBHOOK PROCESSING
// ==============================================

export interface WebhookResult {
  success: boolean;
  message: string;
  orderId?: string;
  alreadyProcessed?: boolean;
}

/**
 * Process a Flutterwave webhook payload
 * Handles the "charge.completed" event for successful payments
 * 
 * This function is IDEMPOTENT - calling it multiple times with the same
 * payload will not cause duplicate processing
 */
export async function processFlutterwaveWebhook(
  payload: unknown,
  secretHash: string,
  requestHash: string | null
): Promise<WebhookResult> {

  // 1. Verify webhook authenticity
  if (!verifyWebhookSignature(requestHash, secretHash)) {
    console.error('[Webhook] Invalid signature - request rejected');
    return { success: false, message: 'UNAUTHORIZED' };
  }

  // 2. Validate payload structure
  const parseResult = FlutterwaveWebhookSchema.safeParse(payload);
  if (!parseResult.success) {
    console.error('[Webhook] Invalid payload:', parseResult.error);
    return { success: false, message: 'INVALID_PAYLOAD' };
  }

  const webhookData = parseResult.data;

  // 3. Only process successful payments
  if (webhookData.data.status !== 'successful') {
    console.log(`[Webhook] Ignoring non-successful status: ${webhookData.data.status}`);
    return { success: true, message: 'STATUS_IGNORED' };
  }

  const txRef = webhookData.data.tx_ref;

  // 4. Find the order by transaction reference
  // Note: In production, you'd query by tx_ref field
  // For now, we parse the order ID from tx_ref (format: KITH-timestamp-orderId)
  const orderIdMatch = txRef.match(/KITH-\d+-(.+)/);
  const orderId = orderIdMatch ? orderIdMatch[1] : txRef;

  const order = await firestoreOrdersService.getById(orderId);

  if (!order) {
    console.error(`[Webhook] Order not found: ${orderId}`);
    return { success: false, message: 'ORDER_NOT_FOUND', orderId };
  }

  // 5. IDEMPOTENCY CHECK - prevent double processing
  if (order.status === 'paid' || order.status === 'collected') {
    console.log(`[Webhook] Order ${orderId} already processed with status: ${order.status}`);
    return {
      success: true,
      message: 'ALREADY_PROCESSED',
      orderId,
      alreadyProcessed: true
    };
  }

  // 6. Generate secure pickup token
  const securePickupToken = generatePickupToken(orderId, order.shopId || 0);
  const collectionCode = order.collectionCode || generateCollectionCode();

  // 7. Update order status to PAID
  // 7. Update order status to PAID and FISCALIZE
  // First, fetch Shop info for ZRA
  let zraData: any = {};

  if (order.shopId) {
    try {
      const { firestoreShopsService } = await import('../services/firestoreShopsService');
      const { zraService } = await import('../services/zraService');
      const { toNgwee } = await import('../utils/moneyUtils');

      const shop = await firestoreShopsService.getById(order.shopId.toString());

      if (shop) {
        // Fiscalize
        const fiscalResult = await zraService.fiscalizeOrder({
          id: orderId,
          totalAmountCents: toNgwee(order.total), // Convert ZMW to ngwee
          items: order.items.map((item: any) => ({
            name: item.name || 'Unknown Item',
            quantity: item.quantity || 1,
            priceInCents: toNgwee(item.price || 0) // Assume price is ZMW
          })),
          customerName: order.customerName
        }, {
          tpin: shop.tpin || '0000000000',
          taxCategory: shop.taxCategory || 'NONE',
          shopName: shop.name
        });

        if (fiscalResult.success) {
          zraData = {
            zraFiscalNumber: fiscalResult.fiscalNumber,
            zraQrData: fiscalResult.qrString,
            taxAmountCents: fiscalResult.breakdown.tax,
            taxCategorySnapshot: fiscalResult.breakdown.category
          };
        }
      }
    } catch (err) {
      console.error('[Webhook] ZRA Fiscalization failed (non-blocking):', err);
    }
  }

  // Update order with Paid status AND ZRA data
  await updateDocument(COLLECTIONS.ORDERS, orderId, {
    status: 'paid',
    paidOn: stringToTimestamp(new Date().toISOString()),
    pickup_code: securePickupToken, // Secure duplicate field for legacy references
    collectionCode: collectionCode,
    ...zraData
  });

  // Note: we manually did the update above instead of calling verify(), 
  // because verify() only updates status.

  /* 
  Old call:
  const verifyResult = await firestoreOrdersService.verify(orderId);
  if (!verifyResult.success) ...
  */

  return {
    success: true,
    message: 'PAYMENT_CONFIRMED',
    orderId,
    alreadyProcessed: false
  };

  /*
  if (!verifyResult.success) {
    console.error(`[Webhook] Failed to update order ${orderId}`);
    return { success: false, message: 'UPDATE_FAILED', orderId };
  }
  */

  console.log(`[Webhook] Successfully processed payment for order ${orderId}`);

  return {
    success: true,
    message: 'PAYMENT_CONFIRMED',
    orderId,
    alreadyProcessed: false
  };
}

/**
 * Example Firebase Cloud Function handler
 * Deploy this to Firebase Functions for production use
 * 
 * @example
 * // In functions/index.ts:
 * import { onRequest } from 'firebase-functions/v2/https';
 * export const flutterwaveWebhook = onRequest(async (req, res) => {
 *   const result = await processFlutterwaveWebhook(
 *     req.body,
 *     process.env.FLW_SECRET_HASH!,
 *     req.headers['verif-hash'] as string
 *   );
 *   res.status(result.success ? 200 : 400).json(result);
 * });
 */
