// api/shops/products.ts
import { sql, jsonResponse, errorResponse } from '@/lib/db';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const shopId = searchParams.get('shopId');

    if (!shopId) {
      return errorResponse('shopId is required', 400);
    }

    const { rows } = await sql`
      SELECT id, name, description, price_in_cents, image_url, stock_quantity
      FROM Products
      WHERE shop_id = ${shopId};
    `;

    return jsonResponse(rows);
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
