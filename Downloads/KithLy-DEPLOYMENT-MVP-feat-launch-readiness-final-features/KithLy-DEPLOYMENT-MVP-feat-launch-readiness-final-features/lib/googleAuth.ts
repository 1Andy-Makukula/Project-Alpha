// lib/googleAuth.ts
import { OAuth2Client } from 'google-auth-library';
import { errorResponse } from './db';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    throw new Error('Missing Google OAuth environment variables');
}

export const client = new OAuth2Client(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET);

// Function to verify a Google ID Token sent from the client
export async function verifyGoogleToken(token: string) {
    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        if (!payload || !payload.email || !payload.sub) {
            throw new Error('Invalid token payload');
        }
        return {
            email: payload.email,
            firstName: payload.given_name || 'User',
            lastName: payload.family_name || '',
            googleId: payload.sub,
        };
    } catch (e) {
        console.error('Google token verification failed:', e);
        return null;
    }
}
