import { useEffect, useRef, useState } from "react";
import { Key, Link2, Plus, X } from "lucide-react";

import { useCanvasStore } from "../../../store/canvas.store";
import {
  DEFAULT_TABLE_WIDTH,
  FOOTER_HEIGHT,
  HEADER_HEIGHT,
  ROW_HEIGHT,
  SQL_TYPES,
  tableColumnsPatch,
} from "./tableGeometry";
import type { RelationAnchor, Shape, TableColumn } from "../../../types/canvas.types";

const SQL_TYPE_LIST_ID = "sketch-sql-types";

type EditingCell = { shapeId: string; columnId: string; field: "name" | "type" } | null;
type EditingName = { shapeId: string } | null;

interface TableNodeLayerProps {
  pendingAnchor: RelationAnchor | null;
  onAnchorClick: (anchor: RelationAnchor) => void;
}

export function TableNodeLayer({ pendingAnchor, onAnchorClick }: TableNodeLayerProps) {
  const store = useCanvasStore();

  const dragRef = useRef<{ id: string; lastX: number; lastY: number } | null>(null);

  const [editingCell, setEditingCell] = useState<EditingCell>(null);
  const [editingName, setEditingName] = useState<EditingName>(null);
  const [cellValue, setCellValue] = useState("");

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

  const commitColumns = (table: Shape, columns: TableColumn[]) => {
    store.updateLocalShape(table.id, tableColumnsPatch(table, columns), { force: true });
  };

  const startEditCell = (
    shapeId: string,
    columnId: string,
    field: "name" | "type",
    value: string
  ) => {
    setEditingCell({ shapeId, columnId, field });
    setCellValue(value);
  };

  const commitCell = (table: Shape) => {
    if (!editingCell) return;

    const columns = (table.columns ?? []).map((col) =>
      col.id === editingCell.columnId ? { ...col, [editingCell.field]: cellValue } : col
    );

    commitColumns(table, columns);
    setEditingCell(null);
  };

  const commitName = (table: Shape, value: string) => {
    store.updateLocalShape(table.id, { tableName: value }, { force: true });
    setEditingName(null);
  };

  const toggleFlag = (table: Shape, columnId: string, flag: "isPrimaryKey" | "isForeignKey") => {
    const columns = (table.columns ?? []).map((col) =>
      col.id === columnId ? { ...col, [flag]: !col[flag] } : col
    );

    commitColumns(table, columns);
  };

  const addColumn = (table: Shape) => {
    const columns = [
      ...(table.columns ?? []),
      { id: crypto.randomUUID(), name: "column", type: "string" },
    ];

    commitColumns(table, columns);
  };

  const removeColumn = (table: Shape, columnId: string) => {
    // Cascade: a relation anchored to a column that no longer exists is
    // meaningless — remove it rather than leaving it dangling.
    store.shapes
      .filter(
        (shape) =>
          shape.tool === "relation" &&
          ((shape.fromShapeId === table.id && shape.fromColumnId === columnId) ||
            (shape.toShapeId === table.id && shape.toColumnId === columnId))
      )
      .forEach((relation) => store.deleteLocalShape(relation.id));

    commitColumns(
      table,
      (table.columns ?? []).filter((col) => col.id !== columnId)
    );
  };

  const tables = store.shapes.filter((shape) => shape.tool === "table");

  return (
    <div className="pointer-events-none absolute inset-0" style={{ zIndex: 15 }}>
      <datalist id={SQL_TYPE_LIST_ID}>
        {SQL_TYPES.map((type) => (
          <option key={type} value={type} />
        ))}
      </datalist>

      {tables.map((table) => {
        const x = Math.min(table.startX ?? 0, table.endX ?? 0);
        const y = Math.min(table.startY ?? 0, table.endY ?? 0);
        const width = Math.abs((table.endX ?? 0) - (table.startX ?? 0)) || DEFAULT_TABLE_WIDTH;
        const columns = table.columns ?? [];

        const pointerEvents =
          store.activeTool === "select" ||
          store.activeTool === "hand" ||
          store.activeTool === "relation"
            ? "auto"
            : "none";

        return (
          <div
            key={table.id}
            className="absolute select-none overflow-hidden rounded-md text-[12px] shadow-lg"
            style={{
              left: x,
              top: y,
              width,
              background: "#171925",
              border:
                store.selectedShapeId === table.id
                  ? "2px solid #3b82f6"
                  : "1px solid rgba(255,255,255,0.12)",
              pointerEvents,
            }}
          >
            {/* Header */}
            <div
              onMouseDown={(e) => {
                if (store.activeTool !== "select" && store.activeTool !== "hand") return;
                e.stopPropagation();
                store.setSelectedShapeId(table.id);
                dragRef.current = { id: table.id, lastX: e.clientX, lastY: e.clientY };
              }}
              onDoubleClick={(e) => {
                e.stopPropagation();
                setEditingName({ shapeId: table.id });
                setCellValue(table.tableName ?? "");
              }}
              className="flex cursor-move items-center px-2 font-medium text-white"
              style={{ height: HEADER_HEIGHT, background: "#111923", boxSizing: "border-box" }}
            >
              {editingName?.shapeId === table.id ? (
                <input
                  autoFocus
                  value={cellValue}
                  onChange={(e) => setCellValue(e.target.value)}
                  onBlur={() => commitName(table, cellValue)}
                  onKeyDown={(e) => {
                    e.stopPropagation();
                    if (e.key === "Enter") commitName(table, cellValue);
                    if (e.key === "Escape") setEditingName(null);
                  }}
                  className="w-full bg-transparent outline-none"
                />
              ) : (
                <span className="truncate">{table.tableName || "table_name"}</span>
              )}
            </div>

            {/* Rows */}
            {columns.map((column) => {
              const isPendingAnchor =
                pendingAnchor?.shapeId === table.id && pendingAnchor.columnId === column.id;

              return (
                <div
                  key={column.id}
                  className="relative flex items-center gap-1 border-t border-white/5 px-2 text-white/80"
                  style={{ height: ROW_HEIGHT, boxSizing: "border-box" }}
                >
                  {store.activeTool === "relation" && (
                    <button
                      type="button"
                      title="Drag relations from here"
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        onAnchorClick({ shapeId: table.id, columnId: column.id });
                      }}
                      className="absolute -left-1.5 h-3 w-3 rounded-full border border-white"
                      style={{ background: isPendingAnchor ? "#3b82f6" : "#171925" }}
                    />
                  )}

                  {editingCell?.shapeId === table.id &&
                  editingCell.columnId === column.id &&
                  editingCell.field === "name" ? (
                    <input
                      autoFocus
                      value={cellValue}
                      onChange={(e) => setCellValue(e.target.value)}
                      onBlur={() => commitCell(table)}
                      onKeyDown={(e) => {
                        e.stopPropagation();
                        if (e.key === "Enter") commitCell(table);
                        if (e.key === "Escape") setEditingCell(null);
                      }}
                      className="w-16 flex-1 bg-transparent outline-none"
                    />
                  ) : (
                    <span
                      className="flex-1 truncate"
                      onDoubleClick={(e) => {
                        e.stopPropagation();
                        startEditCell(table.id, column.id, "name", column.name);
                      }}
                    >
                      {column.name}
                    </span>
                  )}

                  {editingCell?.shapeId === table.id &&
                  editingCell.columnId === column.id &&
                  editingCell.field === "type" ? (
                    <input
                      autoFocus
                      list={SQL_TYPE_LIST_ID}
                      value={cellValue}
                      onChange={(e) => setCellValue(e.target.value)}
                      onBlur={() => commitCell(table)}
                      onKeyDown={(e) => {
                        e.stopPropagation();
                        if (e.key === "Enter") commitCell(table);
                        if (e.key === "Escape") setEditingCell(null);
                      }}
                      className="w-14 bg-transparent text-white/50 outline-none"
                    />
                  ) : (
                    <span
                      className="w-14 truncate text-white/40"
                      onDoubleClick={(e) => {
                        e.stopPropagation();
                        startEditCell(table.id, column.id, "type", column.type);
                      }}
                    >
                      {column.type}
                    </span>
                  )}

                  <button
                    type="button"
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={() => toggleFlag(table, column.id, "isPrimaryKey")}
                    title="Primary key"
                    className={`shrink-0 rounded p-0.5 ${
                      column.isPrimaryKey ? "text-yellow-400" : "text-white/20"
                    }`}
                  >
                    <Key size={11} />
                  </button>

                  <button
                    type="button"
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={() => toggleFlag(table, column.id, "isForeignKey")}
                    title="Foreign key"
                    className={`shrink-0 rounded p-0.5 ${
                      column.isForeignKey ? "text-blue-400" : "text-white/20"
                    }`}
                  >
                    <Link2 size={11} />
                  </button>

                  <button
                    type="button"
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={() => removeColumn(table, column.id)}
                    title="Remove column"
                    className="shrink-0 rounded p-0.5 text-white/20 hover:text-red-400"
                  >
                    <X size={11} />
                  </button>

                  {store.activeTool === "relation" && (
                    <button
                      type="button"
                      title="Drop relations here"
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        onAnchorClick({ shapeId: table.id, columnId: column.id });
                      }}
                      className="absolute -right-1.5 h-3 w-3 rounded-full border border-white"
                      style={{ background: isPendingAnchor ? "#3b82f6" : "#171925" }}
                    />
                  )}
                </div>
              );
            })}

            {/* Footer */}
            <button
              type="button"
              onMouseDown={(e) => e.stopPropagation()}
              onClick={() => addColumn(table)}
              className="flex w-full items-center justify-center gap-1 border-t border-white/5 text-white/50 hover:text-white"
              style={{ height: FOOTER_HEIGHT, boxSizing: "border-box" }}
            >
              <Plus size={12} /> Add column
            </button>
          </div>
        );
      })}
    </div>
  );
}
