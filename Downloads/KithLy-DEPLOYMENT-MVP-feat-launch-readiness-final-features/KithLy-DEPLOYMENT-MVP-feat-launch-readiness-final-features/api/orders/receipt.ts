// api/orders/receipt.ts
import { sql, jsonResponse, errorResponse } from '@/lib/db';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');

    // 1. Fetch Order and Item Details
    const orderDetails = await sql`
        SELECT
            o.id, o.status, o.total_price_in_cents, o.kithly_fee_in_cents, o.created_at,
            s.shop_name, s.address,
            u.first_name AS buyer_name, u.email AS buyer_email
        FROM Orders o
        JOIN Shops s ON o.shop_id = s.id
        JOIN Users u ON o.buyer_user_id = u.id
        WHERE o.id = ${orderId} LIMIT 1;
    `;
    const order = orderDetails.rows[0];
    if (!order) return errorResponse('Order not found', 404);

    const itemsResult = await sql`
        SELECT
            oi.quantity, oi.price_at_purchase_in_cents, p.name AS product_name
        FROM OrderItems oi
        JOIN Products p ON oi.product_id = p.id
        WHERE oi.order_id = ${orderId};
    `;
    const items = itemsResult.rows;

    // 2. Format Receipt Data
    const subtotal = order.total_price_in_cents + order.kithly_fee_in_cents; // Hypothetical total
    const netPaidToShop = order.total_price_in_cents - order.kithly_fee_in_cents;

    return jsonResponse({
        receiptId: order.id,
        date: order.created_at,
        shopName: order.shop_name,
        shopAddress: order.address,
        buyer: `${order.buyer_name} (${order.buyer_email})`,
        status: order.status,
        items: items.map(item => ({
            name: item.product_name,
            quantity: item.quantity,
            price: (item.price_at_purchase_in_cents / 100).toFixed(2),
            lineTotal: ((item.quantity * item.price_at_purchase_in_cents) / 100).toFixed(2)
        })),
        summary: {
            subtotal: (order.total_price_in_cents / 100).toFixed(2),
            kithlyFee: (order.kithly_fee_in_cents / 100).toFixed(2),
            totalPaid: (order.total_price_in_cents / 100).toFixed(2),
            netShopPayout: (netPaidToShop / 100).toFixed(2),
            currency: 'ZMW'
        }
    });

  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
