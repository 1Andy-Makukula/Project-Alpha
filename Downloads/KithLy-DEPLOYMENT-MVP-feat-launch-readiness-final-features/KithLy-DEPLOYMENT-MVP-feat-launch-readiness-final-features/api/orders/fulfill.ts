// api/orders/fulfill.ts
import { sql, jsonResponse, errorResponse } from '@/lib/db';
import { verifyJwt } from '@/lib/auth';
import { NextRequest } from 'next/server';
import { Flutterwave } from 'flutterwave-node-v3';

const flw = new Flutterwave(process.env.FLUTTERWAVE_PUBLIC_KEY!, process.env.FLUTTERWAVE_SECRET_KEY!);

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate Shop Owner
    const user = verifyJwt(request);
    if (!user || user.role !== 'shop_owner') {
      return errorResponse('Unauthorized', 401);
    }

    const { pickup_code } = await request.json();
    if (!pickup_code) {
      return errorResponse('Pickup code is required', 400);
    }

    // 2. Find Order and Shop Details (Ensure order belongs to this shop owner)
    const orderResult = await sql`
      SELECT o.id, o.status, o.total_price_in_cents, o.kithly_fee_in_cents, s.bank_name, s.account_number, s.owner_user_id
      FROM Orders o
      JOIN Shops s ON o.shop_id = s.id
      WHERE o.pickup_code = ${pickup_code}
      AND s.owner_user_id = ${user.userId}
      LIMIT 1;
    `;

    const order = orderResult.rows[0];

    if (!order) {
      return errorResponse('Invalid pickup code or order not found.', 404);
    }
    if (order.status !== 'paid') {
      return errorResponse(`Order status is ${order.status}. Cannot fulfill.`, 409);
    }

    // 3. Calculate Net Payout and Trigger Transfer (Escrow -> Shop)
    const payoutAmount = order.total_price_in_cents - order.kithly_fee_in_cents;
    const isZambianAccount = order.bank_name && order.account_number;

    if (!isZambianAccount) {
        // Fallback: This shop must update its bank details before payout.
        return errorResponse('Shop bank details incomplete. Payout failed.', 400);
    }

    const transferPayload = {
      account_bank: order.bank_name,
      account_number: order.account_number,
      amount: (payoutAmount / 100).toFixed(2), // Major currency format
      currency: 'ZMW', // Assume shop account is in ZMW
      narration: `KithLy Payout Order ${order.id}`,
      reference: `KITHLY_PAYOUT_${order.id}_${Date.now()}`,
      // Other details like beneficiary name would be added here
    };

    const transferResponse = await flw.Transfer.initiate(transferPayload);

    if (transferResponse.status !== 'success') {
      return errorResponse('Payout initiated but failed to process. Check Flutterwave logs.', 500);
    }

    // 4. Update Order Status
    await sql`
      UPDATE Orders
      SET status = 'completed', is_paid_out = TRUE
      WHERE id = ${order.id};
    `;

    return jsonResponse({
        message: 'Order fulfilled and payout initiated successfully.',
        order_id: order.id,
        payout_amount: payoutAmount,
    });

  } catch (error: any) {
    console.error('Fulfillment error:', error);
    return errorResponse(error.message, 500);
  }
}
