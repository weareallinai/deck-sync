import { NextResponse } from 'next/server';
import type { Deck } from '@deck/shared';

// GET /api/decks/[id]
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  // Stub: will query DB for deck + slides
  const deck: Partial<Deck> = {
    id,
    title: 'Sample Deck',
    slides: [],
  };
  return NextResponse.json({ deck });
}

// PATCH /api/decks/[id]
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  // Stub: will update deck in DB
  return NextResponse.json({ success: true, id });
}

// DELETE /api/decks/[id]
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  // Stub: will delete deck and cascading slides
  return NextResponse.json({ success: true, id });
}

