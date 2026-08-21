import React, { useEffect, useMemo, useRef, useState } from "react";

import Toolbar from "./Toolbar";
import PresenceLayer from "./PresenceLayer";
import SelectionLayer from "./SelectionLayer";
import { StickyNoteLayer, TextEditorOverlay, LaserOverlay } from "./Tools";
import { TableNodeLayer } from "./TableNodeLayer";
import { getShapeBoundingBox, hitTestShape } from "./shapeGeometry";
import {
  DEFAULT_TABLE_WIDTH,
  hitTestRelation,
  nextCardinality,
  resolveColumnAnchor,
  resolveRelationPath,
  tableHeight,
} from "./tableGeometry";
import { drawRelation, drawSmartConnector } from "./connectorRenderer";
import { findBindableShapeAt, hitTestArrowConnector, resolveArrowPath } from "./connectorGeometry";
import { screenToWorld } from "./viewport";
import { useCanvasStore } from "../../../store/canvas.store";
import { getCurrentUser } from "../../../lib/currentUser";
import type { RoomMemberInfo } from "../../../hooks/useRoomMembers";
import type {
  LaserPoint,
  Point,
  RelationAnchor,
  Shape,
  TableColumn,
} from "../../../types/canvas.types";

const cursorMap: Record<string, string> = {
  select: "default",
  hand: "grab",
  pencil: "crosshair",
  rectangle: "crosshair",
  circle: "crosshair",
  diamond: "crosshair",
  triangle: "crosshair",
  line: "crosshair",
  arrow: "crosshair",
  text: "text",
  eraser: "cell",
  sticky: "copy",
  table: "copy",
  relation: "crosshair",
  image: "copy",
  laser: "pointer",
  "zoom-in": "zoom-in",
  "zoom-out": "zoom-out",
};

type CanvasBoardProps = {
  members: RoomMemberInfo[];
};

function CanvasBoard({ members }: CanvasBoardProps) {
  const store = useCanvasStore();
  const currentUser = useMemo(() => getCurrentUser(), []);

  const {
    shapes,
    activeTool,
    strokeColor,
    strokeWidth,
    selectedShapeId,
    setSelectedShapeId,
    editingShapeId,
    setEditingShapeId,
    getShape,
    addLocalShape,
    updateLocalShape,
    deleteLocalShape,
    connected,
    zoom,
    pan,
    setViewportSize,
    zoomAt,
    panBy,
    resetView,
  } = store;

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [isDrawing, setIsDrawing] = useState(false);
  const [isDraggingShape, setIsDraggingShape] = useState(false);
  const [textDraft, setTextDraft] = useState<Point | null>(null);
  const [pendingAnchor, setPendingAnchor] = useState<RelationAnchor | null>(null);

  const dragStart = useRef<Point | null>(null);
  const currentShape = useRef<Shape | null>(null);

  const isLaserDrawingRef = useRef(false);
  const localLaserPointsRef = useRef<LaserPoint[]>([]);
  const pendingCursorRef = useRef<Point | null>(null);

  const shapesById = useMemo(() => new Map(shapes.map((s) => [s.id, s])), [shapes]);

  // Converts the raw (screen-space) mouse position into world space, so
  // every downstream consumer of getXY's return value — shape creation,
  // hand-tool drag, hit-testing — is automatically zoom/pan-aware.
  const getXY = (e: React.MouseEvent<HTMLCanvasElement>): Point =>
    screenToWorld({ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY }, pan, zoom);

  // Checks both relations and bound arrows — neither has stable canvas
  // geometry of its own (both depend on other shapes' live positions), so
  // neither participates in hitTestShape/getClickedShapeId below.
  const findClickedConnectorId = (x: number, y: number): string | null => {
    for (let i = shapes.length - 1; i >= 0; i--) {
      const shape = shapes[i];

      if (shape.tool === "relation" && hitTestRelation(shape, shapesById, x, y)) return shape.id;

      if (
        shape.tool === "arrow" &&
        (shape.fromShapeId || shape.toShapeId) &&
        hitTestArrowConnector(shape, shapesById, x, y)
      ) {
        return shape.id;
      }
    }
    return null;
  };

  // =========================
  // Draw Helpers
  // =========================
  const drawShape = (ctx: CanvasRenderingContext2D, shape: Shape) => {
    ctx.lineWidth = shape.width;
    ctx.strokeStyle = shape.color;
    ctx.fillStyle = shape.color;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    switch (shape.tool) {
      case "pencil":
      case "eraser": {
        if (!shape.points || shape.points.length < 2) return;

        if (shape.tool === "eraser") {
          ctx.save();
          ctx.globalCompositeOperation = "destination-out";
        }

        ctx.beginPath();
        ctx.moveTo(shape.points[0].x, shape.points[0].y);
        shape.points.forEach((point) => ctx.lineTo(point.x, point.y));
        ctx.stroke();

        if (shape.tool === "eraser") ctx.restore();
        break;
      }

      case "rectangle": {
        if (
          shape.startX === undefined ||
          shape.startY === undefined ||
          shape.endX === undefined ||
          shape.endY === undefined
        )
          return;

        ctx.strokeRect(
          shape.startX,
          shape.startY,
          shape.endX - shape.startX,
          shape.endY - shape.startY
        );
        break;
      }

      case "circle": {
        if (
          shape.startX === undefined ||
          shape.startY === undefined ||
          shape.endX === undefined ||
          shape.endY === undefined
        )
          return;

        const radius = Math.sqrt(
          (shape.endX - shape.startX) ** 2 + (shape.endY - shape.startY) ** 2
        );

        ctx.beginPath();
        ctx.arc(shape.startX, shape.startY, radius, 0, Math.PI * 2);
        ctx.stroke();
        break;
      }

      case "diamond": {
        if (
          shape.startX === undefined ||
          shape.startY === undefined ||
          shape.endX === undefined ||
          shape.endY === undefined
        )
          return;

        const x1 = Math.min(shape.startX, shape.endX);
        const x2 = Math.max(shape.startX, shape.endX);
        const y1 = Math.min(shape.startY, shape.endY);
        const y2 = Math.max(shape.startY, shape.endY);
        const midX = (x1 + x2) / 2;
        const midY = (y1 + y2) / 2;

        ctx.beginPath();
        ctx.moveTo(midX, y1);
        ctx.lineTo(x2, midY);
        ctx.lineTo(midX, y2);
        ctx.lineTo(x1, midY);
        ctx.closePath();
        ctx.stroke();
        break;
      }

      case "triangle": {
        if (
          shape.startX === undefined ||
          shape.startY === undefined ||
          shape.endX === undefined ||
          shape.endY === undefined
        )
          return;

        const x1 = Math.min(shape.startX, shape.endX);
        const x2 = Math.max(shape.startX, shape.endX);
        const y1 = Math.min(shape.startY, shape.endY);
        const y2 = Math.max(shape.startY, shape.endY);
        const midX = (x1 + x2) / 2;

        ctx.beginPath();
        ctx.moveTo(midX, y1);
        ctx.lineTo(x2, y2);
        ctx.lineTo(x1, y2);
        ctx.closePath();
        ctx.stroke();
        break;
      }

      case "line": {
        if (
          shape.startX === undefined ||
          shape.startY === undefined ||
          shape.endX === undefined ||
          shape.endY === undefined
        )
          return;

        ctx.beginPath();
        ctx.moveTo(shape.startX, shape.startY);
        ctx.lineTo(shape.endX, shape.endY);
        ctx.stroke();
        break;
      }

      case "arrow": {
        if (
          shape.startX === undefined ||
          shape.startY === undefined ||
          shape.endX === undefined ||
          shape.endY === undefined
        )
          return;

        const headLength = 12;
        const dx = shape.endX - shape.startX;
        const dy = shape.endY - shape.startY;
        const angle = Math.atan2(dy, dx);

        ctx.beginPath();
        ctx.moveTo(shape.startX, shape.startY);
        ctx.lineTo(shape.endX, shape.endY);
        ctx.lineTo(
          shape.endX - headLength * Math.cos(angle - Math.PI / 6),
          shape.endY - headLength * Math.sin(angle - Math.PI / 6)
        );
        ctx.moveTo(shape.endX, shape.endY);
        ctx.lineTo(
          shape.endX - headLength * Math.cos(angle + Math.PI / 6),
          shape.endY - headLength * Math.sin(angle + Math.PI / 6)
        );
        ctx.stroke();
        break;
      }

      case "text": {
        if (!shape.text || shape.startX === undefined || shape.startY === undefined) return;

        ctx.font = "18px sans-serif";
        ctx.fillText(shape.text, shape.startX, shape.startY);
        break;
      }

      default:
        // "sticky"/"table" render as DOM (StickyNoteLayer/TableNodeLayer);
        // "relation" is drawn separately below (needs cross-shape lookup);
        // "laser" never enters `shapes`.
        break;
    }
  };

  const drawPendingRelationPreview = (ctx: CanvasRenderingContext2D) => {
    const cursor = pendingCursorRef.current;
    if (!pendingAnchor || !cursor) return;

    const table = shapesById.get(pendingAnchor.shapeId);
    if (!table) return;

    const centerX = ((table.startX ?? 0) + (table.endX ?? 0)) / 2;
    const side = cursor.x >= centerX ? "right" : "left";
    const anchor = resolveColumnAnchor(table, pendingAnchor.columnId, side);
    if (!anchor) return;

    ctx.save();
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = "#3b82f6";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(anchor.x, anchor.y);
    ctx.lineTo(cursor.x, cursor.y);
    ctx.stroke();
    ctx.restore();
  };

  const redrawCanvas = (preview?: Shape) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(pan.x, pan.y);
    ctx.scale(zoom, zoom);

    shapes.forEach((shape) => {
      if (shape.tool === "relation") {
        const path = resolveRelationPath(shape, shapesById);
        if (path) drawRelation(ctx, shape, path, shape.id === selectedShapeId);
        return;
      }

      if (shape.tool === "arrow" && (shape.fromShapeId || shape.toShapeId)) {
        const points = resolveArrowPath(shape, shapesById);
        if (points) {
          drawSmartConnector(ctx, shape, points, shape.id === selectedShapeId);
          return;
        }
        // Dangling bind (the bound shape was deleted) — fall through and
        // draw it as a plain straight arrow using its last stored points.
      }

      drawShape(ctx, shape);
    });

    if (preview) drawShape(ctx, preview);
    drawPendingRelationPreview(ctx);

    ctx.restore();
  };

  // The resize effect below only registers its window listener once (empty
  // deps), so it can't close over a fresh `redrawCanvas` on every render —
  // this ref lets it always call whatever the latest one is.
  const redrawCanvasRef = useRef(redrawCanvas);
  redrawCanvasRef.current = redrawCanvas;

  const getClickedShapeId = (x: number, y: number): string | null => {
    for (let i = shapes.length - 1; i >= 0; i--) {
      if (hitTestShape(shapes[i], x, y)) return shapes[i].id;
    }
    return null;
  };

  // =========================
  // Mouse Down
  // =========================
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!currentUser) return;
    const { x, y } = getXY(e);

    if (activeTool === "select") {
      setSelectedShapeId(findClickedConnectorId(x, y));
      return;
    }

    if (activeTool === "relation") {
      const clickedConnectorId = findClickedConnectorId(x, y);
      if (clickedConnectorId) {
        setSelectedShapeId(clickedConnectorId);
      } else {
        setPendingAnchor(null);
      }
      return;
    }

    if (activeTool === "text") {
      setTextDraft({ x, y });
      return;
    }

    if (activeTool === "sticky") {
      const shape: Shape = {
        id: crypto.randomUUID(),
        authorId: currentUser.id,
        tool: "sticky",
        color: "#1f2937",
        width: 1,
        startX: x,
        startY: y,
        endX: x + 200,
        endY: y + 150,
        noteColor: "#fef08a",
        text: "",
      };

      addLocalShape(shape);
      setEditingShapeId(shape.id);
      return;
    }

    if (activeTool === "table") {
      const columns: TableColumn[] = [
        { id: crypto.randomUUID(), name: "id", type: "uuid", isPrimaryKey: true },
      ];

      const shape: Shape = {
        id: crypto.randomUUID(),
        authorId: currentUser.id,
        tool: "table",
        color: "#ffffff",
        width: 1,
        startX: x,
        startY: y,
        endX: x + DEFAULT_TABLE_WIDTH,
        endY: y + tableHeight(columns),
        tableName: "table_name",
        columns,
      };

      addLocalShape(shape);
      return;
    }

    if (activeTool === "laser") {
      isLaserDrawingRef.current = true;
      localLaserPointsRef.current.push({ x, y, t: Date.now() });
      return;
    }

    if (activeTool === "hand") {
      const clickedId = getClickedShapeId(x, y);

      if (clickedId) {
        setSelectedShapeId(clickedId);
        setIsDraggingShape(true);
        dragStart.current = { x, y };
      }
      return;
    }

    setIsDrawing(true);

    if (activeTool === "pencil" || activeTool === "eraser") {
      currentShape.current = {
        id: crypto.randomUUID(),
        authorId: currentUser.id,
        tool: activeTool,
        color: strokeColor,
        width: activeTool === "eraser" ? 20 : strokeWidth,
        points: [{ x, y }],
      };
      return;
    }

    const shape: Shape = {
      id: crypto.randomUUID(),
      authorId: currentUser.id,
      tool: activeTool,
      color: strokeColor,
      width: strokeWidth,
      startX: x,
      startY: y,
      endX: x,
      endY: y,
    };

    // Arrows started on/near a shape bind to it — resolveArrowPath then
    // routes an orthogonal elbow instead of the plain straight line.
    if (activeTool === "arrow") {
      const hit = findBindableShapeAt(shapes, x, y);
      if (hit) shape.fromShapeId = hit.id;
    }

    currentShape.current = shape;
  };

  const handleAnchorClick = (anchor: RelationAnchor) => {
    if (!currentUser) return;

    if (!pendingAnchor) {
      setPendingAnchor(anchor);
      return;
    }

    if (pendingAnchor.shapeId === anchor.shapeId && pendingAnchor.columnId === anchor.columnId) {
      setPendingAnchor(null);
      return;
    }

    const relation: Shape = {
      id: crypto.randomUUID(),
      authorId: currentUser.id,
      tool: "relation",
      color: strokeColor,
      width: strokeWidth,
      fromShapeId: pendingAnchor.shapeId,
      fromColumnId: pendingAnchor.columnId,
      toShapeId: anchor.shapeId,
      toColumnId: anchor.columnId,
      cardinality: "one-to-many",
    };

    addLocalShape(relation);
    setPendingAnchor(null);
  };

  const handleDoubleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = getXY(e);

    const clickedConnectorId = findClickedConnectorId(x, y);
    if (clickedConnectorId) {
      const connector = getShape(clickedConnectorId);

      if (connector?.tool === "relation") {
        updateLocalShape(
          clickedConnectorId,
          { cardinality: nextCardinality(connector.cardinality) },
          { force: true }
        );
      } else {
        // Bound arrows have no cardinality to cycle — just select them.
        setSelectedShapeId(clickedConnectorId);
      }
      return;
    }

    if (activeTool !== "select" && activeTool !== "hand") return;

    const clickedId = getClickedShapeId(x, y);
    if (!clickedId) return;

    const shape = getShape(clickedId);
    if (shape?.tool === "text") setEditingShapeId(clickedId);
  };

  // =========================
  // Mouse Move
  // =========================
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = getXY(e);
    store.emitCursorMove({ x, y });

    if (activeTool === "laser" && isLaserDrawingRef.current) {
      localLaserPointsRef.current.push({ x, y, t: Date.now() });
      store.emitLaserMove({ x, y }, strokeColor);
      return;
    }

    if (activeTool === "hand" && isDraggingShape && selectedShapeId && dragStart.current) {
      const dx = x - dragStart.current.x;
      const dy = y - dragStart.current.y;
      const shape = getShape(selectedShapeId);

      if (shape) {
        const patch: Partial<Shape> = {};

        if (shape.points) patch.points = shape.points.map((p) => ({ x: p.x + dx, y: p.y + dy }));
        if (shape.startX !== undefined) patch.startX = shape.startX + dx;
        if (shape.startY !== undefined) patch.startY = shape.startY + dy;
        if (shape.endX !== undefined) patch.endX = shape.endX + dx;
        if (shape.endY !== undefined) patch.endY = shape.endY + dy;

        updateLocalShape(selectedShapeId, patch);
      }

      dragStart.current = { x, y };
      return;
    }

    if (!isDrawing || !currentShape.current) return;

    if (activeTool === "pencil" || activeTool === "eraser") {
      currentShape.current = {
        ...currentShape.current,
        points: [...(currentShape.current.points || []), { x, y }],
      };
      redrawCanvas(currentShape.current);
      return;
    }

    currentShape.current.endX = x;
    currentShape.current.endY = y;
    redrawCanvas(currentShape.current);
  };

  // =========================
  // Mouse Up
  // =========================
  const handleMouseUp = () => {
    if (activeTool === "laser") {
      isLaserDrawingRef.current = false;
      return;
    }

    if (isDraggingShape) {
      setIsDraggingShape(false);

      if (selectedShapeId) {
        const shape = getShape(selectedShapeId);
        if (shape) updateLocalShape(selectedShapeId, shape, { force: true });
      }

      setSelectedShapeId(null);
      dragStart.current = null;
      return;
    }

    if (!isDrawing || !currentShape.current) return;
    setIsDrawing(false);

    const finalShape = { ...currentShape.current };

    if (finalShape.tool === "arrow" && finalShape.endX !== undefined && finalShape.endY !== undefined) {
      const hit = findBindableShapeAt(shapes, finalShape.endX, finalShape.endY);
      if (hit) finalShape.toShapeId = hit.id;
    }

    addLocalShape(finalShape);
    currentShape.current = null;
  };

  // =========================
  // Rubber-band preview while placing a relation
  // =========================
  useEffect(() => {
    if (!pendingAnchor) {
      pendingCursorRef.current = null;
      return;
    }

    const handleWindowMove = (e: MouseEvent) => {
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const screenPoint = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      pendingCursorRef.current = screenToWorld(screenPoint, pan, zoom);
      redrawCanvas();
    };

    window.addEventListener("mousemove", handleWindowMove);
    return () => {
      window.removeEventListener("mousemove", handleWindowMove);
      pendingCursorRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingAnchor, pan, zoom]);

  // Cancel a pending relation anchor on Escape or when switching tools away.
  useEffect(() => {
    if (activeTool !== "relation") setPendingAnchor(null);
  }, [activeTool]);

  // =========================
  // Resize Canvas
  // =========================
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const resizeCanvas = () => {
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
      setViewportSize({ width: container.clientWidth, height: container.clientHeight });
      redrawCanvasRef.current();
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // =========================
  // Wheel: plain scroll pans, Ctrl/Cmd+scroll (or trackpad pinch, which
  // browsers report as wheel-with-ctrlKey) zooms toward the cursor.
  // =========================
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();

      if (e.ctrlKey || e.metaKey) {
        const rect = container.getBoundingClientRect();
        const anchor = { x: e.clientX - rect.left, y: e.clientY - rect.top };
        const factor = Math.exp(-e.deltaY * 0.001);
        zoomAt(anchor, factor);
      } else {
        panBy(-e.deltaX, -e.deltaY);
      }
    };

    // Registered as a native listener (not JSX onWheel) so { passive: false }
    // reliably applies and preventDefault() actually stops page scroll.
    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => container.removeEventListener("wheel", handleWheel);
  }, [zoomAt, panBy]);

  // =========================
  // Redraw on Shapes/Viewport Change
  // =========================
  useEffect(() => {
    redrawCanvas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shapes, selectedShapeId, zoom, pan]);

  // =========================
  // Keyboard Shortcuts
  // =========================
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "TEXTAREA" || tag === "INPUT") return;

      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        e.preventDefault();
        store.undo();
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key === "y") {
        e.preventDefault();
        store.redo();
        return;
      }

      if ((e.key === "Delete" || e.key === "Backspace") && selectedShapeId) {
        e.preventDefault();
        deleteLocalShape(selectedShapeId);
        setSelectedShapeId(null);
        return;
      }

      if (e.key === "Escape") {
        setPendingAnchor(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [store, selectedShapeId, deleteLocalShape, setSelectedShapeId]);

  const editingShape = editingShapeId ? getShape(editingShapeId) : undefined;
  const showTextEditor =
    editingShape && (editingShape.tool === "text" || editingShape.tool === "sticky");
  const editingBox =
    showTextEditor && editingShape
      ? getShapeBoundingBox(editingShape) ?? {
          x: editingShape.startX ?? 0,
          y: (editingShape.startY ?? 0) - 20,
          width: 200,
          height: 32,
        }
      : null;

  return (
    <main className="relative flex-1 overflow-hidden">
      <Toolbar />

      <div ref={containerRef} className="relative w-full h-full overflow-hidden">
        <div className="absolute inset-0" />

        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onDoubleClick={handleDoubleClick}
          className="absolute inset-0 z-10"
          style={{ cursor: cursorMap[activeTool] || "default" }}
        />

        {/* World-space DOM layer — panned/scaled via CSS transform. Shape
            layers already position children using raw shape coordinates, so
            nothing inside needs to know about zoom/pan itself.
            `transform` creates a new stacking context, so this needs an
            explicit z-index above the canvas's z-10 — otherwise the whole
            context (and everything in it: tables, sticky notes, selection,
            presence) paints *below* the canvas, which then silently
            swallows every click meant for a table/sticky underneath it. */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: "0 0",
            zIndex: 15,
          }}
        >
          <StickyNoteLayer onDoubleClickNote={(id) => setEditingShapeId(id)} />
          <TableNodeLayer pendingAnchor={pendingAnchor} onAnchorClick={handleAnchorClick} />
          <SelectionLayer members={members} />
          <PresenceLayer members={members} />

          {textDraft && (
            <TextEditorOverlay
              x={textDraft.x}
              y={textDraft.y - 12}
              width={220}
              height={40}
              initialText=""
              color={strokeColor}
              onCommit={(text) => {
                if (text.trim() && currentUser) {
                  addLocalShape({
                    id: crypto.randomUUID(),
                    authorId: currentUser.id,
                    tool: "text",
                    color: strokeColor,
                    width: strokeWidth,
                    startX: textDraft.x,
                    startY: textDraft.y,
                    text: text.trim(),
                  });
                }
                setTextDraft(null);
              }}
              onCancel={() => setTextDraft(null)}
            />
          )}

          {showTextEditor && editingShape && editingBox && (
            <TextEditorOverlay
              x={editingBox.x}
              y={editingBox.y}
              width={editingBox.width}
              height={editingBox.height}
              initialText={editingShape.text ?? ""}
              color={editingShape.tool === "sticky" ? "#1f2937" : editingShape.color}
              background={editingShape.tool === "sticky" ? editingShape.noteColor : undefined}
              onCommit={(text) => {
                updateLocalShape(editingShape.id, { text }, { force: true });
                setEditingShapeId(null);
              }}
              onCancel={() => setEditingShapeId(null)}
            />
          )}
        </div>

        {/* Laser trails manage their own canvas transform (raster content,
            not DOM), so they stay outside the CSS-transformed wrapper. */}
        <LaserOverlay
          containerRef={containerRef}
          localPointsRef={localLaserPointsRef}
          localColor={strokeColor}
        />

        {/* Status + zoom — fixed screen-space chrome, never transformed */}
        <div className="absolute top-5 right-5 z-40 flex items-center gap-2">
          <button
            type="button"
            onClick={resetView}
            title="Reset zoom"
            className="
              px-3 py-2
              rounded-xl
              bg-[#141623]
              border border-white/5
              shadow-lg
              backdrop-blur-md
              text-xs text-white/70
              hover:text-white
            "
          >
            {Math.round(zoom * 100)}%
          </button>

          <div
            className="
              px-3 py-2
              rounded-xl
              bg-[#141623]
              border border-white/5
              shadow-lg
              backdrop-blur-md
            "
          >
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full animate-pulse ${
                  connected ? "bg-green-500" : "bg-yellow-500"
                }`}
              />
              <span className="text-xs text-white/70">
                {connected ? "Live Collaboration" : "Connecting…"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default CanvasBoard;
