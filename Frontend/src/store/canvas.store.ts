import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { useCollaboration } from "../service/collaboration.service";
import { getCurrentUser } from "../lib/currentUser";
import { userColor } from "../utils/userColor";
import { clampZoom, screenToWorld } from "../pages/Room/canva/viewport";
import type {
  Point,
  RemoteCursor,
  RemoteLaserPath,
  Shape,
  Tool,
} from "../types/canvas.types";

interface RemoteDragger {
  userId: string;
  color: string;
  lastSeen: number;
}

interface CanvasContextValue {
  shapes: Shape[];
  getShape: (id: string) => Shape | undefined;

  activeTool: Tool;
  strokeColor: string;
  strokeWidth: number;
  setActiveTool: (tool: Tool) => void;
  setStrokeColor: (color: string) => void;
  setStrokeWidth: (width: number) => void;

  selectedShapeId: string | null;
  setSelectedShapeId: (id: string | null) => void;
  editingShapeId: string | null;
  setEditingShapeId: (id: string | null) => void;

  addLocalShape: (shape: Shape, opts?: { emit?: boolean }) => void;
  updateLocalShape: (
    id: string,
    patch: Partial<Shape>,
    opts?: { emit?: boolean; force?: boolean }
  ) => void;
  // Returns every shape actually removed (a table delete cascades to its
  // relations), so callers like undo() can group them for a single redo.
  deleteLocalShape: (id: string, opts?: { emit?: boolean }) => Shape[];

  undo: () => void;
  redo: () => void;

  connected: boolean;
  loadingSnapshot: boolean;

  currentUserId: string | undefined;
  remoteCursors: RemoteCursor[];
  remoteDraggersByShapeId: Record<string, RemoteDragger>;
  remoteLaserPaths: RemoteLaserPath[];

  emitCursorMove: (point: Point) => void;
  emitLaserMove: (point: Point, color: string) => void;

  // Per-viewer only — never synced/persisted. See viewport.ts for the
  // screen = world * zoom + pan convention shared by the canvas ctx
  // transform and the DOM layers' CSS transform.
  zoom: number;
  pan: Point;
  setViewportSize: (size: { width: number; height: number }) => void;
  zoomAt: (anchorScreenPoint: Point, factor: number) => void;
  zoomBy: (factor: number) => void;
  panBy: (dxScreen: number, dyScreen: number) => void;
  resetView: () => void;
}

const CanvasContext = createContext<CanvasContextValue | null>(null);

const UPDATE_EMIT_THROTTLE_MS = 60;
const CURSOR_STALE_MS = 10000;
const DRAGGER_STALE_MS = 350;
const LASER_STALE_MS = 1500;

export function CanvasProvider({
  roomId,
  children,
}: {
  roomId: string;
  children: ReactNode;
}) {
  const currentUser = useMemo(() => getCurrentUser(), []);

  const [byId, setById] = useState<Record<string, Shape>>({});
  const [order, setOrder] = useState<string[]>([]);
  const byIdRef = useRef<Record<string, Shape>>({});
  byIdRef.current = byId;

  const [activeTool, setActiveTool] = useState<Tool>("select");
  const [strokeColor, setStrokeColor] = useState("#ffffff");
  const [strokeWidth, setStrokeWidth] = useState(2);

  const [selectedShapeId, setSelectedShapeId] = useState<string | null>(null);
  const [editingShapeId, setEditingShapeId] = useState<string | null>(null);

  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState<Point>({ x: 0, y: 0 });
  const viewportSizeRef = useRef({ width: 0, height: 0 });

  // Local-only, per-author undo/redo — reuses the normal add/delete emit
  // path, so it needs no new backend surface. Remote shapes are never
  // pushed onto this stack, so undo only ever affects your own shapes.
  // Each entry is a *group* (a deleted table plus any relations cascaded
  // with it), so redo restores every shape from one undo in one step.
  const redoStackRef = useRef<Shape[][]>([]);

  const lastUpdateEmitRef = useRef<Record<string, number>>({});

  const [remoteCursorsById, setRemoteCursorsById] = useState<
    Record<string, RemoteCursor>
  >({});
  const [remoteDraggersByShapeId, setRemoteDraggersByShapeId] = useState<
    Record<string, RemoteDragger>
  >({});
  const [remoteLaserById, setRemoteLaserById] = useState<
    Record<string, RemoteLaserPath & { lastSeen: number }>
  >({});

  const applySnapshot = useCallback((shapes: Shape[]) => {
    const nextById: Record<string, Shape> = {};
    const nextOrder: string[] = [];

    shapes.forEach((shape) => {
      nextById[shape.id] = shape;
      nextOrder.push(shape.id);
    });

    byIdRef.current = nextById;
    setById(nextById);
    setOrder(nextOrder);
  }, []);

  const applyRemoteAdd = useCallback((shape: Shape) => {
    if (byIdRef.current[shape.id]) return; // already present via snapshot

    byIdRef.current = { ...byIdRef.current, [shape.id]: shape };
    setById(byIdRef.current);
    setOrder((prev) => (prev.includes(shape.id) ? prev : [...prev, shape.id]));
  }, []);

  const applyRemoteUpdate = useCallback(
    (shapeId: string, data: Partial<Shape>, updatedBy?: string) => {
      const existing = byIdRef.current[shapeId];
      if (!existing) return;

      const merged = { ...existing, ...data };
      byIdRef.current = { ...byIdRef.current, [shapeId]: merged };
      setById(byIdRef.current);

      if (updatedBy && updatedBy !== currentUser?.id) {
        setRemoteDraggersByShapeId((prev) => ({
          ...prev,
          [shapeId]: {
            userId: updatedBy,
            color: userColor(updatedBy),
            lastSeen: Date.now(),
          },
        }));
      }
    },
    [currentUser]
  );

  const applyRemoteDelete = useCallback((shapeId: string) => {
    if (!byIdRef.current[shapeId]) return;

    const next = { ...byIdRef.current };
    delete next[shapeId];
    byIdRef.current = next;
    setById(next);
    setOrder((prev) => prev.filter((id) => id !== shapeId));
  }, []);

  const setRemoteCursor = useCallback(
    (userId: string, x: number, y: number) => {
      if (userId === currentUser?.id) return;

      setRemoteCursorsById((prev) => ({
        ...prev,
        [userId]: { userId, color: userColor(userId), x, y, updatedAt: Date.now() },
      }));
    },
    [currentUser]
  );

  const setRemoteLaser = useCallback(
    (userId: string, points: RemoteLaserPath["points"], color: string) => {
      if (userId === currentUser?.id) return;

      const now = Date.now();

      setRemoteLaserById((prev) => {
        const existing = prev[userId];
        const merged = [...(existing?.points ?? []), ...points]
          .filter((point) => now - point.t < LASER_STALE_MS)
          .slice(-60);

        return { ...prev, [userId]: { userId, color, points: merged, lastSeen: now } };
      });
    },
    [currentUser]
  );

  const collab = useCollaboration(roomId, {
    onSnapshotLoaded: applySnapshot,
    onShapeAdded: applyRemoteAdd,
    onShapeUpdated: applyRemoteUpdate,
    onShapeDeleted: applyRemoteDelete,
    onCursorMove: ({ userId, x, y }) => setRemoteCursor(userId, x, y),
    onLaserPath: ({ userId, points, color }) => setRemoteLaser(userId, points, color),
  });

  const addLocalShape = useCallback(
    (shape: Shape, opts?: { emit?: boolean }) => {
      byIdRef.current = { ...byIdRef.current, [shape.id]: shape };
      setById(byIdRef.current);
      setOrder((prev) => [...prev, shape.id]);

      if (opts?.emit === false) return;

      collab.emitAddShape(shape, (ack) => {
        if (!ack.ok) console.error("Failed to sync new shape:", ack.error);
      });
    },
    [collab]
  );

  const updateLocalShape = useCallback(
    (id: string, patch: Partial<Shape>, opts?: { emit?: boolean; force?: boolean }) => {
      const existing = byIdRef.current[id];
      if (!existing) return;

      const merged = { ...existing, ...patch };
      byIdRef.current = { ...byIdRef.current, [id]: merged };
      setById(byIdRef.current);

      if (opts?.emit === false) return;

      const now = Date.now();
      const last = lastUpdateEmitRef.current[id] ?? 0;

      if (!opts?.force && now - last < UPDATE_EMIT_THROTTLE_MS) return;
      lastUpdateEmitRef.current[id] = now;

      collab.emitUpdateShape(merged, (ack) => {
        if (!ack.ok) console.error("Failed to sync shape update:", ack.error);
      });
    },
    [collab]
  );

  const deleteLocalShape = useCallback(
    (id: string, opts?: { emit?: boolean }): Shape[] => {
      const target = byIdRef.current[id];
      if (!target) return [];

      // Deleting any shape cascades to relations/arrows anchored to it — a
      // relation or bound arrow pointing at a shape that no longer exists is
      // meaningless. Relations only ever reference tables in practice, but
      // arrows can bind to any of the six bindable shape types, so this runs
      // for every delete, not just tables.
      const idsToDelete = [id];

      Object.values(byIdRef.current).forEach((shape) => {
        const isDependentRelation =
          shape.tool === "relation" && (shape.fromShapeId === id || shape.toShapeId === id);
        const isDependentArrow =
          shape.tool === "arrow" && (shape.fromShapeId === id || shape.toShapeId === id);

        if (isDependentRelation || isDependentArrow) idsToDelete.push(shape.id);
      });

      const removedShapes = idsToDelete
        .map((sid) => byIdRef.current[sid])
        .filter((shape): shape is Shape => Boolean(shape));

      const next = { ...byIdRef.current };
      idsToDelete.forEach((sid) => delete next[sid]);
      byIdRef.current = next;
      setById(next);
      setOrder((prev) => prev.filter((sid) => !idsToDelete.includes(sid)));

      if (opts?.emit !== false) {
        idsToDelete.forEach((sid) => {
          collab.emitDeleteShape(sid, (ack) => {
            if (!ack.ok) console.error("Failed to sync shape delete:", ack.error);
          });
        });
      }

      return removedShapes;
    },
    [collab]
  );

  const undo = useCallback(() => {
    if (!currentUser) return;

    for (let i = order.length - 1; i >= 0; i--) {
      const id = order[i];
      const shape = byIdRef.current[id];

      if (shape && shape.authorId === currentUser.id) {
        const removedGroup = deleteLocalShape(id);
        if (removedGroup.length > 0) redoStackRef.current.push(removedGroup);
        return;
      }
    }
  }, [order, currentUser, deleteLocalShape]);

  const redo = useCallback(() => {
    const group = redoStackRef.current.pop();
    if (!group || group.length === 0) return;

    group.forEach((shape) => addLocalShape(shape));
  }, [addLocalShape]);

  const setViewportSize = useCallback((size: { width: number; height: number }) => {
    viewportSizeRef.current = size;
  }, []);

  // Keeps the world point under `anchorScreenPoint` fixed on screen while
  // changing zoom — the standard "zoom toward cursor" (or viewport center,
  // via zoomBy) behavior.
  const zoomAt = useCallback(
    (anchorScreenPoint: Point, factor: number) => {
      const newZoom = clampZoom(zoom * factor);
      if (newZoom === zoom) return;

      const worldPoint = screenToWorld(anchorScreenPoint, pan, zoom);

      setZoom(newZoom);
      setPan({
        x: anchorScreenPoint.x - worldPoint.x * newZoom,
        y: anchorScreenPoint.y - worldPoint.y * newZoom,
      });
    },
    [zoom, pan]
  );

  const zoomBy = useCallback(
    (factor: number) => {
      const { width, height } = viewportSizeRef.current;
      zoomAt({ x: width / 2, y: height / 2 }, factor);
    },
    [zoomAt]
  );

  // `pan` is already a screen-space offset by definition, so a screen-space
  // wheel delta is added directly — no zoom division needed here (unlike
  // shape-drag deltas, which measure movement in world units).
  const panBy = useCallback((dxScreen: number, dyScreen: number) => {
    setPan((prev) => ({ x: prev.x + dxScreen, y: prev.y + dyScreen }));
  }, []);

  const resetView = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  const shapes = useMemo(
    () => order.map((id) => byId[id]).filter((shape): shape is Shape => Boolean(shape)),
    [order, byId]
  );

  const getShape = useCallback((id: string) => byIdRef.current[id], []);

  const remoteCursors = useMemo(
    () => Object.values(remoteCursorsById).filter((c) => Date.now() - c.updatedAt < CURSOR_STALE_MS),
    [remoteCursorsById]
  );

  const remoteDraggers = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(remoteDraggersByShapeId).filter(
          ([, dragger]) => Date.now() - dragger.lastSeen < DRAGGER_STALE_MS
        )
      ),
    [remoteDraggersByShapeId]
  );

  const remoteLaserPaths = useMemo(
    () =>
      Object.values(remoteLaserById)
        .filter((entry) => Date.now() - entry.lastSeen < LASER_STALE_MS)
        .map(({ userId, color, points }) => ({ userId, color, points })),
    [remoteLaserById]
  );

  const value: CanvasContextValue = {
    shapes,
    getShape,

    activeTool,
    strokeColor,
    strokeWidth,
    setActiveTool,
    setStrokeColor,
    setStrokeWidth,

    selectedShapeId,
    setSelectedShapeId,
    editingShapeId,
    setEditingShapeId,

    addLocalShape,
    updateLocalShape,
    deleteLocalShape,

    undo,
    redo,

    connected: collab.connected,
    loadingSnapshot: collab.loadingSnapshot,

    currentUserId: currentUser?.id,
    remoteCursors,
    remoteDraggersByShapeId: remoteDraggers,
    remoteLaserPaths,

    emitCursorMove: collab.emitCursorMove,
    emitLaserMove: collab.emitLaserMove,

    zoom,
    pan,
    setViewportSize,
    zoomAt,
    zoomBy,
    panBy,
    resetView,
  };

  return createElement(CanvasContext.Provider, { value }, children);
}

export function useCanvasStore() {
  const context = useContext(CanvasContext);

  if (!context) {
    throw new Error("useCanvasStore must be used within a CanvasProvider");
  }

  return context;
}
