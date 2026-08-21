import { useCanvasStore } from "../../../store/canvas.store";
import { getShapeBoundingBox } from "./shapeGeometry";
import type { RoomMemberInfo } from "../../../hooks/useRoomMembers";

// Client-side-only heuristic — no dedicated backend event for "who is
// dragging what". When a `shape:updated` arrives from another user, the
// store marks them as dragging that shape for ~300ms; as long as their
// update stream keeps arriving, this outline stays visible.
function SelectionLayer({ members }: { members: RoomMemberInfo[] }) {
  const { shapes, remoteDraggersByShapeId } = useCanvasStore();

  const nameFor = (userId: string) =>
    members.find((member) => member.userId === userId)?.name ?? "Guest";

  return (
    <div className="absolute inset-0 z-20 pointer-events-none">
      {Object.entries(remoteDraggersByShapeId).map(([shapeId, dragger]) => {
        const shape = shapes.find((s) => s.id === shapeId);
        const box = shape ? getShapeBoundingBox(shape) : null;
        if (!box) return null;

        return (
          <div
            key={shapeId}
            className="absolute rounded"
            style={{
              left: box.x - 4,
              top: box.y - 4,
              width: box.width + 8,
              height: box.height + 8,
              border: `2px dashed ${dragger.color}`,
            }}
          >
            <span
              className="absolute -top-5 left-0 whitespace-nowrap rounded px-1.5 py-0.5 text-[10px] text-white"
              style={{ background: dragger.color }}
            >
              {nameFor(dragger.userId)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default SelectionLayer;
