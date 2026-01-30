/**
 * @file FiscalReceipt.tsx
 * @description Official ZRA-compliant fiscal receipt component
 * Shows tax breakdown and QR code for verification
 */

import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { TaxResult } from '../lib/taxEngine';

// ==============================================
// TYPES
// ==============================================

interface FiscalReceiptProps {
  /** Shop name to display */
  shopName: string;
  /** Shop TPIN (optional) */
  shopTpin?: string;
  /** Tax calculation result */
  taxData: TaxResult;
  /** ZRA QR code data string */
  qrData?: string;
  /** ZRA fiscal number */
  fiscalNumber?: string;
  /** Order ID for reference */
  orderId?: string;
  /** Order date */
  orderDate?: string;
  /** Optional: list of items for detailed receipt */
  items?: Array<{
    name: string;
    quantity: number;
    priceInCents: number;
  }>;
}

// ==============================================
// HELPER FUNCTIONS
// ==============================================

const formatMoney = (cents: number): string => {
  return new Intl.NumberFormat('en-ZM', {
    style: 'currency',
    currency: 'ZMW'
  }).format(cents / 100);
};

const formatDate = (dateString?: string): string => {
  if (!dateString) return new Date().toLocaleString('en-ZM');
  return new Date(dateString).toLocaleString('en-ZM');
};

// ==============================================
// COMPONENT
// ==============================================

export const FiscalReceipt: React.FC<FiscalReceiptProps> = ({
  shopName,
  shopTpin,
  taxData,
  qrData,
  fiscalNumber,
  orderId,
  orderDate,
  items
}) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 max-w-sm mx-auto">
      {/* Header */}
      <div className="text-center border-b border-dashed border-gray-300 pb-4 mb-4">
        <h2 className="font-bold text-lg uppercase text-gray-800">{shopName}</h2>
        {shopTpin && shopTpin !== '0000000000' && (
          <p className="text-xs text-gray-500">TPIN: {shopTpin}</p>
        )}
        <p className="text-xs text-gray-400 mt-1">Official Fiscal Receipt</p>
      </div>

      {/* Order Info */}
      <div className="text-xs text-gray-500 mb-4 space-y-1">
        {orderId && <p>Order: {orderId}</p>}
        <p>Date: {formatDate(orderDate)}</p>
      </div>

      {/* Items (if provided) */}
      {items && items.length > 0 && (
        <div className="border-b border-gray-200 pb-3 mb-3">
          {items.map((item, index) => (
            <div key={index} className="flex justify-between text-sm py-1">
              <span className="text-gray-600">
                {item.quantity}× {item.name.substring(0, 20)}
              </span>
              <span className="text-gray-800">
                {formatMoney(item.priceInCents * item.quantity)}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Tax Breakdown */}
      <div className="space-y-2 text-sm">
        <div className="flex justify-between text-gray-600">
          <span>Subtotal</span>
          <span>{formatMoney(taxData.net + taxData.tax)}</span>
        </div>

        {taxData.tax > 0 && (
          <>
            <div className="flex justify-between text-gray-500">
              <span>Net Amount</span>
              <span>{formatMoney(taxData.net)}</span>
            </div>
            <div className="flex justify-between text-amber-600">
              <span>{taxData.label}</span>
              <span>{formatMoney(taxData.tax)}</span>
            </div>
          </>
        )}

        {taxData.tax === 0 && (
          <div className="flex justify-between text-gray-400 text-xs">
            <span>Tax Status</span>
            <span>{taxData.label}</span>
          </div>
        )}

        <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-200 text-gray-900">
          <span>TOTAL</span>
          <span>{formatMoney(taxData.total)}</span>
        </div>
      </div>

      {/* QR Code Section */}
      {qrData && (
        <div className="mt-6 flex flex-col items-center">
          <div className="p-3 bg-white border-2 border-gray-900 rounded-lg">
            <QRCodeSVG
              value={qrData}
              size={100}
              level="M"
              includeMargin={false}
            />
          </div>

          {fiscalNumber && (
            <p className="text-[10px] font-mono text-gray-400 mt-2 text-center">
              F-NUM: {fiscalNumber}
            </p>
          )}

          <div className="flex items-center gap-1 mt-2">
            <span className="text-green-600 text-sm">✓</span>
            <p className="text-[10px] text-green-600 font-semibold">
              ZRA VERIFIED
            </p>
          </div>
        </div>
      )}

      {/* Non-fiscal indicator */}
      {!qrData && taxData.category === 'NONE' && (
        <div className="mt-4 text-center text-xs text-gray-400">
          <p>This is a non-fiscal receipt</p>
          <p>Seller is not ZRA registered</p>
        </div>
      )}

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-dashed border-gray-300 text-center">
        <p className="text-[10px] text-gray-400">
          Thank you for shopping with KithLy
        </p>
        <p className="text-[10px] text-gray-400 mt-1">
          Powered by KithLy Marketplace
        </p>
      </div>
    </div>
  );
};

export default FiscalReceipt;
