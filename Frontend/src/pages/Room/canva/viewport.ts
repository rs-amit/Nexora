import type { Point } from "../../../types/canvas.types";

// screen position = world position * zoom + pan — the single transform
// shared by the main canvas (via ctx.translate/scale), the DOM shape layers
// (via an equivalent CSS transform), and mouse-coordinate conversion.

export const MIN_ZOOM = 0.2;
export const MAX_ZOOM = 4;

export function clampZoom(zoom: number): number {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom));
}

export function screenToWorld(point: Point, pan: Point, zoom: number): Point {
  return { x: (point.x - pan.x) / zoom, y: (point.y - pan.y) / zoom };
}

export function worldToScreen(point: Point, pan: Point, zoom: number): Point {
  return { x: point.x * zoom + pan.x, y: point.y * zoom + pan.y };
}
