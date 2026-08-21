import type { Point } from "../../../types/canvas.types";

// Shared orthogonal-elbow routing primitives — used by both the table-relation
// router (tableGeometry.ts, left/right sides only) and the general
// shape-to-shape arrow connector router (connectorGeometry.ts, all 4 sides).
// Pure geometry: no shape/React/canvas knowledge.

export type Side = "left" | "right" | "top" | "bottom";

export const axisOf = (side: Side): "h" | "v" => (side === "left" || side === "right" ? "h" : "v");

export const dirFor = (side: Side): 1 | -1 => (side === "right" || side === "bottom" ? 1 : -1);

export function stubPoint(point: Point, side: Side, stubLength: number): Point {
  return axisOf(side) === "h"
    ? { x: point.x + dirFor(side) * stubLength, y: point.y }
    : { x: point.x, y: point.y + dirFor(side) * stubLength };
}

// Both endpoints always "face" each other by construction (side selection is
// the caller's job), so this only ever needs two cases:
//  - same axis (both h or both v): a Z/C elbow via a midline on the other axis
//  - different axis (one h, one v): a single-corner L path
export function buildOrthogonalPath(
  a: Point,
  sideA: Side,
  b: Point,
  sideB: Side,
  stubLength: number
): Point[] {
  const a1 = stubPoint(a, sideA, stubLength);
  const b1 = stubPoint(b, sideB, stubLength);

  if (axisOf(sideA) === axisOf(sideB)) {
    if (axisOf(sideA) === "h") {
      const midX = (a1.x + b1.x) / 2;
      return [a, a1, { x: midX, y: a1.y }, { x: midX, y: b1.y }, b1, b];
    }

    const midY = (a1.y + b1.y) / 2;
    return [a, a1, { x: a1.x, y: midY }, { x: b1.x, y: midY }, b1, b];
  }

  const corner = axisOf(sideA) === "h" ? { x: a1.x, y: b1.y } : { x: b1.x, y: a1.y };
  return [a, a1, corner, b1, b];
}
