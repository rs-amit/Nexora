import { useCallback, useEffect, useRef, useState } from "react";

import { getSketchSocket, disconnectSketchSocket } from "../socket/sketchSocket";
import { boardService } from "./board.service";
import type {
  AckResponse,
  LaserPoint,
  Point,
  Shape,
  ShapeDto,
} from "../types/canvas.types";

function dtoToShape(dto: ShapeDto): Shape {
  return {
    id: dto._id,
    authorId: dto.createdBy,
    tool: dto.tool,
    ...(dto.data as object),
  } as Shape;
}

function shapeToWire(shape: Shape) {
  const { id, authorId, tool, ...data } = shape;
  void authorId;
  return { id, tool, data };
}

export interface CollaborationHandlers {
  onSnapshotLoaded: (shapes: Shape[]) => void;
  onShapeAdded: (shape: Shape) => void;
  onShapeUpdated: (
    shapeId: string,
    data: Partial<Shape>,
    updatedBy?: string
  ) => void;
  onShapeDeleted: (shapeId: string) => void;
  onCursorMove: (payload: { userId: string; x: number; y: number }) => void;
  onLaserPath: (payload: {
    userId: string;
    points: LaserPoint[];
    color: string;
  }) => void;
}

const CURSOR_THROTTLE_MS = 50;
const LASER_THROTTLE_MS = 50;

// Mirrors ChatContext.tsx's socket lifecycle pattern, for the independent
// sketch-service socket: connect, join the room's board channel, fetch the
// persisted snapshot, and wire up live add/update/delete/cursor/laser events.
export function useCollaboration(
  roomId: string | undefined,
  handlers: CollaborationHandlers
) {
  const [connected, setConnected] = useState(false);
  const [loadingSnapshot, setLoadingSnapshot] = useState(true);

  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  const lastCursorEmit = useRef(0);
  const lastLaserEmit = useRef(0);

  useEffect(() => {
    if (!roomId) return;

    const socket = getSketchSocket();

    let cancelled = false;
    let snapshotReady = false;
    const buffered: Array<() => void> = [];

    const runOrBuffer = (fn: () => void) => {
      if (snapshotReady) fn();
      else buffered.push(fn);
    };

    const handleShapeAdded = (payload: { shape: ShapeDto }) => {
      runOrBuffer(() => handlersRef.current.onShapeAdded(dtoToShape(payload.shape)));
    };

    const handleShapeUpdated = (payload: {
      shapeId: string;
      data: Record<string, unknown>;
      updatedBy?: string;
    }) => {
      runOrBuffer(() =>
        handlersRef.current.onShapeUpdated(
          payload.shapeId,
          payload.data as Partial<Shape>,
          payload.updatedBy
        )
      );
    };

    const handleShapeDeleted = (payload: { shapeId: string }) => {
      runOrBuffer(() => handlersRef.current.onShapeDeleted(payload.shapeId));
    };

    const handleCursorMove = (payload: {
      userId: string;
      x: number;
      y: number;
    }) => {
      handlersRef.current.onCursorMove(payload);
    };

    const handleLaserPath = (payload: {
      userId: string;
      points: LaserPoint[];
      color: string;
    }) => {
      handlersRef.current.onLaserPath(payload);
    };

    socket.on("shape:added", handleShapeAdded);
    socket.on("shape:updated", handleShapeUpdated);
    socket.on("shape:deleted", handleShapeDeleted);
    socket.on("cursor:move", handleCursorMove);
    socket.on("laser:path", handleLaserPath);

    socket.connect();

    socket.emit("board:join", { roomId }, (ack: AckResponse) => {
      if (cancelled) return;

      if (!ack?.ok) {
        console.error("Failed to join board:", ack?.error);
      }

      setConnected(!!ack?.ok);
    });

    setLoadingSnapshot(true);

    boardService
      .getSnapshot(roomId)
      .then((response) => {
        if (cancelled) return;
        handlersRef.current.onSnapshotLoaded(response.data.map(dtoToShape));
      })
      .catch((error) => console.error(error))
      .finally(() => {
        if (cancelled) return;

        snapshotReady = true;
        buffered.forEach((fn) => fn());
        buffered.length = 0;

        setLoadingSnapshot(false);
      });

    return () => {
      cancelled = true;

      socket.off("shape:added", handleShapeAdded);
      socket.off("shape:updated", handleShapeUpdated);
      socket.off("shape:deleted", handleShapeDeleted);
      socket.off("cursor:move", handleCursorMove);
      socket.off("laser:path", handleLaserPath);

      disconnectSketchSocket();
      setConnected(false);
    };
  }, [roomId]);

  const emitAddShape = useCallback(
    (shape: Shape, ack?: (response: AckResponse) => void) => {
      if (!roomId) return;

      getSketchSocket().emit(
        "shape:add",
        { roomId, shape: shapeToWire(shape) },
        (response: AckResponse) => ack?.(response)
      );
    },
    [roomId]
  );

  const emitUpdateShape = useCallback(
    (shape: Shape, ack?: (response: AckResponse) => void) => {
      if (!roomId) return;

      const { id, authorId, tool, ...data } = shape;
      void authorId;
      void tool;

      getSketchSocket().emit(
        "shape:update",
        { roomId, shapeId: id, data },
        (response: AckResponse) => ack?.(response)
      );
    },
    [roomId]
  );

  const emitDeleteShape = useCallback(
    (shapeId: string, ack?: (response: AckResponse) => void) => {
      if (!roomId) return;

      getSketchSocket().emit(
        "shape:delete",
        { roomId, shapeId },
        (response: AckResponse) => ack?.(response)
      );
    },
    [roomId]
  );

  const emitCursorMove = useCallback(
    (point: Point) => {
      if (!roomId) return;

      const now = Date.now();
      if (now - lastCursorEmit.current < CURSOR_THROTTLE_MS) return;
      lastCursorEmit.current = now;

      getSketchSocket().emit("cursor:move", { roomId, x: point.x, y: point.y });
    },
    [roomId]
  );

  const emitLaserMove = useCallback(
    (point: Point, color: string) => {
      if (!roomId) return;

      const now = Date.now();
      if (now - lastLaserEmit.current < LASER_THROTTLE_MS) return;
      lastLaserEmit.current = now;

      getSketchSocket().emit("laser:path", {
        roomId,
        color,
        points: [{ x: point.x, y: point.y, t: now }],
      });
    },
    [roomId]
  );

  return {
    connected,
    loadingSnapshot,
    emitAddShape,
    emitUpdateShape,
    emitDeleteShape,
    emitCursorMove,
    emitLaserMove,
  };
}
