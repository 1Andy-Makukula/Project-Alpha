import { Shop } from '../types';

/**
 * Validation utilities for shop onboarding
 */

/**
 * Check if all setup steps are complete
 */
export const isSetupComplete = (shop: Shop): boolean => {
  return (
    shop.setupProgress.step1_basicInfo &&
    shop.setupProgress.step2_location &&
    shop.setupProgress.step3_branding &&
    shop.setupProgress.step4_products &&
    shop.setupProgress.step5_payment
  );
};

/**
 * Check if shop can go live
 */
export const canGoLive = (shop: Shop, hasProducts: boolean = false): boolean => {
  return (
    shop.emailVerified &&
    shop.termsAccepted &&
    isSetupComplete(shop) &&
    hasProducts
  );
};

/**
 * Get setup progress percentage
 */
export const getSetupProgress = (shop: Shop): number => {
  const steps = Object.values(shop.setupProgress);
  const completed = steps.filter(Boolean).length;
  return Math.round((completed / steps.length) * 100);
};

/**
 * Get next incomplete step
 */
export const getNextStep = (shop: Shop): number => {
  if (!shop.setupProgress.step1_basicInfo) return 1;
  if (!shop.setupProgress.step2_location) return 2;
  if (!shop.setupProgress.step3_branding) return 3;
  if (!shop.setupProgress.step4_products) return 4;
  if (!shop.setupProgress.step5_payment) return 5;
  return 6; // Review step
};

/**
 * Validate shop name
 */
export const validateShopName = (name: string): { valid: boolean; error?: string } => {
  if (!name || name.trim().length === 0) {
    return { valid: false, error: 'Shop name is required' };
  }
  if (name.length < 3) {
    return { valid: false, error: 'Shop name must be at least 3 characters' };
  }
  if (name.length > 50) {
    return { valid: false, error: 'Shop name must be less than 50 characters' };
  }
  return { valid: true };
};

/**
 * Validate opening hours format
 */
export const validateOpeningHours = (hours: string): { valid: boolean; error?: string } => {
  const pattern = /^\d{2}:\d{2}\s*-\s*\d{2}:\d{2}$/;
  if (!pattern.test(hours)) {
    return { valid: false, error: 'Invalid format. Use HH:MM - HH:MM (e.g., 08:00 - 18:00)' };
  }
  return { valid: true };
};
