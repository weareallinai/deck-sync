import { NextResponse } from 'next/server';

// POST /api/auth/jwt - mint JWT for viewer/presenter
export async function POST(request: Request) {
  const body = await request.json();
  const { sessionId, role } = body;

  // Stub: will sign JWT with claims
  const token = `stub-jwt-${role}-${sessionId}`;
  const expiresIn = 86400; // 24h

  return NextResponse.json({
    token,
    expiresIn,
  });
}

