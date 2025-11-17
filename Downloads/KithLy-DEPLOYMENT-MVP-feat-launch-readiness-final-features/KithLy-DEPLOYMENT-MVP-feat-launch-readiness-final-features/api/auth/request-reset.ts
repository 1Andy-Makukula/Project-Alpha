import { sql, jsonResponse, errorResponse } from '@/lib/db';
import { Resend } from 'resend';
import { v4 as uuidv4 } from 'uuid';

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY);
const APP_BASE_URL = process.env.APP_BASE_URL;

export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    if (!email) {
      return errorResponse('Email is required', 400);
    }

    const { rows } = await sql`SELECT id, first_name FROM Users WHERE email = ${email} LIMIT 1;`;
    const user = rows[0];

    if (user) {
      const token = uuidv4();
      const expiry = new Date(Date.now() + 3600 * 1000); // 1 hour from now

      await sql`
        UPDATE Users
        SET reset_token = ${token}, reset_token_expiry = ${expiry}
        WHERE id = ${user.id};
      `;

      const resetLink = `${APP_BASE_URL}/reset-password?token=${token}`;

      // Send email using Resend (ACTIVATED)
      await resend.emails.send({
        from: 'no-reply@your-verified-domain.com', // CRITICAL: Update this domain!
        to: email,
        subject: 'KithLy Password Reset Request',
        html: `
          <p>Hi ${user.first_name || 'KithLy User'},</p>
          <p>We received a request to reset your password. Click the link below to set a new one:</p>
          <a href="${resetLink}" style="padding: 10px 15px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">
            Reset Your Password
          </a>
          <p>This link is valid for 1 hour. If you did not request this, please ignore this email.</p>
          <p>- The KithLy Team</p>
        `
      });
    }

    return jsonResponse({ message: 'If an account with this email exists, a reset link has been sent.' });

  } catch (error: any) {
    console.error(error);
    return errorResponse('An error occurred. Please try again later.', 500);
  }
}
