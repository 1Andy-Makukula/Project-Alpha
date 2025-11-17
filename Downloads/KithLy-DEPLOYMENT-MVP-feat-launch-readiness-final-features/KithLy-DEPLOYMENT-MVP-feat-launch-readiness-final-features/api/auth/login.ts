// api/auth/login.ts
import { sql, jsonResponse, errorResponse } from '@/lib/db';
import { signJwt } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    if (!email || !password) {
      return errorResponse('Email and password are required', 400);
    }

    const { rows } = await sql`SELECT * FROM Users WHERE email = ${email} LIMIT 1;`;
    const user = rows[0];

    if (!user) {
      return errorResponse('Invalid credentials', 401);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return errorResponse('Invalid credentials', 401);
    }

    // Create a token
    const token = signJwt({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return jsonResponse({
      token,
      user: { id: user.id, email: user.email, first_name: user.first_name, role: user.role },
    });

  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
