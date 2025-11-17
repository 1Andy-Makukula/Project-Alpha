// lib/auth.ts
import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

// Ensure the JWT_SECRET is set in Vercel environment variables
const JWT_SECRET = process.env.JWT_SECRET!;

if (!JWT_SECRET) {
  throw new Error('Missing JWT_SECRET environment variable');
}

export type AuthUser = {
  userId: string;
  email: string;
  role: 'buyer' | 'shop_owner';
};

// Function to sign a new JWT
export function signJwt(payload: AuthUser) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' }); // Token lasts 7 days
}

// Function to verify a JWT from a request header
export function verifyJwt(request: NextRequest): AuthUser | null {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded as AuthUser;
  } catch (error) {
    // console.error('JWT verification failed:', error);
    return null;
  }
}
