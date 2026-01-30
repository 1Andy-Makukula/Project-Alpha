/**
 * @file taxEngine.ts
 * @description Smart Tax Engine for ZRA Compliance
 * 
 * Handles three tax categories:
 * - VAT (16%) - For registered retailers (ShopRite, Pick n Pay)
 * - TOT (4%) - Turnover Tax for small SMEs (< K800,000/year)
 * - NONE - Unregistered individual sellers
 * 
 * References:
 * - ZRA VAT: https://www.zra.org.zm/value-added-tax/
 * - Turnover Tax: For businesses with turnover below K800,000/year
 */

// ==============================================
// TAX CATEGORIES
// ==============================================

export type TaxCategory = 'VAT' | 'TOT' | 'NONE';

export interface TaxResult {
  /** Money the shop keeps after tax */
  net: number;
  /** Money to be remitted to ZRA */
  tax: number;
  /** Total amount customer paid */
  total: number;
  /** Tax rate applied (0.16, 0.04, or 0) */
  rate: number;
  /** ZRA tax code ('A' = VAT, 'B' = Exempt, 'C1' = TOT) */
  code: string;
  /** Human-readable label for receipt */
  label: string;
  /** Tax category used */
  category: TaxCategory;
}

// ==============================================
// THE SMART TAX ENGINE
// ==============================================

export const TaxEngine = {
  /**
   * Calculate tax based on shop's tax category
   * 
   * @param amountInCents - Total amount in ngwee/cents (what customer pays)
   * @param category - Shop's tax registration category
   * @returns Complete tax breakdown
   * 
   * @example
   * // ShopRite (VAT registered) sells item for K116
   * TaxEngine.calculate(11600, 'VAT')
   * // → { net: 10000, tax: 1600, total: 11600, rate: 0.16, code: 'A', label: 'VAT (16%)' }
   * 
   * @example
   * // Keith's Snacks (TOT registered) sells item for K100
   * TaxEngine.calculate(10000, 'TOT')
   * // → { net: 9600, tax: 400, total: 10000, rate: 0.04, code: 'C1', label: 'Turnover Tax (4%)' }
   */
  calculate(amountInCents: number, category: TaxCategory): TaxResult {
    // 1. STANDARD VAT (16%) - For Big Retailers
    // Price is VAT-Inclusive: K116 = K100 (net) + K16 (VAT)
    // Formula: Net = Total / (1 + 0.16)
    if (category === 'VAT') {
      const rate = 0.16;
      const net = Math.round(amountInCents / (1 + rate));
      const tax = amountInCents - net;
      return {
        net,
        tax,
        total: amountInCents,
        rate,
        code: 'A',
        label: 'VAT (16%)',
        category
      };
    }

    // 2. TURNOVER TAX (4%) - For Small SMEs
    // TOT is calculated on gross revenue, shop keeps 96%
    // Formula: Tax = Total × 0.04
    if (category === 'TOT') {
      const rate = 0.04;
      const tax = Math.round(amountInCents * rate);
      const net = amountInCents - tax;
      return {
        net,
        tax,
        total: amountInCents,
        rate,
        code: 'C1',
        label: 'Turnover Tax (4%)',
        category
      };
    }

    // 3. UNREGISTERED / EXEMPT - For individual sellers
    // No tax obligation, seller keeps everything
    return {
      net: amountInCents,
      tax: 0,
      total: amountInCents,
      rate: 0,
      code: 'B',
      label: 'Non-Taxable',
      category: 'NONE'
    };
  },

  /**
   * Determine recommended tax category based on business info
   * This is advisory only - actual category must be set by admin
   */
  suggestCategory(annualRevenueZMW: number, hasTPIN: boolean): TaxCategory {
    if (!hasTPIN) return 'NONE';
    if (annualRevenueZMW >= 800000) return 'VAT';
    return 'TOT';
  },

  /**
   * Format amount for display in ZMW
   */
  formatZMW(cents: number): string {
    return new Intl.NumberFormat('en-ZM', {
      style: 'currency',
      currency: 'ZMW'
    }).format(cents / 100);
  }
};

// ==============================================
// CONVENIENCE EXPORTS
// ==============================================

export const calculateTax = TaxEngine.calculate;
export const formatZMW = TaxEngine.formatZMW;
