// api/orders/list-buyer.ts
import { sql, jsonResponse, errorResponse } from '@/lib/db';
import { verifyJwt } from '@/lib/auth';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const user = verifyJwt(request);
    if (!user || user.role !== 'buyer') {
      return errorResponse('Unauthorized', 401);
    }

    // Fetch all orders for this buyer, joining with shop name
    const { rows } = await sql`
      SELECT
        o.id,
        o.status,
        o.total_price_in_cents,
        o.pickup_code,
        o.created_at,
        s.shop_name,
        s.image_url AS shop_image_url
      FROM Orders o
      JOIN Shops s ON o.shop_id = s.id
      WHERE o.buyer_user_id = ${user.userId}
      ORDER BY o.created_at DESC;
    `;

    return jsonResponse(rows);

  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
