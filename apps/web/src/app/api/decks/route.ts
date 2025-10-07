import { NextResponse } from 'next/server';
import type { Deck } from '@deck/shared';

// GET /api/decks - list all decks for user
export async function GET() {
  // Stub: will query DB and return user's decks
  const decks: Deck[] = [];
  return NextResponse.json({ decks });
}

// POST /api/decks - create new deck
export async function POST(request: Request) {
  const body = await request.json();
  // Stub: will validate, insert to DB, return created deck
  const deck: Partial<Deck> = {
    id: 'stub-deck-id',
    title: body.title || 'Untitled Deck',
    slides: [],
  };
  return NextResponse.json({ deck }, { status: 201 });
}

