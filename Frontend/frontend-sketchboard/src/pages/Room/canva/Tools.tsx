import { useEffect, useRef, useState, type RefObject } from "react";

import { useCanvasStore } from "../../../store/canvas.store";
import type { LaserPoint } from "../../../types/canvas.types";

// ===========================================================================
// Text Editor Overlay
// ===========================================================================
// Shared by both the "text" tool's one-shot creation and editing existing
// text/sticky shapes. Rendered as a real DOM textarea instead of hand-rolled
// canvas text editing (no native cursor/selection/word-wrap in canvas 2D).

interface TextEditorOverlayProps {
  x: number;
  y: number;
  width: number;
  height: number;
  initialText: string;
  color: string;
  background?: string;
  onCommit: (text: string) => void;
  onCancel: () => void;
}

export function TextEditorOverlay({
  x,
  y,
  width,
  height,
  initialText,
  color,
  background,
  onCommit,
  onCancel,
}: TextEditorOverlayProps) {
  const [text, setText] = useState(initialText);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const settledRef = useRef(false);

  useEffect(() => {
    textareaRef.current?.focus();
    textareaRef.current?.select();
  }, []);

  const commit = () => {
    if (settledRef.current) return;
    settledRef.current = true;
    onCommit(text);
  };

  const cancel = () => {
    if (settledRef.current) return;
    settledRef.current = true;
    onCancel();
  };

  return (
    <textarea
      ref={textareaRef}
      value={text}
      onChange={(e) => setText(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        e.stopPropagation();

        if (e.key === "Escape") {
          e.preventDefault();
          cancel();
        } else if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          commit();
        }
      }}
      className="pointer-events-auto absolute z-40 resize-none rounded-md border border-dashed border-white/40 px-2 py-1 text-sm outline-none"
      style={{
        left: x,
        top: y,
        width,
        height,
        color,
        background: background ?? "rgba(20,22,35,0.92)",
        fontFamily: "sans-serif",
      }}
    />
  );
}

// ===========================================================================
// Sticky Note Layer
// ===========================================================================
// Sticky notes render as DOM, not canvas 2D — word-wrap and editable
// multi-line text are trivial in HTML and painful to hand-roll in canvas.

export function StickyNoteLayer({
  onDoubleClickNote,
}: {
  onDoubleClickNote: (shapeId: string) => void;
}) {
  const store = useCanvasStore();

  const dragRef = useRef<{ id: string; lastX: number; lastY: number } | null>(null);

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      const drag = dragRef.current;
      if (!drag) return;

      // Mouse deltas are screen pixels; the shape's coordinates are world
      // units, so a delta must be divided by the current zoom to convert.
      const dx = (e.clientX - drag.lastX) / store.zoom;
      const dy = (e.clientY - drag.lastY) / store.zoom;
      drag.lastX = e.clientX;
      drag.lastY = e.clientY;

      const shape = store.getShape(drag.id);
      if (!shape) return;

      store.updateLocalShape(drag.id, {
        startX: (shape.startX ?? 0) + dx,
        startY: (shape.startY ?? 0) + dy,
        endX: (shape.endX ?? 0) + dx,
        endY: (shape.endY ?? 0) + dy,
      });
    };

    const handleUp = () => {
      const drag = dragRef.current;
      if (!drag) return;

      dragRef.current = null;

      const shape = store.getShape(drag.id);
      if (shape) store.updateLocalShape(drag.id, shape, { force: true });
    };

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };
  }, [store]);

  const stickies = store.shapes.filter((shape) => shape.tool === "sticky");

  return (
    <div className="pointer-events-none absolute inset-0" style={{ zIndex: 15 }}>
      {stickies.map((shape) => {
        const x = Math.min(shape.startX ?? 0, shape.endX ?? 0);
        const y = Math.min(shape.startY ?? 0, shape.endY ?? 0);
        const width = Math.abs((shape.endX ?? 0) - (shape.startX ?? 0)) || 200;
        const height = Math.abs((shape.endY ?? 0) - (shape.startY ?? 0)) || 150;

        return (
          <div
            key={shape.id}
            onMouseDown={(e) => {
              if (store.activeTool !== "select" && store.activeTool !== "hand") return;
              e.stopPropagation();
              store.setSelectedShapeId(shape.id);
              dragRef.current = { id: shape.id, lastX: e.clientX, lastY: e.clientY };
            }}
            onDoubleClick={(e) => {
              e.stopPropagation();
              onDoubleClickNote(shape.id);
            }}
            className="pointer-events-auto absolute cursor-move select-none whitespace-pre-wrap break-words rounded-md p-2 text-sm shadow-lg"
            style={{
              left: x,
              top: y,
              width,
              height,
              background: shape.noteColor ?? "#fef08a",
              color: "#1f2937",
              border:
                store.selectedShapeId === shape.id
                  ? "2px solid #3b82f6"
                  : "1px solid rgba(0,0,0,0.15)",
            }}
          >
            {shape.text}
          </div>
        );
      })}
    </div>
  );
}

// ===========================================================================
// Laser Overlay
// ===========================================================================
// A dedicated transparent canvas, completely decoupled from `shapes`/
// undo/history — laser paths are never persisted or added to the shape list.

const LASER_TTL_MS = 1500;

export function LaserOverlay({
  containerRef,
  localPointsRef,
  localColor,
}: {
  containerRef: RefObject<HTMLDivElement | null>;
  localPointsRef: RefObject<LaserPoint[]>;
  localColor: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { remoteLaserPaths, zoom, pan } = useCanvasStore();
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const resize = () => {
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
    };

    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [containerRef]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const drawTrail = (points: LaserPoint[], color: string, now: number) => {
      points.forEach((point) => {
        const alpha = Math.max(0, 1 - (now - point.t) / LASER_TTL_MS);
        if (alpha <= 0) return;

        ctx.beginPath();
        ctx.fillStyle = color;
        ctx.globalAlpha = alpha;
        ctx.arc(point.x, point.y, 5, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const now = Date.now();

      ctx.save();
      ctx.translate(pan.x, pan.y);
      ctx.scale(zoom, zoom);

      if (localPointsRef.current) {
        localPointsRef.current = localPointsRef.current.filter(
          (point) => now - point.t < LASER_TTL_MS
        );
        drawTrail(localPointsRef.current, localColor, now);
      }

      remoteLaserPaths.forEach((path) => drawTrail(path.points, path.color, now));

      ctx.restore();

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [localColor, localPointsRef, remoteLaserPaths, zoom, pan]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0"
      style={{ zIndex: 25 }}
    />
  );
}
