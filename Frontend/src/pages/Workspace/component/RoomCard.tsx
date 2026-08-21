import { DoorOpen } from "lucide-react";
import type { Room } from "../../../types/room.types";
import { formatRelativeTime } from "../../../utils/formatRelativeTime";

export interface RoomCardProps {
    room: Room;
    onClick?: () => void;
}

export default function RoomCard({ room, onClick }: RoomCardProps) {
    const isActive = room.status === "ACTIVE";

    return (
        <button
            type="button"
            onClick={onClick}
            className="
                flex w-full flex-col rounded-xl border p-5 text-left
                transition-all duration-200 hover:border-white/10
            "
        >
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/15 text-blue-400">
                        <DoorOpen size={20} strokeWidth={1.8} />
                    </div>

                    <h3 className="text-[14px] font-semibold text-white">
                        {room.name}
                    </h3>
                </div>

                <span
                    className={`
                        rounded-full px-2 py-0.5 text-[11px] font-medium
                        ${isActive
                            ? "bg-blue-500/15 text-blue-400"
                            : "bg-white/10 text-white/50"
                        }
                    `}
                >
                    {isActive ? "Active" : "Idle"}
                </span>
            </div>

            {room.description && (
                <p className="mt-3 line-clamp-2 text-[12px] leading-5 text-white/55">
                    {room.description}
                </p>
            )}

            <div className="mt-4 flex items-center justify-end border-t pt-3 text-[11px] text-white/40">
                <span>{formatRelativeTime(room.updatedAt)}</span>
            </div>
        </button>
    );
}
