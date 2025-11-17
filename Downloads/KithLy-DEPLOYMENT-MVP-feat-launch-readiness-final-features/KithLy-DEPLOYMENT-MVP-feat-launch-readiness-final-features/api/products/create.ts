// api/products/create.ts
import { sql, jsonResponse, errorResponse } from '@/lib/db';
import { verifyJwt } from '@/lib/auth';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate the user
    const user = verifyJwt(request);
    if (!user || user.role !== 'shop_owner') {
      return errorResponse('Unauthorized', 401);
    }

    const { shop_id, name, description, price_in_cents, image_url, stock_quantity } = await request.json();

    // 2. Mandatory Security Check: Verify this shop_id belongs to the authenticated user
    const shopCheck = await sql`
      SELECT id FROM Shops
      WHERE id = ${shop_id} AND owner_user_id = ${user.userId}
      LIMIT 1;
    `;

    if (shopCheck.rows.length === 0) {
      return errorResponse('Shop access denied or not found.', 403);
    }

    if (!name || !price_in_cents || !image_url) {
      return errorResponse('Missing required product fields', 400);
    }

    // 3. Insert into database
    const { rows } = await sql`
      INSERT INTO Products (shop_id, name, description, price_in_cents, image_url, stock_quantity)
      VALUES (${shop_id}, ${name}, ${description}, ${price_in_cents}, ${image_url}, ${stock_quantity})
      RETURNING *;
    `;

    return jsonResponse(rows[0], 201);

  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
