/**
 * @file tax.ts
 * @description ZRA (Zambia Revenue Authority) tax compliance utilities
 * Handles VAT (16%) for registered businesses and Turnover Tax (4%) for small traders
 * 
 * References:
 * - ZRA VAT: https://www.zra.org.zm/value-added-tax/
 * - Turnover Tax: For businesses with turnover below K800,000/year
 */

// ==============================================
// TAX RATES (Zambian Tax Law as of 2024)
// ==============================================

/** Standard VAT rate for registered businesses */
export const VAT_RATE = 0.16; // 16%

/** Turnover Tax rate for small businesses (below K800,000 annual revenue) */
export const TURNOVER_TAX_RATE = 0.04; // 4%

/** KithLy platform fee rate */
export const KITHLY_FEE_RATE = 0.05; // 5%

/** Payment processing fee (Flutterwave) */
export const PROCESSING_FEE_RATE = 0.029; // 2.9%

// ==============================================
// TAX CALCULATION TYPES
// ==============================================

export type TaxType = 'VAT' | 'TOT' | 'EXEMPT';

export interface TaxBreakdown {
  /** Amount before tax (what the shop receives) */
  netAmountNgwee: number;
  /** Tax portion (to be remitted to ZRA) */
  taxAmountNgwee: number;
  /** Total amount (what the customer pays) */
  totalAmountNgwee: number;
  /** Type of tax applied */
  taxType: TaxType;
  /** Tax rate applied */
  taxRate: number;
}

export interface OrderFinancials {
  /** Subtotal before fees in ngwee */
  subtotalNgwee: number;
  /** Tax breakdown */
  tax: TaxBreakdown;
  /** KithLy platform fee in ngwee */
  kithlyFeeNgwee: number;
  /** Payment processing fee in ngwee */
  processingFeeNgwee: number;
  /** Total customer pays in ngwee */
  totalNgwee: number;
  /** Amount shop receives after fees in ngwee */
  shopPayoutNgwee: number;
}

// ==============================================
// TAX CALCULATION FUNCTIONS
// ==============================================

/**
 * Calculate tax breakdown for an amount
 * Determines whether to apply VAT or Turnover Tax based on shop registration
 * 
 * @param totalAmountNgwee - Total amount in ngwee (including tax)
 * @param isVatRegistered - Whether the shop is VAT registered
 * @returns Tax breakdown with net amount, tax amount, and totals
 */
export function calculateTax(
  totalAmountNgwee: number,
  isVatRegistered: boolean = false
): TaxBreakdown {
  const taxType: TaxType = isVatRegistered ? 'VAT' : 'TOT';
  const taxRate = isVatRegistered ? VAT_RATE : TURNOVER_TAX_RATE;

  // Math: Total = Net × (1 + Rate)  =>  Net = Total / (1 + Rate)
  // Use integer math to avoid floating point errors
  const netAmountNgwee = Math.round((totalAmountNgwee * 100) / ((1 + taxRate) * 100));
  const taxAmountNgwee = totalAmountNgwee - netAmountNgwee;

  return {
    netAmountNgwee,
    taxAmountNgwee,
    totalAmountNgwee,
    taxType,
    taxRate,
  };
}

/**
 * Calculate complete order financials including all fees
 * 
 * @param subtotalNgwee - Cart subtotal in ngwee
 * @param isVatRegistered - Whether the shop is VAT registered
 * @returns Complete financial breakdown
 */
export function calculateOrderFinancials(
  subtotalNgwee: number,
  isVatRegistered: boolean = false
): OrderFinancials {
  // Calculate tax
  const tax = calculateTax(subtotalNgwee, isVatRegistered);

  // Calculate platform fees (on net amount)
  const kithlyFeeNgwee = Math.round(tax.netAmountNgwee * KITHLY_FEE_RATE);

  // Processing fee is on total transaction amount
  const processingFeeNgwee = Math.round((subtotalNgwee + kithlyFeeNgwee) * PROCESSING_FEE_RATE);

  // Total customer pays
  const totalNgwee = subtotalNgwee + kithlyFeeNgwee + processingFeeNgwee;

  // Shop receives net minus KithLy fee
  const shopPayoutNgwee = tax.netAmountNgwee - kithlyFeeNgwee;

  return {
    subtotalNgwee,
    tax,
    kithlyFeeNgwee,
    processingFeeNgwee,
    totalNgwee,
    shopPayoutNgwee,
  };
}

/**
 * Format ngwee amount to ZMW display string
 * @param ngwee - Amount in ngwee
 * @returns Formatted string like "ZMW 19.99"
 */
export function formatZMW(ngwee: number): string {
  return `ZMW ${(ngwee / 100).toFixed(2)}`;
}

/**
 * Generate a tax invoice summary for ZRA compliance
 */
export function generateTaxSummary(
  financials: OrderFinancials,
  shopName: string,
  tpin?: string
): {
  sellerName: string;
  sellerTPIN: string;
  netAmount: string;
  taxAmount: string;
  taxType: string;
  totalAmount: string;
} {
  return {
    sellerName: shopName,
    sellerTPIN: tpin || 'NOT REGISTERED',
    netAmount: formatZMW(financials.tax.netAmountNgwee),
    taxAmount: formatZMW(financials.tax.taxAmountNgwee),
    taxType: financials.tax.taxType === 'VAT'
      ? `VAT @ ${(financials.tax.taxRate * 100).toFixed(0)}%`
      : `Turnover Tax @ ${(financials.tax.taxRate * 100).toFixed(0)}%`,
    totalAmount: formatZMW(financials.totalNgwee),
  };
}
