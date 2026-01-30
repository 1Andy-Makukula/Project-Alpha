/**
 * @file validation.ts
 * @description Enhanced validation schemas for orders and webhooks
 * This extends the base validationSchemas.ts with additional security checks
 */

import { z } from 'zod';
import { zambianPhoneSchema, emailSchema } from '../utils/validationSchemas';

// ==============================================
// ORDER VALIDATION (Enhanced with anti-scalper limits)
// ==============================================

export const SecureOrderItemSchema = z.object({
  id: z.number().int().positive('Invalid product ID'),
  quantity: z.number().int().min(1, 'Minimum 1 item').max(10, 'Maximum 10 per item (anti-scalper)'),
});

export const SecureOrderSchema = z.object({
  shopId: z.number().int().positive('Invalid shop ID'),
  products: z.array(SecureOrderItemSchema)
    .min(1, 'Order must have at least one item')
    .max(20, 'Maximum 20 different items per order'),
  customerEmail: emailSchema,
  customerPhone: zambianPhoneSchema,
  customerName: z.string().min(2).max(100),
  message: z.string().max(500).optional(),
  pickupTime: z.string().max(50).optional(),
});

export type SecureOrderInput = z.infer<typeof SecureOrderSchema>;

// ==============================================
// WEBHOOK VALIDATION (Flutterwave)
// ==============================================

export const FlutterwaveWebhookDataSchema = z.object({
  id: z.number(),
  tx_ref: z.string(),
  flw_ref: z.string(),
  amount: z.number().positive(),
  currency: z.literal('ZMW'),
  status: z.enum(['successful', 'failed', 'pending']),
  charged_amount: z.number().optional(),
  app_fee: z.number().optional(),
  merchant_fee: z.number().optional(),
  customer: z.object({
    email: z.string().email().optional(),
    phone_number: z.string().optional(),
    name: z.string().optional(),
  }).optional(),
});

export const FlutterwaveWebhookSchema = z.object({
  event: z.string(),
  'event.type': z.string().optional(),
  data: FlutterwaveWebhookDataSchema,
});

export type FlutterwaveWebhookPayload = z.infer<typeof FlutterwaveWebhookSchema>;

// ==============================================
// PICKUP VERIFICATION
// ==============================================

export const PickupVerificationSchema = z.object({
  /** The signed QR token or manual collection code */
  code: z.string().min(8).max(100),
  /** Shop ID performing the verification */
  shopId: z.number().int().positive(),
  /** Staff member scanning (optional for audit) */
  staffId: z.string().optional(),
});

export type PickupVerificationInput = z.infer<typeof PickupVerificationSchema>;
