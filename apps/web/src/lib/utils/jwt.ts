/**
 * JWT utilities for viewer authentication
 * GUARDRAIL: Short-lived tokens, verify on WS connect
 */

import type { JWTPayload } from '@deck/shared';

/**
 * Extract JWT from viewer URL query params
 */
export function extractViewerToken(): string | null {
  if (typeof window === 'undefined') return null;
  
  const params = new URLSearchParams(window.location.search);
  return params.get('t');
}

/**
 * Verify JWT payload (stub - implement with actual JWT library)
 */
export async function verifyJWT(token: string): Promise<JWTPayload | null> {
  // TODO: Implement with jsonwebtoken or jose
  // For now, stub implementation
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    
    // Check expiration
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      console.warn('[JWT] Token expired');
      return null;
    }
    
    return payload as JWTPayload;
  } catch (error) {
    console.error('[JWT] Invalid token:', error);
    return null;
  }
}

/**
 * Sign JWT (stub - implement with actual JWT library)
 */
export async function signJWT(
  payload: Omit<JWTPayload, 'exp'>,
  expiresIn: number = 86400 // 24h default
): Promise<string> {
  // TODO: Implement with jsonwebtoken or jose
  const secret = process.env.JWT_SECRET;
  
  if (!secret) {
    throw new Error('JWT_SECRET not configured');
  }
  
  const fullPayload: JWTPayload = {
    ...payload,
    exp: Math.floor(Date.now() / 1000) + expiresIn,
  };
  
  // Stub: return base64 encoded payload (INSECURE - replace with real JWT)
  return `stub.${btoa(JSON.stringify(fullPayload))}.stub`;
}

/**
 * GUARDRAIL: Max token TTL is 24 hours for viewers
 */
export const MAX_VIEWER_TOKEN_TTL = 86400; // 24h in seconds
export const MAX_PRESENTER_TOKEN_TTL = 86400; // 24h in seconds

