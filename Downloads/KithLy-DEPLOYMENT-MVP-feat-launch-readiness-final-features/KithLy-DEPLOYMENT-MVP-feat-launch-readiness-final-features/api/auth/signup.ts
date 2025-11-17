// api/auth/signup.ts
import { sql, jsonResponse, errorResponse } from '@/lib/db';
import bcrypt from 'bcryptjs';

export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    const { email, password, first_name, role } = await request.json();

    if (!email || !password || !role) {
      return errorResponse('Missing required fields', 400);
    }

    const password_hash = await bcrypt.hash(password, 10);

    const { rows } = await sql`
      INSERT INTO Users (email, password_hash, first_name, role)
      VALUES (${email}, ${password_hash}, ${first_name}, ${role})
      RETURNING id, email, role;
    `;

    // Note: You would probably want to sign a JWT here too
    // but for simplicity, we'll just return the user.
    return jsonResponse(rows[0], 201);

  } catch (error: any) {
    if (error.code === '23505') { // Unique constraint violation
      return errorResponse('User with this email already exists', 409);
    }
    return errorResponse(error.message, 500);
  }
}
