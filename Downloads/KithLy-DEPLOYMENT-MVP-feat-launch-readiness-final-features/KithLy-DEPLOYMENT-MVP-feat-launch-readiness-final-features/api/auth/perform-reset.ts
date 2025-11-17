// api/auth/perform-reset.ts
import { sql, jsonResponse, errorResponse } from '@/lib/db';
import bcrypt from 'bcryptjs';

export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    const { token, password } = await request.json();
    if (!token || !password) {
      return errorResponse('Token and new password are required', 400);
    }

    if (password.length < 6) {
      return errorResponse('Password must be at least 6 characters long', 400);
    }

    // 1. Find user with this token and check expiry
    const { rows } = await sql`
      SELECT id, reset_token_expiry
      FROM Users
      WHERE reset_token = ${token} LIMIT 1;
    `;

    const user = rows[0];
    if (!user) {
      return errorResponse('Invalid or expired reset token.', 400);
    }

    if (new Date() > new Date(user.reset_token_expiry)) {
      return errorResponse('Invalid or expired reset token.', 400);
    }

    // 2. Hash new password
    const password_hash = await bcrypt.hash(password, 10);

    // 3. Update password and clear token
    await sql`
      UPDATE Users
      SET password_hash = ${password_hash},
          reset_token = NULL,
          reset_token_expiry = NULL
      WHERE id = ${user.id};
    `;

    return jsonResponse({ message: 'Password has been reset successfully. Please log in.' });

  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
