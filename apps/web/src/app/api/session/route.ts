import { NextResponse } from 'next/server';
import type { Session } from '@deck/shared';
import { signJWT, MAX_VIEWER_TOKEN_TTL } from '@/lib/utils/jwt';

// POST /api/session - create new presentation session
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { deckId } = body;

    if (!deckId) {
      return NextResponse.json(
        { error: 'deckId is required' },
        { status: 400 }
      );
    }

    // Generate unique session ID
    const sessionId = `session-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    
    // Create session object
    const session: Session = {
      id: sessionId,
      deckId,
      status: 'idle',
      createdAt: new Date().toISOString(),
    };

    // TODO: Save to database when DB is connected
    // await db.insert(sessions).values(session);

    // Generate JWT tokens
    const presenterToken = await signJWT(
      {
        sub: `presenter-${sessionId}`,
        role: 'presenter',
        sessionId,
      },
      86400 // 24h
    );

    const viewerToken = await signJWT(
      {
        sub: `viewer-${sessionId}`,
        role: 'viewer',
        sessionId,
      },
      MAX_VIEWER_TOKEN_TTL // 24h
    );

    // Construct viewer URL
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const viewerUrl = `${appUrl}/view/${sessionId}?t=${viewerToken}`;

    console.log(`[API] Created session: ${sessionId} for deck: ${deckId}`);

    return NextResponse.json(
      {
        session,
        presenterToken,
        viewerUrl,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[API] Error creating session:', error);
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    );
  }
}

// PATCH /api/session - end session
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { sessionId } = body;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'sessionId is required' },
        { status: 400 }
      );
    }

    const endedAt = new Date().toISOString();

    // TODO: Update database when connected
    // await db.update(sessions)
    //   .set({ status: 'ended', endedAt })
    //   .where(eq(sessions.id, sessionId));

    console.log(`[API] Ended session: ${sessionId}`);

    return NextResponse.json({
      success: true,
      sessionId,
      endedAt,
    });
  } catch (error) {
    console.error('[API] Error ending session:', error);
    return NextResponse.json(
      { error: 'Failed to end session' },
      { status: 500 }
    );
  }
}

