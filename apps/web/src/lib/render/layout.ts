import type { Element } from '@deck/shared';

export const SLIDE_WIDTH = 1280;
export const SLIDE_HEIGHT = 720;
export const SLIDE_ASPECT = SLIDE_WIDTH / SLIDE_HEIGHT;

export function calculateSlideScale(containerWidth: number, containerHeight: number) {
  const scaleX = containerWidth / SLIDE_WIDTH;
  const scaleY = containerHeight / SLIDE_HEIGHT;
  return Math.min(scaleX, scaleY);
}

export function getBoundingBox(element: Element) {
  return {
    x: element.x,
    y: element.y,
    width: element.w,
    height: element.h,
  };
}

export function isPointInElement(x: number, y: number, element: Element): boolean {
  return (
    x >= element.x &&
    x <= element.x + element.w &&
    y >= element.y &&
    y <= element.y + element.h
  );
}

export function sortElementsByZ(elements: Element[]): Element[] {
  return [...elements].sort((a, b) => a.z - b.z);
}

