/**
 * @file zraService.ts
 * @description ZRA (Zambia Revenue Authority) Integration Service
 * Handles fiscalization of orders and QR code generation for official receipts
 * 
 * In production, this would connect to ZRA's Smart Invoice/VSDC system
 */

import { TaxEngine, TaxCategory, TaxResult } from '../lib/taxEngine';

// ==============================================
// TYPES
// ==============================================

export interface ShopTaxInfo {
  /** Taxpayer Identification Number (10 digits) */
  tpin: string;
  /** Tax category: VAT, TOT, or NONE */
  taxCategory: TaxCategory;
  /** Shop name for receipt */
  shopName: string;
  /** Physical address for receipt */
  address?: string;
}

export interface OrderForFiscalization {
  id: string;
  totalAmountCents: number;
  items: Array<{
    name: string;
    quantity: number;
    priceInCents: number;
  }>;
  customerName?: string;
  paymentMethod?: string;
}

export interface FiscalResult {
  success: boolean;
  /** ZRA fiscal number (unique receipt ID) */
  fiscalNumber: string;
  /** Raw data encoded in the QR code */
  qrString: string;
  /** Complete tax breakdown */
  breakdown: TaxResult;
  /** ISO timestamp of fiscalization */
  fiscalizedAt: string;
  /** Error message if failed */
  error?: string;
}

// ==============================================
// ZRA SERVICE
// ==============================================

export const zraService = {
  /**
   * Fiscalize an order with ZRA
   * In production, this makes an API call to ZRA's Smart Invoice system
   * 
   * @param order - Order details to fiscalize
   * @param shop - Shop tax information
   * @returns Fiscal result with receipt number and QR data
   */
  async fiscalizeOrder(
    order: OrderForFiscalization,
    shop: ShopTaxInfo
  ): Promise<FiscalResult> {
    try {
      // 1. Calculate Tax using Smart Engine
      const taxBreakdown = TaxEngine.calculate(order.totalAmountCents, shop.taxCategory);

      console.log(`[ZRA] Fiscalizing ${shop.taxCategory} sale for ${shop.shopName}`);
      console.log(`[ZRA] Net: ${TaxEngine.formatZMW(taxBreakdown.net)}, Tax: ${TaxEngine.formatZMW(taxBreakdown.tax)}`);

      // 2. Build VSDC Payload (ZRA Smart Invoice Format)
      const fiscalTimestamp = new Date().toISOString();
      const vsdcPayload = {
        tpin: shop.tpin || '0000000000',
        bhf_id: '000', // Branch ID (default for single location)
        device_no: 'KITHLY-001',
        receipt_type: 'N', // Normal sale
        payment_type: 'MT', // Mobile Transfer
        customer_name: order.customerName || 'WALK-IN',
        total_amount: taxBreakdown.total / 100,
        tax_amount: taxBreakdown.tax / 100,
        tax_code: taxBreakdown.code,
        tr_date: fiscalTimestamp,
        items: order.items.map(item => ({
          item_name: item.name.substring(0, 50), // ZRA limit
          quantity: item.quantity,
          unit_price: item.priceInCents / 100,
          item_tax_code: taxBreakdown.code,
          tax_amount: Math.round((item.priceInCents * item.quantity * taxBreakdown.rate) / (1 + taxBreakdown.rate)) / 100
        }))
      };

      // 3. SIMULATE ZRA API CALL
      // In production: const response = await axios.post(ZRA_VSDC_URL, vsdcPayload, { headers: ZRA_AUTH });
      await new Promise(resolve => setTimeout(resolve, 500));

      // 4. Generate Fiscal Number (ZRA would return this)
      const fiscalNumber = `ZRA-${Date.now()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;

      // 5. Build QR Code String (Standard ZRA format)
      const qrString = [
        `tpin=${vsdcPayload.tpin}`,
        `dt=${fiscalTimestamp}`,
        `amt=${vsdcPayload.total_amount.toFixed(2)}`,
        `tax=${vsdcPayload.tax_amount.toFixed(2)}`,
        `tc=${taxBreakdown.code}`,
        `fno=${fiscalNumber}`
      ].join('&');

      console.log(`[ZRA] ✓ Fiscalized successfully: ${fiscalNumber}`);

      return {
        success: true,
        fiscalNumber,
        qrString,
        breakdown: taxBreakdown,
        fiscalizedAt: fiscalTimestamp
      };

    } catch (error: any) {
      console.error('[ZRA] Fiscalization failed:', error);
      return {
        success: false,
        fiscalNumber: 'FAILED',
        qrString: '',
        breakdown: TaxEngine.calculate(order.totalAmountCents, 'NONE'),
        fiscalizedAt: new Date().toISOString(),
        error: error.message || 'ZRA connection failed'
      };
    }
  },

  /**
   * Validate a TPIN format (Zambian taxpayer ID)
   * Format: 10 digits
   */
  validateTPIN(tpin: string): boolean {
    return /^\d{10}$/.test(tpin);
  },

  /**
   * Check if a shop is required to collect tax
   */
  isTaxRequired(category: TaxCategory): boolean {
    return category === 'VAT' || category === 'TOT';
  }
};
