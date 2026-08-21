export type Tool =
  | "select"
  | "hand"
  | "pencil"
  | "line"
  | "arrow"
  | "rectangle"
  | "circle"
  | "diamond"
  | "triangle"
  | "text"
  | "sticky"
  | "table"
  | "relation"
  | "image"
  | "eraser"
  | "laser"
  | "zoom-in"
  | "zoom-out"
  | "undo"
  | "redo";

// Tools whose shapes are persisted/synced. "laser" is deliberately excluded —
// it's a presentational, ephemeral pointer trail, never saved or added to `shapes`.
export const PERSISTABLE_TOOLS = [
  "pencil",
  "eraser",
  "line",
  "arrow",
  "rectangle",
  "circle",
  "diamond",
  "triangle",
  "text",
  "sticky",
  "table",
  "relation",
] as const;

export interface TableColumn {
  id: string;
  name: string;
  type: string;
  isPrimaryKey?: boolean;
  isForeignKey?: boolean;
}

export type Cardinality = "one-to-one" | "one-to-many" | "many-to-one" | "many-to-many";

export interface Point {
  x: number;
  y: number;
}

export interface LaserPoint extends Point {
  t: number;
}

export interface Shape {
  id: string;
  authorId: string;

  tool: Tool;

  color: string;
  width: number;

  points?: Point[];

  startX?: number;
  startY?: number;

  endX?: number;
  endY?: number;

  text?: string;

  // Sticky-note background color (separate from `color`, which is the stroke/text color).
  noteColor?: string;

  // "table" — reuses startX/startY/endX/endY (above) as its bounding box.
  tableName?: string;
  columns?: TableColumn[];

  // "relation" — deliberately stores NO coordinates. Its line path is derived
  // at render time from the live position of the two anchor tables, so
  // dragging a table moves its relations for free, with no extra sync traffic.
  fromShapeId?: string;
  fromColumnId?: string;
  toShapeId?: string;
  toColumnId?: string;
  cardinality?: Cardinality;
}

export interface RemoteCursor {
  userId: string;
  color: string;
  x: number;
  y: number;
  updatedAt: number;
}

export interface RemoteLaserPath {
  userId: string;
  color: string;
  points: LaserPoint[];
}

export interface AckResponse {
  ok: boolean;
  error?: string;
}

// A pending or completed endpoint of a "relation" — a specific column row on
// a specific "table" shape.
export interface RelationAnchor {
  shapeId: string;
  columnId: string;
}

// Wire format persisted/broadcast by sketch-service.
export interface ShapeDto {
  _id: string;
  roomId: string;
  tool: Tool;
  data: Record<string, unknown>;
  createdBy: string;
  updatedBy?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GetBoardSnapshotResponse {
  success: boolean;
  message: string;
  data: ShapeDto[];
}
