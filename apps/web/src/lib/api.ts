import type { Deck, Slide, Session } from '@deck/shared';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

async function fetchAPI<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }

  return response.json();
}

// Deck operations
export const api = {
  decks: {
    list: () => fetchAPI<{ decks: Deck[] }>('/api/decks'),
    get: (id: string) => fetchAPI<{ deck: Deck }>(`/api/decks/${id}`),
    create: (title: string) =>
      fetchAPI<{ deck: Deck }>('/api/decks', {
        method: 'POST',
        body: JSON.stringify({ title }),
      }),
    update: (id: string, updates: Partial<Deck>) =>
      fetchAPI<{ success: boolean }>(`/api/decks/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      }),
    delete: (id: string) =>
      fetchAPI<{ success: boolean }>(`/api/decks/${id}`, {
        method: 'DELETE',
      }),
  },

  slides: {
    get: (id: string) => fetchAPI<{ slide: Slide }>(`/api/slides/${id}`),
    update: (id: string, updates: Partial<Slide>) =>
      fetchAPI<{ success: boolean }>(`/api/slides/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      }),
    delete: (id: string) =>
      fetchAPI<{ success: boolean }>(`/api/slides/${id}`, {
        method: 'DELETE',
      }),
  },

  assets: {
    getSignedUrl: (filename: string, contentType: string) =>
      fetchAPI<{ signedUrl: string; assetUrl: string; expiresIn: number }>(
        '/api/assets/sign',
        {
          method: 'POST',
          body: JSON.stringify({ filename, contentType }),
        }
      ),
  },

  sessions: {
    create: (deckId: string) =>
      fetchAPI<{
        session: Session;
        presenterToken: string;
        viewerUrl: string;
      }>('/api/session', {
        method: 'POST',
        body: JSON.stringify({ deckId }),
      }),
    end: (sessionId: string) =>
      fetchAPI<{ success: boolean; endedAt: string }>('/api/session', {
        method: 'PATCH',
        body: JSON.stringify({ sessionId }),
      }),
  },

  auth: {
    mintToken: (sessionId: string, role: 'presenter' | 'viewer') =>
      fetchAPI<{ token: string; expiresIn: number }>('/api/auth/jwt', {
        method: 'POST',
        body: JSON.stringify({ sessionId, role }),
      }),
  },
};

