import type { Cardinality, Point, Shape } from "../../../types/canvas.types";
import type { RelationPath } from "./tableGeometry";

// ===========================================================================
// ER-diagram relation rendering (crow's-foot cardinality notation)
// ===========================================================================

// The routed path always leaves/enters each table horizontally, so end
// markers only need a direction sign (+1/-1), never trig.
const dirFor = (side: "left" | "right") => (side === "right" ? 1 : -1);

function drawOneTick(ctx: CanvasRenderingContext2D, point: Point, dir: number) {
  const x = point.x + dir * 10;

  ctx.beginPath();
  ctx.moveTo(x, point.y - 6);
  ctx.lineTo(x, point.y + 6);
  ctx.stroke();
}

function drawCrowsFoot(ctx: CanvasRenderingContext2D, point: Point, dir: number) {
  const x = point.x + dir * 12;

  ctx.beginPath();
  ctx.moveTo(x, point.y - 7);
  ctx.lineTo(point.x, point.y);
  ctx.lineTo(x, point.y + 7);
  ctx.stroke();
}

function drawEndMarker(
  ctx: CanvasRenderingContext2D,
  point: Point,
  side: "left" | "right",
  isMany: boolean
) {
  const dir = dirFor(side);
  if (isMany) drawCrowsFoot(ctx, point, dir);
  else drawOneTick(ctx, point, dir);
}

const isManyEnd = (cardinality: Cardinality | undefined, end: "from" | "to") => {
  switch (cardinality) {
    case "one-to-many":
      return end === "to";
    case "many-to-one":
      return end === "from";
    case "many-to-many":
      return true;
    default: // "one-to-one" or unset
      return false;
  }
};

export function drawRelation(
  ctx: CanvasRenderingContext2D,
  relation: Shape,
  path: RelationPath,
  isSelected: boolean
) {
  ctx.save();

  ctx.strokeStyle = isSelected ? "#3b82f6" : relation.color;
  ctx.lineWidth = isSelected ? relation.width + 1.5 : relation.width;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  ctx.beginPath();
  ctx.moveTo(path.points[0].x, path.points[0].y);
  path.points.slice(1).forEach((point) => ctx.lineTo(point.x, point.y));
  ctx.stroke();

  drawEndMarker(ctx, path.points[0], path.fromSide, isManyEnd(relation.cardinality, "from"));
  drawEndMarker(
    ctx,
    path.points[path.points.length - 1],
    path.toSide,
    isManyEnd(relation.cardinality, "to")
  );

  ctx.restore();
}

// ===========================================================================
// Smart (bound) arrow rendering — filled circle at the source, hollow circle
// at the target, in place of the usual triangular arrowhead.
// ===========================================================================

function drawFilledCircle(ctx: CanvasRenderingContext2D, point: Point, radius: number, color: string) {
  ctx.beginPath();
  ctx.fillStyle = color;
  ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
  ctx.fill();
}

function drawHollowCircle(ctx: CanvasRenderingContext2D, point: Point, radius: number, color: string) {
  // Punch a transparent hole first (destination-out), same trick the eraser
  // tool already uses, so the circle reads as hollow regardless of whatever
  // color is underneath it.
  ctx.save();
  ctx.beginPath();
  ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
  ctx.globalCompositeOperation = "destination-out";
  ctx.fill();
  ctx.restore();

  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
  ctx.stroke();
}

export function drawSmartConnector(
  ctx: CanvasRenderingContext2D,
  arrow: Shape,
  points: Point[],
  isSelected: boolean
) {
  if (points.length < 2) return;

  const color = isSelected ? "#3b82f6" : arrow.color;

  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = isSelected ? arrow.width + 1.5 : arrow.width;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  points.slice(1).forEach((point) => ctx.lineTo(point.x, point.y));
  ctx.stroke();
  ctx.restore();

  const radius = Math.max(4, arrow.width + 2);
  drawFilledCircle(ctx, points[0], radius, color);
  drawHollowCircle(ctx, points[points.length - 1], radius, color);
}
