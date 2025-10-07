import { NextResponse } from 'next/server';
import type { Slide } from '@deck/shared';

// GET /api/slides/[id]
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  // Stub: will query DB for slide
  const slide: Partial<Slide> = {
    id,
    deckId: 'stub-deck',
    index: 0,
    bg: { type: 'color', value: '#ffffff' },
    elements: [],
  };
  return NextResponse.json({ slide });
}

// PATCH /api/slides/[id]
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  // Stub: will update slide JSON in DB
  return NextResponse.json({ success: true, id });
}

// DELETE /api/slides/[id]
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  // Stub: will delete slide
  return NextResponse.json({ success: true, id });
}

