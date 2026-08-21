import { pointToLineDistance } from "./shapeGeometry";
import { buildOrthogonalPath } from "./orthogonalRouting";
import type { Cardinality, Point, Shape, TableColumn } from "../../../types/canvas.types";

export const HEADER_HEIGHT = 32;
export const ROW_HEIGHT = 26;
export const FOOTER_HEIGHT = 26;
export const DEFAULT_TABLE_WIDTH = 220;
export const ANCHOR_STUB = 16;

export const CARDINALITIES: Cardinality[] = [
  "one-to-many",
  "many-to-one",
  "many-to-many",
  "one-to-one",
];

export const SQL_TYPES = [
  "string",
  "text",
  "int",
  "bigint",
  "float",
  "boolean",
  "uuid",
  "datetime",
  "date",
  "json",
];

export function tableHeight(columns: TableColumn[]): number {
  return HEADER_HEIGHT + columns.length * ROW_HEIGHT + FOOTER_HEIGHT;
}

// The only place column-count changes should touch `endY` — routing every
// column mutation through this keeps the DOM box and the anchor math in sync.
export function tableColumnsPatch(table: Shape, columns: TableColumn[]): Partial<Shape> {
  return { columns, endY: (table.startY ?? 0) + tableHeight(columns) };
}

export function columnRowY(table: Shape, index: number): number {
  return (table.startY ?? 0) + HEADER_HEIGHT + index * ROW_HEIGHT + ROW_HEIGHT / 2;
}

export function resolveColumnAnchor(
  table: Shape,
  columnId: string,
  side: "left" | "right"
): Point | null {
  const index = table.columns?.findIndex((c) => c.id === columnId) ?? -1;
  if (index === -1 || table.startX === undefined || table.endX === undefined) return null;

  return {
    x: side === "left" ? table.startX : table.endX,
    y: columnRowY(table, index),
  };
}

export interface RelationPath {
  points: Point[];
  fromSide: "left" | "right";
  toSide: "left" | "right";
}

// Both ends are always resolved to "face" each other (source exits toward the
// target's center; see the side-selection below), so buildOrthogonalPath
// produces a clean Z-route between two different tables and naturally
// degenerates into a C-shaped self-loop when a relation anchors two columns
// of the very same table (both stubs share one x, so the two midpoints
// collapse onto that shared vertical run).
export function resolveRelationPath(
  relation: Shape,
  shapesById: Map<string, Shape>
): RelationPath | null {
  const { fromShapeId, fromColumnId, toShapeId, toColumnId } = relation;
  if (!fromShapeId || !fromColumnId || !toShapeId || !toColumnId) return null;

  const fromTable = shapesById.get(fromShapeId);
  const toTable = shapesById.get(toShapeId);
  if (!fromTable || !toTable || fromTable.tool !== "table" || toTable.tool !== "table") {
    return null;
  }

  const sameTable = fromShapeId === toShapeId;

  const fromCenterX = ((fromTable.startX ?? 0) + (fromTable.endX ?? 0)) / 2;
  const toCenterX = ((toTable.startX ?? 0) + (toTable.endX ?? 0)) / 2;

  let fromSide: "left" | "right";
  let toSide: "left" | "right";

  if (sameTable) {
    fromSide = "right";
    toSide = "right";
  } else if (fromCenterX <= toCenterX) {
    fromSide = "right";
    toSide = "left";
  } else {
    fromSide = "left";
    toSide = "right";
  }

  const a = resolveColumnAnchor(fromTable, fromColumnId, fromSide);
  const b = resolveColumnAnchor(toTable, toColumnId, toSide);
  if (!a || !b) return null;

  const points = buildOrthogonalPath(a, fromSide, b, toSide, ANCHOR_STUB);

  return { points, fromSide, toSide };
}

export function hitTestRelation(
  relation: Shape,
  shapesById: Map<string, Shape>,
  x: number,
  y: number,
  tolerance = 8
): boolean {
  const path = resolveRelationPath(relation, shapesById);
  if (!path) return false;

  for (let i = 0; i < path.points.length - 1; i++) {
    const a = path.points[i];
    const b = path.points[i + 1];

    if (pointToLineDistance(x, y, a.x, a.y, b.x, b.y) <= tolerance) return true;
  }

  return false;
}

export function nextCardinality(current: Cardinality | undefined): Cardinality {
  const index = current ? CARDINALITIES.indexOf(current) : -1;
  return CARDINALITIES[(index + 1) % CARDINALITIES.length];
}
