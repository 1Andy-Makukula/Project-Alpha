import { sql, jsonResponse, errorResponse } from '@/lib/db';
import { verifyJwt } from '@/lib/auth';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate the shop owner
    const user = verifyJwt(request);
    if (!user || user.role !== 'shop_owner') {
      return errorResponse('Unauthorized', 401);
    }

    // 2. Get the new bank details from the form
    const { bankName, accountNumber } = await request.json();
    if (!bankName || !accountNumber) {
      return errorResponse('Bank name and account number are required', 400);
    }

    // 3. Securely update the Shop table using the *authenticated user's ID*
    const { rows } = await sql`
      UPDATE Shops
      SET
        bank_name = ${bankName},
        account_number = ${accountNumber}
      WHERE
        owner_user_id = ${user.userId}
      RETURNING id, shop_name, bank_name, account_number;
    `;

    if (rows.length === 0) {
      return errorResponse('Shop not found for this user', 404);
    }

    return jsonResponse({ message: 'Payout settings updated successfully!', shop: rows[0] });

  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
