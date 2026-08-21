import type { Shape } from "../../../types/canvas.types";

export function pointToLineDistance(
  px: number,
  py: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number
) {
  const A = px - x1;
  const B = py - y1;
  const C = x2 - x1;
  const D = y2 - y1;

  const dot = A * C + B * D;
  const lenSq = C * C + D * D;

  let param = -1;
  if (lenSq !== 0) param = dot / lenSq;

  let xx: number, yy: number;

  if (param < 0) {
    xx = x1;
    yy = y1;
  } else if (param > 1) {
    xx = x2;
    yy = y2;
  } else {
    xx = x1 + param * C;
    yy = y1 + param * D;
  }

  const dx = px - xx;
  const dy = py - yy;

  return Math.sqrt(dx * dx + dy * dy);
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

// Used both for hand-tool hit testing and for positioning DOM overlays
// (sticky notes, the text editor, remote selection outlines) over a shape.
export function getShapeBoundingBox(shape: Shape): BoundingBox | null {
  if (
    (shape.tool === "rectangle" ||
      shape.tool === "diamond" ||
      shape.tool === "triangle" ||
      shape.tool === "sticky" ||
      shape.tool === "table") &&
    shape.startX !== undefined &&
    shape.startY !== undefined &&
    shape.endX !== undefined &&
    shape.endY !== undefined
  ) {
    const x = Math.min(shape.startX, shape.endX);
    const y = Math.min(shape.startY, shape.endY);

    return {
      x,
      y,
      width: Math.abs(shape.endX - shape.startX),
      height: Math.abs(shape.endY - shape.startY),
    };
  }

  if (
    shape.tool === "circle" &&
    shape.startX !== undefined &&
    shape.startY !== undefined &&
    shape.endX !== undefined &&
    shape.endY !== undefined
  ) {
    const radius = Math.sqrt(
      (shape.endX - shape.startX) ** 2 + (shape.endY - shape.startY) ** 2
    );

    return { x: shape.startX - radius, y: shape.startY - radius, width: radius * 2, height: radius * 2 };
  }

  if (
    (shape.tool === "line" || shape.tool === "arrow") &&
    shape.startX !== undefined &&
    shape.startY !== undefined &&
    shape.endX !== undefined &&
    shape.endY !== undefined
  ) {
    const x = Math.min(shape.startX, shape.endX);
    const y = Math.min(shape.startY, shape.endY);

    return {
      x,
      y,
      width: Math.abs(shape.endX - shape.startX) || 1,
      height: Math.abs(shape.endY - shape.startY) || 1,
    };
  }

  if (shape.tool === "text" && shape.startX !== undefined && shape.startY !== undefined) {
    return { x: shape.startX, y: shape.startY - 20, width: 200, height: 30 };
  }

  if ((shape.tool === "pencil" || shape.tool === "eraser") && shape.points?.length) {
    const xs = shape.points.map((p) => p.x);
    const ys = shape.points.map((p) => p.y);
    const x = Math.min(...xs);
    const y = Math.min(...ys);

    return { x, y, width: Math.max(...xs) - x, height: Math.max(...ys) - y };
  }

  return null;
}

// "sticky" and "table" are excluded here on purpose — they're DOM elements
// (StickyNoteLayer / TableNodeLayer) that handle their own mouse events
// directly, not canvas-hit-tested shapes. "relation" is excluded too, but for
// a different reason: it has no geometry of its own to hit-test here (its
// path depends on two other shapes), so it's resolved and hit-tested
// separately via tableGeometry.hitTestRelation. A "bound" arrow (fromShapeId
// or toShapeId set) is excluded for the same reason as relation — its stored
// startX/Y/endX/Y go stale once the shape(s) it's bound to move, so it's
// resolved/hit-tested via connectorGeometry.hitTestArrowConnector instead.
export function hitTestShape(shape: Shape, x: number, y: number): boolean {
  switch (shape.tool) {
    case "rectangle":
    case "diamond":
    case "triangle": {
      const box = getShapeBoundingBox(shape);
      if (!box) return false;
      return x >= box.x && x <= box.x + box.width && y >= box.y && y <= box.y + box.height;
    }

    case "circle": {
      if (
        shape.startX === undefined ||
        shape.startY === undefined ||
        shape.endX === undefined ||
        shape.endY === undefined
      )
        return false;

      const radius = Math.sqrt(
        (shape.endX - shape.startX) ** 2 + (shape.endY - shape.startY) ** 2
      );
      const distance = Math.sqrt((x - shape.startX) ** 2 + (y - shape.startY) ** 2);

      return distance <= radius;
    }

    case "line":
    case "arrow": {
      if (shape.tool === "arrow" && (shape.fromShapeId || shape.toShapeId)) return false;

      if (
        shape.startX === undefined ||
        shape.startY === undefined ||
        shape.endX === undefined ||
        shape.endY === undefined
      )
        return false;

      return pointToLineDistance(x, y, shape.startX, shape.startY, shape.endX, shape.endY) < 10;
    }

    case "pencil":
    case "eraser": {
      if (!shape.points) return false;
      return shape.points.some(
        (point) => Math.sqrt((x - point.x) ** 2 + (y - point.y) ** 2) < 10
      );
    }

    case "text": {
      if (shape.startX === undefined || shape.startY === undefined) return false;
      return (
        x >= shape.startX &&
        x <= shape.startX + 150 &&
        y >= shape.startY - 20 &&
        y <= shape.startY + 10
      );
    }

    default:
      return false;
  }
}
