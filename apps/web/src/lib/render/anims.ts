import type { Animation } from '@deck/shared';

export type AnimConfig = {
  initial: Record<string, unknown>;
  animate: Record<string, unknown>;
  transition: Record<string, unknown>;
};

export function getAnimationConfig(animation: Animation): AnimConfig {
  const durationMs = animation.durationMs;
  const delayMs = animation.delayMs ?? 0;
  const easing = animation.easing ?? 'easeInOut';
  
  const transition = {
    duration: durationMs / 1000,
    delay: delayMs / 1000,
    ease: easing,
  };

  switch (animation.kind) {
    case 'fade':
      return {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        transition,
      };

    case 'move':
      return {
        initial: { x: -50, opacity: 0 },
        animate: { x: 0, opacity: 1 },
        transition,
      };

    case 'scale':
      return {
        initial: { scale: 0, opacity: 0 },
        animate: { scale: 1, opacity: 1 },
        transition,
      };

    case 'dissolve':
      return {
        initial: { opacity: 0, filter: 'blur(10px)' },
        animate: { opacity: 1, filter: 'blur(0px)' },
        transition,
      };

    default:
      return {
        initial: {},
        animate: {},
        transition,
      };
  }
}

export function sortAnimationsByOrder(animations: Animation[]): Animation[] {
  return [...animations].sort((a, b) => a.order - b.order);
}

