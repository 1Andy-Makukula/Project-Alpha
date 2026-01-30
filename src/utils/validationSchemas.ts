/**
 * @file validationSchemas.ts
 * @description Zod validation schemas for all user inputs
 * Prevents XSS attacks and malformed data from reaching the database
 */

import { z } from 'zod';

// ==============================================
// COMMON VALIDATORS
// ==============================================

/** Zambian phone number: +260 followed by 9 digits */
export const zambianPhoneSchema = z
  .string()
  .regex(/^\+260\d{9}$/, 'Phone must be a valid Zambian number (+260XXXXXXXXX)');

/** Safe text that strips potential XSS content */
const stripHtmlTags = (val: string) => val.replace(/<[^>]*>/g, '');

/** Safe short text (max 500 chars) - strips HTML tags */
export const safeShortTextSchema = z
  .string()
  .max(500, 'Text too long')
  .transform(stripHtmlTags);

/** Safe long text (max 1000 chars) - strips HTML tags */
export const safeLongTextSchema = z
  .string()
  .max(1000, 'Text too long')
  .transform(stripHtmlTags);

/** Email validation */
export const emailSchema = z.string().email('Invalid email address');

// ==============================================
// PAYMENT INFO SCHEMA
// ==============================================

export const PaymentInfoSchema = z.object({
  bankName: z.string().max(100, 'Bank name too long').optional(),
  accountNumber: z
    .string()
    .regex(/^\d{10,16}$/, 'Account number must be 10-16 digits')
    .optional(),
  accountName: z.string().max(100, 'Account name too long').optional(),
  branchCode: z.string().max(10, 'Branch code too long').optional(),
  mobileMoneyNumber: zambianPhoneSchema.optional(),
  mobileMoneyProvider: z.enum(['MTN', 'Airtel', 'Zamtel']).optional(),
});

export type PaymentInfo = z.infer<typeof PaymentInfoSchema>;

// ==============================================
// ORDER SCHEMAS
// ==============================================

export const OrderItemSchema = z.object({
  productId: z.number().int().positive('Invalid product ID'),
  quantity: z.number().int().positive('Quantity must be at least 1'),
  price: z.number().positive('Price must be positive'),
  name: z.string().max(200).optional(),
});

export const OrderCreateSchema = z.object({
  customerName: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name too long')
    .transform((val) => val.trim()),
  customerEmail: emailSchema.optional(),
  customerPhone: zambianPhoneSchema.optional(),
  total: z.number().positive('Total must be positive'),
  items: z.array(OrderItemSchema).min(1, 'Order must have at least one item'),
  message: safeShortTextSchema.optional(),
  shopId: z.number().int().positive().optional(),
  shopName: z.string().max(100).optional(),
  pickupTime: z.string().max(50).optional(),
  orderType: z.enum(['request', 'instant']).optional(),
});

export type OrderCreateInput = z.infer<typeof OrderCreateSchema>;

// ==============================================
// SHOP SCHEMAS
// ==============================================

export const ShopUpdateSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  description: safeLongTextSchema.optional(),
  category: z.string().max(50).optional(),
  location: z.string().max(100).optional(),
  address: z.string().max(200).optional(),
  phone: zambianPhoneSchema.optional(),
  openingHours: z.string().max(50).optional(),
  paymentInfo: PaymentInfoSchema.optional(),
  profilePic: z.string().url().optional(),
  coverImg: z.string().url().optional(),
});

export type ShopUpdateInput = z.infer<typeof ShopUpdateSchema>;

export const ShopOnboardingSchema = z.object({
  name: z.string().min(2, 'Shop name required').max(100),
  ownerName: z.string().min(2).max(100),
  ownerEmail: emailSchema,
  ownerPhone: zambianPhoneSchema,
  category: z.string().min(1, 'Category required').max(50),
  location: z.string().min(1, 'Location required').max(100),
  region: z.string().max(50).optional(),
  termsAccepted: z.literal(true, {
    message: 'You must accept the terms and conditions',
  }),
});

export type ShopOnboardingInput = z.infer<typeof ShopOnboardingSchema>;

// ==============================================
// USER SCHEMAS
// ==============================================

export const UserRegistrationSchema = z.object({
  email: emailSchema,
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  displayName: z.string().min(2).max(50),
  phone: zambianPhoneSchema.optional(),
});

export type UserRegistrationInput = z.infer<typeof UserRegistrationSchema>;

export const RecipientInfoSchema = z.object({
  name: z.string().min(2, 'Name required').max(100),
  email: emailSchema,
  phone: zambianPhoneSchema,
});

export type RecipientInfo = z.infer<typeof RecipientInfoSchema>;

// ==============================================
// VALIDATION HELPER
// ==============================================

/**
 * Validate data against a schema and return parsed result or errors
 */
export function validateInput<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: string[] } {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  const errors = result.error.issues.map(
    (issue) => `${issue.path.join('.')}: ${issue.message}`
  );

  return { success: false, errors };
}
