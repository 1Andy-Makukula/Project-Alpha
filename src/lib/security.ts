/**
 * @file security.ts
 * @description Cryptographic security utilities for fraud-proof pickup codes
 * Uses HMAC-SHA256 to generate un-fakeable signatures
 */

import CryptoJS from 'crypto-js';

// Secret key for HMAC signing - should be set in environment variables
const SECRET_KEY = import.meta.env.VITE_QR_SECRET_KEY || 'kithly-development-secret-key-change-in-production';

/**
 * Generates a cryptographically signed pickup token for QR codes
 * Format: orderId:shopId:timestamp:signature
 * 
 * If a user changes ANY character in the Order ID or Shop ID, the signature will break
 * 
 * @param orderId - The order ID
 * @param shopId - The shop ID
 * @returns Signed token string
 */
export function generatePickupToken(orderId: string, shopId: number | string): string {
  const timestamp = Date.now();
  const payload = `${orderId}:${shopId}:${timestamp}`;
  const signature = CryptoJS.HmacSHA256(payload, SECRET_KEY).toString(CryptoJS.enc.Hex).substring(0, 16);

  return `${payload}:${signature}`;
}

/**
 * Verifies a pickup token signature
 * 
 * @param token - The full token string (orderId:shopId:timestamp:signature)
 * @returns Object with verification result and parsed data
 */
export function verifyPickupToken(token: string): {
  valid: boolean;
  orderId?: string;
  shopId?: string;
  timestamp?: number;
  expired?: boolean;
  error?: string;
} {
  try {
    const parts = token.split(':');
    if (parts.length !== 4) {
      return { valid: false, error: 'INVALID_TOKEN_FORMAT' };
    }

    const [orderId, shopId, timestampStr, signature] = parts;
    const timestamp = parseInt(timestampStr, 10);

    if (isNaN(timestamp)) {
      return { valid: false, error: 'INVALID_TIMESTAMP' };
    }

    // Check if token is expired (24 hours)
    const TOKEN_VALIDITY_MS = 24 * 60 * 60 * 1000;
    const isExpired = Date.now() - timestamp > TOKEN_VALIDITY_MS;

    // Regenerate signature with same payload
    const payload = `${orderId}:${shopId}:${timestampStr}`;
    const expectedSignature = CryptoJS.HmacSHA256(payload, SECRET_KEY).toString(CryptoJS.enc.Hex).substring(0, 16);

    // Constant-time comparison to prevent timing attacks
    let isValid = signature.length === expectedSignature.length;
    for (let i = 0; i < signature.length && i < expectedSignature.length; i++) {
      if (signature[i] !== expectedSignature[i]) {
        isValid = false;
      }
    }

    if (!isValid) {
      return { valid: false, error: 'INVALID_SIGNATURE' };
    }

    return {
      valid: true,
      orderId,
      shopId,
      timestamp,
      expired: isExpired
    };
  } catch (error) {
    console.error('[Security] Token verification error:', error);
    return { valid: false, error: 'VERIFICATION_FAILED' };
  }
}

/**
 * Generate a simple collection code (human-readable, for manual entry)
 * Format: KITH-XXXX-XXXX (8 alphanumeric characters)
 */
export function generateCollectionCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed ambiguous chars (I, O, 0, 1)
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `KITH-${code.substring(0, 4)}-${code.substring(4)}`;
}

/**
 * Hash a password for storage (not for authentication - use Firebase Auth)
 * This is for additional verification like shop portal PIN
 */
export function hashPin(pin: string): string {
  return CryptoJS.SHA256(pin + SECRET_KEY).toString(CryptoJS.enc.Hex);
}

/**
 * Verify a PIN against its hash
 */
export function verifyPin(pin: string, hash: string): boolean {
  const expectedHash = hashPin(pin);
  return expectedHash === hash;
}
