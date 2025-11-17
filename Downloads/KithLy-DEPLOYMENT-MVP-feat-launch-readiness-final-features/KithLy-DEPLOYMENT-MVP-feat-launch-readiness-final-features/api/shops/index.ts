// api/shops/index.ts
import { sql, jsonResponse, errorResponse } from '@/lib/db';

export const runtime = 'edge';

export async function GET(request: Request) {
  try {
    const { rows } = await sql`
      SELECT id, shop_name, description, address, image_url, is_open
      FROM Shops
      WHERE is_open = true;
    `;
    return jsonResponse(rows);
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
