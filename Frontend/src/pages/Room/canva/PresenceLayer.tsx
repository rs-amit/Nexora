import { useCanvasStore } from "../../../store/canvas.store";
import type { RoomMemberInfo } from "../../../hooks/useRoomMembers";

function PresenceLayer({ members }: { members: RoomMemberInfo[] }) {
  const { remoteCursors, zoom } = useCanvasStore();

  const nameFor = (userId: string) =>
    members.find((member) => member.userId === userId)?.name ?? "Guest";

  return (
    <div className="absolute inset-0 z-30 pointer-events-none">
      {remoteCursors.map((cursor) => (
        <div
          key={cursor.userId}
          className="absolute transition-[left,top] duration-150 ease-out"
          style={{ left: cursor.x, top: cursor.y }}
        >
          {/* Counter-scale so the cursor/label keep a constant on-screen
              size — only their position (above) should follow zoom/pan. */}
          <div
            className="flex items-center gap-1"
            style={{ transform: `scale(${1 / zoom})`, transformOrigin: "top left" }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" style={{ fill: cursor.color }}>
              <path d="M2 1 L2 15 L6 11.5 L8.5 16.5 L10.5 15.5 L8 10.5 L13 10.5 Z" />
            </svg>

            <span
              className="inline-block whitespace-nowrap rounded px-1.5 py-0.5 text-[10px] text-white"
              style={{ background: cursor.color }}
            >
              {nameFor(cursor.userId)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default PresenceLayer;
