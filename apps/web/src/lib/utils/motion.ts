/**
 * Motion utility - handles reduced motion preferences
 * GUARDRAIL: Respect prefers-reduced-motion
 */

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function getMotionDuration(normalMs: number): number {
  return prefersReducedMotion() ? Math.min(normalMs, 200) : normalMs;
}

/**
 * Get safe transition - falls back to cross-fade if reduced motion
 */
export function getSafeTransition<T extends { kind: string; durationMs: number }>(
  transition: T | undefined
): T {
  const reduced = prefersReducedMotion();
  
  if (!transition) {
    return {
      kind: 'fade',
      durationMs: 250,
    } as T;
  }
  
  if (reduced) {
    return {
      ...transition,
      kind: 'fade',
      durationMs: Math.min(transition.durationMs, 200),
    };
  }
  
  return transition;
}

/**
 * React hook for reduced motion
 */
export function useReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  
  const [reduced, setReduced] = React.useState(prefersReducedMotion());
  
  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      setReduced(e.matches);
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);
  
  return reduced;
}

// Re-export for convenience
import React from 'react';

