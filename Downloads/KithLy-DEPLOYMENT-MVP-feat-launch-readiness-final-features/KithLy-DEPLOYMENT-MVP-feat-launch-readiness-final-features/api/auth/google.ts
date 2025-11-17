// api/auth/google.ts
import { sql, jsonResponse, errorResponse } from '@/lib/db';
import { verifyGoogleToken } from '@/lib/googleAuth';
import { signJwt } from '@/lib/auth';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    const { idToken, role } = await request.json();
    if (!idToken || !role) {
      return errorResponse('Token and role are required', 400);
    }

    const googleUser = await verifyGoogleToken(idToken);
    if (!googleUser) {
      return errorResponse('Invalid Google Token', 401);
    }

    const { email, firstName, lastName, googleId } = googleUser;

    // 1. Check if user exists by Google ID or Email
    let userRecord = await sql`
        SELECT * FROM Users WHERE google_id = ${googleId} OR email = ${email} LIMIT 1;
    `;
    let user = userRecord.rows[0];

    // 2. If user doesn't exist, create a new user (with null password)
    if (!user) {
        userRecord = await sql`
            INSERT INTO Users (email, first_name, last_name, google_id, role)
            VALUES (${email}, ${firstName}, ${lastName}, ${googleId}, ${role})
            RETURNING id, email, role, first_name;
        `;
        user = userRecord.rows[0];
    }
    // 3. If user exists but used password login before, update their record with Google ID
    else if (!user.google_id) {
        await sql`UPDATE Users SET google_id = ${googleId} WHERE id = ${user.id};`;
    }

    // 4. Issue JWT
    const token = signJwt({ userId: user.id, email: user.email, role: user.role });

    return jsonResponse({
        token,
        user: { id: user.id, email: user.email, first_name: user.first_name, role: user.role },
    });

  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
