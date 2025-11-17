// api/orders/list-shop.ts
import { sql, jsonResponse, errorResponse } from '@/lib/db';
import { verifyJwt } from '@/lib/auth';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const user = verifyJwt(request);
    if (!user || user.role !== 'shop_owner') {
      return errorResponse('Unauthorized', 401);
    }

    // Find the shop owned by this user
    const shopResult = await sql`
      SELECT id FROM Shops WHERE owner_user_id = ${user.userId} LIMIT 1;
    `;

    if (shopResult.rows.length === 0) {
      return errorResponse('Shop not found for this user', 404);
    }
    const shopId = shopResult.rows[0].id;

    // Fetch all orders for that shop
    const { rows } = await sql`
      SELECT
        id,
        status,
        total_price_in_cents,
        pickup_code,
        is_paid_out,
        created_at
      FROM Orders
      WHERE shop_id = ${shopId}
      ORDER BY created_at DESC;
    `;

    return jsonResponse(rows);

  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
