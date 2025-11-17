// api/orders/create.ts
import { sql, jsonResponse, errorResponse } from '@/lib/db';
import { verifyJwt } from '@/lib/auth';
import { NextRequest } from 'next/server';
import { Flutterwave } from 'flutterwave-node-v3';

const flw = new Flutterwave(process.env.FLUTTERWAVE_PUBLIC_KEY!, process.env.FLUTTERWAVE_SECRET_KEY!);

function generatePickupCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: NextRequest) {
  try {
    const user = verifyJwt(request);
    if (!user || user.role !== 'buyer') {
      return errorResponse('Unauthorized', 401);
    }

    const { shop_id, items, total_price_in_cents } = await request.json();
    if (!shop_id || !items || !total_price_in_cents) {
      return errorResponse('Missing order data', 400);
    }

    // --- COMMISSION CALCULATION ---
    const shopResult = await sql`
        SELECT commission_rate, commission_end_date FROM Shops WHERE id = ${shop_id} LIMIT 1;
    `;
    const shop = shopResult.rows[0];

    // Check if the 3-month free commission period is over
    const isFreePeriodActive = shop.commission_rate === 0.00; // Assuming 0.00 means free commission

    // KithLy Fee calculation based on the shop's current rate
    const commissionRate = parseFloat(shop.commission_rate);
    const kithlyFee = isFreePeriodActive
        ? 0
        : Math.round(total_price_in_cents * commissionRate);

    // --- Order and Order Items Creation ---
    const pickup_code = generatePickupCode();
    let newOrderId: string;

    const newOrder = await sql.query(
      `INSERT INTO Orders (buyer_user_id, shop_id, total_price_in_cents, pickup_code, kithly_fee_in_cents)
       VALUES ($1, $2, $3, $4, $5) RETURNING id;`,
      [user.userId, shop_id, total_price_in_cents, pickup_code, kithlyFee]
    );
    newOrderId = newOrder.rows[0].id;

    for (const item of items) {
      await sql.query(
        `INSERT INTO OrderItems (order_id, product_id, quantity, price_at_purchase_in_cents)
         VALUES ($1, $2, $3, $4);`,
        [newOrderId, item.product_id, item.quantity, item.price_at_purchase_in_cents]
      );
    }

    // 2. Create Flutterwave Payment Link (using APP_BASE_URL)
    const paymentPayload = {
      // ... same as before
      redirect_url: `${process.env.APP_BASE_URL}/order/success?order_id=${newOrderId}`,
      // ...
    };

    const response = await flw.Payment.initiate(paymentPayload);
    if (response.status === 'success') {
      return jsonResponse({ payment_link: response.data.link, order_id: newOrderId });
    } else {
      return errorResponse('Failed to create payment link', 500);
    }

  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
