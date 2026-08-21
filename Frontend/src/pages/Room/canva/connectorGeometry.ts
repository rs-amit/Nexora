import { getShapeBoundingBox, pointToLineDistance } from "./shapeGeometry";
import { buildOrthogonalPath, type Side } from "./orthogonalRouting";
import { ANCHOR_STUB } from "./tableGeometry";
import type { Point, Shape, Tool } from "../../../types/canvas.types";

// Shape types an arrow can snap onto — anything with a resolvable rectangular
// bounding box (see getShapeBoundingBox). Lines, other arrows, relations,
// text, and freehand strokes are not bind targets.
export const BINDABLE_TOOLS: Tool[] = [
  "rectangle",
  "circle",
  "diamond",
  "triangle",
  "sticky",
  "table",
];

const isBindable = (shape: Shape) => BINDABLE_TOOLS.includes(shape.tool);

export function findBindableShapeAt(
  shapes: Shape[],
  x: number,
  y: number,
  padding = 10
): Shape | null {
  for (let i = shapes.length - 1; i >= 0; i--) {
    const shape = shapes[i];
    if (!isBindable(shape)) continue;

    const box = getShapeBoundingBox(shape);
    if (!box) continue;

    if (
      x >= box.x - padding &&
      x <= box.x + box.width + padding &&
      y >= box.y - padding &&
      y <= box.y + box.height + padding
    ) {
      return shape;
    }
  }

  return null;
}

function sideTowardPoint(from: Point, to: Point): Side {
  const dx = to.x - from.x;
  const dy = to.y - from.y;

  if (Math.abs(dx) >= Math.abs(dy)) return dx >= 0 ? "right" : "left";
  return dy >= 0 ? "bottom" : "top";
}

function centerOf(shape: Shape): Point {
  const box = getShapeBoundingBox(shape);
  if (!box) return { x: shape.startX ?? 0, y: shape.startY ?? 0 };
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
}

export function resolveShapeAnchor(
  shape: Shape,
  towardPoint: Point
): { point: Point; side: Side } | null {
  const box = getShapeBoundingBox(shape);
  if (!box) return null;

  const centerX = box.x + box.width / 2;
  const centerY = box.y + box.height / 2;
  const side = sideTowardPoint({ x: centerX, y: centerY }, towardPoint);

  const point: Point =
    side === "left"
      ? { x: box.x, y: centerY }
      : side === "right"
        ? { x: box.x + box.width, y: centerY }
        : side === "top"
          ? { x: centerX, y: box.y }
          : { x: centerX, y: box.y + box.height };

  return { point, side };
}

// Returns null when the arrow isn't bound at either end (caller falls back to
// the plain straight-arrow rendering), or when a bind reference no longer
// resolves (its shape was deleted) — degrades gracefully, never throws.
export function resolveArrowPath(arrow: Shape, shapesById: Map<string, Shape>): Point[] | null {
  const { fromShapeId, toShapeId } = arrow;
  if (!fromShapeId && !toShapeId) return null;

  const fromShape = fromShapeId ? shapesById.get(fromShapeId) : undefined;
  const toShape = toShapeId ? shapesById.get(toShapeId) : undefined;

  if (fromShapeId && !fromShape) return null;
  if (toShapeId && !toShape) return null;

  const fallbackFrom: Point = { x: arrow.startX ?? 0, y: arrow.startY ?? 0 };
  const fallbackTo: Point = { x: arrow.endX ?? 0, y: arrow.endY ?? 0 };

  const fromAnchor = fromShape
    ? resolveShapeAnchor(fromShape, toShape ? centerOf(toShape) : fallbackTo)
    : null;
  const toAnchor = toShape
    ? resolveShapeAnchor(toShape, fromShape ? centerOf(fromShape) : fallbackFrom)
    : null;

  if (fromShape && !fromAnchor) return null;
  if (toShape && !toAnchor) return null;

  const a = fromAnchor?.point ?? fallbackFrom;
  const b = toAnchor?.point ?? fallbackTo;

  const sideA = fromAnchor?.side ?? sideTowardPoint(a, b);
  const sideB = toAnchor?.side ?? sideTowardPoint(b, a);

  return buildOrthogonalPath(a, sideA, b, sideB, ANCHOR_STUB);
}

export function hitTestArrowConnector(
  arrow: Shape,
  shapesById: Map<string, Shape>,
  x: number,
  y: number,
  tolerance = 8
): boolean {
  const points = resolveArrowPath(arrow, shapesById);
  if (!points) return false;

  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i];
    const b = points[i + 1];

    if (pointToLineDistance(x, y, a.x, a.y, b.x, b.y) <= tolerance) return true;
  }

  return false;
}
