// api/upload.ts
import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  // Get filename from query param: /api/upload?filename=my-product.jpg
  const filename = searchParams.get('filename');

  if (!filename || !request.body) {
    return new NextResponse(JSON.stringify({ error: 'No filename or file body provided' }), { status: 400 });
  }

  // Upload to Vercel Blob
  const blob = await put(filename, request.body, {
    access: 'public',
  });

  // Return the blob object (which includes the URL)
  return NextResponse.json(blob);
}
