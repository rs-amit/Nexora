import {
  MousePointer2,
  Pencil,
  Square,
  Circle,
  Type,
  Eraser,
  Minus,
  MoveRight,
  Hand,
  Diamond,
  Triangle,
  StickyNote,
  Table2,
  Spline,
  Flashlight,
  ZoomIn,
  ZoomOut,
  Undo2,
  Redo2,
} from "lucide-react";

import ToolButton from "./ToolButton";
import { useCanvasStore } from "../../../store/canvas.store";
import type { Tool } from "../../../types/canvas.types";

const ZOOM_STEP = 1.2;

type ToolEntry = { key: Tool | "undo" | "redo"; icon: React.ReactNode; label: string };

// Drawing/shape tools on the left, content + utility tools on the right.
const LEFT_TOOLS: ToolEntry[] = [
  { key: "select", icon: <MousePointer2 size={16} />, label: "Select" },
  { key: "hand", icon: <Hand size={16} />, label: "Pan" },
  { key: "pencil", icon: <Pencil size={16} />, label: "Pencil" },
  { key: "line", icon: <Minus size={16} />, label: "Line" },
  { key: "arrow", icon: <MoveRight size={16} />, label: "Arrow" },
  { key: "rectangle", icon: <Square size={16} />, label: "Rectangle" },
  { key: "circle", icon: <Circle size={16} />, label: "Circle" },
  { key: "diamond", icon: <Diamond size={16} />, label: "Diamond" },
  { key: "triangle", icon: <Triangle size={16} />, label: "Triangle" },
];

const RIGHT_TOOLS: ToolEntry[] = [
  { key: "text", icon: <Type size={16} />, label: "Text" },
  { key: "sticky", icon: <StickyNote size={16} />, label: "Sticky note" },
  { key: "table", icon: <Table2 size={16} />, label: "Table" },
  { key: "relation", icon: <Spline size={16} />, label: "Relation" },
  { key: "eraser", icon: <Eraser size={18} />, label: "Eraser" },
  { key: "laser", icon: <Flashlight size={16} />, label: "Laser pointer" },
  { key: "zoom-in", icon: <ZoomIn size={16} />, label: "Zoom in" },
  { key: "zoom-out", icon: <ZoomOut size={16} />, label: "Zoom out" },
  { key: "undo", icon: <Undo2 size={18} />, label: "Undo" },
  { key: "redo", icon: <Redo2 size={18} />, label: "Redo" },
];

const PANEL_CLASSNAME = `
  fixed
  top-1/2
  -translate-y-1/2
  z-50
  flex flex-col gap-3
  rounded
  border border-white/5
  backdrop-blur-md
  p-1
  shadow-[0_10px_30px_rgba(0,0,0,0.08)]
`;

const Toolbar = () => {
  const { activeTool, setActiveTool, undo, redo, zoomBy } = useCanvasStore();

  const handleToolClick = (key: ToolEntry["key"]) => {
    if (key === "undo") {
      undo();
      return;
    }

    if (key === "redo") {
      redo();
      return;
    }

    if (key === "zoom-in") {
      zoomBy(ZOOM_STEP);
      return;
    }

    if (key === "zoom-out") {
      zoomBy(1 / ZOOM_STEP);
      return;
    }

    setActiveTool(key as Tool);
  };

  const renderGroup = (tools: ToolEntry[], side: "left-6" | "right-6") => (
    <div className={`${PANEL_CLASSNAME} ${side}`}>
      {tools.map((tool) => (
        <ToolButton
          key={tool.key}
          icon={tool.icon}
          label={tool.label}
          active={activeTool === tool.key}
          onClick={() => handleToolClick(tool.key)}
        />
      ))}
    </div>
  );

  return (
    <>
      {renderGroup(LEFT_TOOLS, "left-6")}
      {renderGroup(RIGHT_TOOLS, "right-6")}
    </>
  );
};

export default Toolbar;
