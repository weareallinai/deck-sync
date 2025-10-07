import { NextResponse } from 'next/server';
import type { Session } from '@deck/shared';

// POST /api/session - create new presentation session
export async function POST(request: Request) {
  const body = await request.json();
  const { deckId } = body;

  // Stub: will create session in DB, generate tokens
  const session: Session = {
    id: `session-${Date.now()}`,
    deckId,
    status: 'idle',
    createdAt: new Date().toISOString(),
  };

  const presenterToken = 'stub-presenter-jwt';
  const viewerToken = 'stub-viewer-jwt';
  const viewerUrl = `${process.env.NEXT_PUBLIC_APP_URL}/view/${session.id}?t=${viewerToken}`;

  return NextResponse.json({
    session,
    presenterToken,
    viewerUrl,
  }, { status: 201 });
}

// PATCH /api/session - end session
export async function PATCH(request: Request) {
  const body = await request.json();
  const { sessionId } = body;

  // Stub: will mark session as ended
  return NextResponse.json({
    success: true,
    sessionId,
    endedAt: new Date().toISOString(),
  });
}

