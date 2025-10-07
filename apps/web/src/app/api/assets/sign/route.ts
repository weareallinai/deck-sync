import { NextResponse } from 'next/server';

// POST /api/assets/sign - generate signed upload URL
export async function POST(request: Request) {
  const body = await request.json();
  const { filename, contentType } = body;

  // Stub: will generate R2/S3 signed PUT URL
  const signedUrl = `https://stub-r2.example.com/upload/${filename}`;
  const assetUrl = `https://cdn.example.com/assets/${filename}`;

  return NextResponse.json({
    signedUrl,
    assetUrl,
    expiresIn: 3600,
  });
}

