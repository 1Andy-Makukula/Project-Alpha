// api/orders/status.ts
import { sql, jsonResponse, errorResponse } from '@/lib/db';
import { verifyJwt } from '@/lib/auth';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const user = verifyJwt(request); // Authentication is optional here if only fetching basic status
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');

    if (!orderId) {
      return errorResponse('Order ID is required', 400);
    }

    const { rows } = await sql`
      SELECT status, pickup_code, total_price_in_cents
      FROM Orders
      WHERE id = ${orderId}
      LIMIT 1;
    `;

    if (rows.length === 0) {
      return errorResponse('Order not found', 404);
    }

    // In a real app, you would add logic: IF user is NOT authenticated,
    // ONLY show status if the order is completed/paid.
    // For now, we return the status and pickup code if it exists.
    return jsonResponse(rows[0]);

  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
