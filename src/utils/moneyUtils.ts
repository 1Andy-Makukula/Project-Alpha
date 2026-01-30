/**
 * @file moneyUtils.ts
 * @description Safe money operations using integers to avoid floating-point errors
 * All internal operations use ngwee (1 ZMW = 100 ngwee) to prevent rounding issues
 */

/**
 * Convert display amount (ZMW as float) to storage amount (ngwee as integer)
 * @param zmw - Amount in Zambian Kwacha (e.g., 19.99)
 * @returns Amount in ngwee (e.g., 1999)
 */
export const toNgwee = (zmw: number): number => Math.round(zmw * 100);

/**
 * Convert storage amount (ngwee) to display string (ZMW)
 * @param ngwee - Amount in ngwee (e.g., 1999)
 * @returns Formatted string (e.g., "19.99")
 */
export const toZMW = (ngwee: number): string => (ngwee / 100).toFixed(2);

/**
 * Convert storage amount (ngwee) to display number (ZMW)
 * @param ngwee - Amount in ngwee (e.g., 1999)
 * @returns Number in ZMW (e.g., 19.99)
 */
export const ngweeToZMW = (ngwee: number): number => ngwee / 100;

/**
 * Calculate percentage fee using integer math
 * Uses Banker's rounding (round half to even) for fairness
 * @param amountNgwee - Base amount in ngwee
 * @param ratePercent - Rate as percentage (e.g., 5 for 5%)
 * @returns Fee amount in ngwee
 */
export const calculateFee = (amountNgwee: number, ratePercent: number): number => {
  // Multiply first to maintain precision, divide last
  // (amount * rate * 100) / 10000 = (amount * rate) / 100
  const rawFee = (amountNgwee * ratePercent * 100) / 10000;
  return Math.round(rawFee);
};

/**
 * Calculate commission (rounds DOWN to favor the shop)
 * @param amountNgwee - Base amount in ngwee
 * @param ratePercent - Rate as percentage (e.g., 5 for 5%)
 * @returns Commission amount in ngwee
 */
export const calculateCommission = (amountNgwee: number, ratePercent: number): number => {
  return Math.floor((amountNgwee * ratePercent) / 100);
};

/**
 * Add multiple ngwee amounts safely
 * @param amounts - Array of amounts in ngwee
 * @returns Sum in ngwee
 */
export const sumNgwee = (...amounts: number[]): number => {
  return amounts.reduce((sum, amount) => sum + Math.round(amount), 0);
};

/**
 * Format amount for display with currency symbol
 * @param ngwee - Amount in ngwee
 * @param includeCurrency - Whether to include "ZMW" prefix
 * @returns Formatted string (e.g., "ZMW 19.99")
 */
export const formatCurrency = (ngwee: number, includeCurrency: boolean = true): string => {
  const formatted = toZMW(ngwee);
  return includeCurrency ? `ZMW ${formatted}` : formatted;
};

/**
 * Calculate order totals with all fees
 * @param subtotalNgwee - Subtotal in ngwee
 * @param kithlyFeeRate - KithLy fee percentage (default 5%)
 * @param processingFeeRate - Payment processing fee percentage (default 2.9%)
 */
export const calculateOrderTotals = (
  subtotalNgwee: number,
  kithlyFeeRate: number = 5,
  processingFeeRate: number = 2.9
) => {
  const kithlyFeeNgwee = calculateFee(subtotalNgwee, kithlyFeeRate);
  const processingFeeNgwee = calculateFee(subtotalNgwee + kithlyFeeNgwee, processingFeeRate);
  const totalNgwee = sumNgwee(subtotalNgwee, kithlyFeeNgwee, processingFeeNgwee);

  return {
    subtotalNgwee,
    kithlyFeeNgwee,
    processingFeeNgwee,
    totalNgwee,
    // Display values
    subtotal: toZMW(subtotalNgwee),
    kithlyFee: toZMW(kithlyFeeNgwee),
    processingFee: toZMW(processingFeeNgwee),
    total: toZMW(totalNgwee),
  };
};
