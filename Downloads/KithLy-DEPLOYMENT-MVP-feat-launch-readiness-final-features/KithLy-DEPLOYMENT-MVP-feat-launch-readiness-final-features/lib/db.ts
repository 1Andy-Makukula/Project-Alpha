// lib/db.ts
import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

// Export the sql object directly
export { sql };

// Standard success response
export function jsonResponse(data: any, status: number = 200) {
  return new NextResponse(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

// Standard error response
export function errorResponse(message: string, status: number = 500) {
  return new NextResponse(JSON.stringify({ error: message }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
