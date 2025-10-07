import type { Transition } from '@deck/shared';
import { getSafeTransition } from '../utils/motion';

export type TransitionConfig = {
  initial: Record<string, unknown>;
  animate: Record<string, unknown>;
  exit: Record<string, unknown>;
  transition: Record<string, unknown>;
};

export function getTransitionConfig(transition?: Transition): TransitionConfig {
  // GUARDRAIL: Respect prefers-reduced-motion → cross-fade fallback
  const safeTransition = getSafeTransition(transition);
  
  const durationMs = safeTransition?.durationMs ?? 250;
  const easing = safeTransition?.easing ?? 'easeInOut';
  
  const baseDuration = durationMs / 1000;
  const baseTransition = { duration: baseDuration, ease: easing };

  // GUARDRAIL: Use CSS transforms/opacity only (GPU accelerated)
  switch (safeTransition?.kind) {
    case 'dissolve':
      return {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: baseTransition,
      };

    case 'cube':
      return {
        initial: { opacity: 0, rotateY: 90, scale: 0.8 },
        animate: { opacity: 1, rotateY: 0, scale: 1 },
        exit: { opacity: 0, rotateY: -90, scale: 0.8 },
        transition: baseTransition,
      };

    case 'pageFlip':
      return {
        initial: { opacity: 0, rotateX: 90, transformOrigin: 'bottom' },
        animate: { opacity: 1, rotateX: 0 },
        exit: { opacity: 0, rotateX: -90, transformOrigin: 'top' },
        transition: baseTransition,
      };

    case 'morphLite':
      return {
        initial: { opacity: 0, scale: 0.9 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 1.1 },
        transition: baseTransition,
      };

    case 'fade':
    default:
      return {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: baseTransition,
      };
  }
}

