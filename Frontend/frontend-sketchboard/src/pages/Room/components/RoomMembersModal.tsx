import { useEffect, useState } from "react";
import { X, UserMinus, UserPlus } from "lucide-react";
import type { RoomMemberInfo } from "../../../hooks/useRoomMembers";
import type { WorkspaceMemberInfo } from "../../../hooks/useWorkspaceMembers";
import type { RoomVisibility } from "../../../types/room.types";

export interface RoomMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  visibility: RoomVisibility;
  roomMembers: RoomMemberInfo[];
  workspaceMembers: WorkspaceMemberInfo[];
  currentUserId?: string;
  onAdd: (userId: string) => Promise<void>;
  onRemove: (userId: string) => Promise<void>;
}

function RoomMembersModal({
  isOpen,
  onClose,
  visibility,
  roomMembers,
  workspaceMembers,
  currentUserId,
  onAdd,
  onRemove,
}: RoomMembersModalProps) {
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const roomMemberIds = new Set(roomMembers.map((member) => member.userId));
  const addableMembers = workspaceMembers.filter(
    (member) => !roomMemberIds.has(member.userId)
  );

  const handleAdd = async (userId: string) => {
    setError(null);
    setPendingUserId(userId);

    try {
      await onAdd(userId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add member.");
    } finally {
      setPendingUserId(null);
    }
  };

  const handleRemove = async (userId: string) => {
    setError(null);
    setPendingUserId(userId);

    try {
      await onRemove(userId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove member.");
    } finally {
      setPendingUserId(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="room-members-title"
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-md rounded-xl border border-white/10 bg-[#111923] p-6 text-white shadow-xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 id="room-members-title" className="text-[18px] font-semibold">
            Manage Room Access
          </h2>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-md p-1 text-white/50 transition hover:bg-white/5 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {visibility === "OPEN" && (
          <p className="mb-4 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/60">
            This room is open to every workspace member. Removing someone
            restricts it to only the members listed below.
          </p>
        )}

        {error && (
          <p className="mb-3 text-sm text-red-400" role="alert">
            {error}
          </p>
        )}

        <p className="mb-2 text-xs font-semibold uppercase text-white/40">
          In this room ({roomMembers.length})
        </p>

        <div className="mb-4 max-h-48 divide-y divide-white/5 overflow-y-auto rounded-xl border border-white/10">
          {roomMembers.map((member) => (
            <div
              key={member.userId}
              className="flex items-center justify-between px-3 py-2"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-white">
                  {member.name}
                  {member.userId === currentUserId && (
                    <span className="text-white/40"> (You)</span>
                  )}
                </p>
                <p className="truncate text-xs text-white/40">{member.email}</p>
              </div>

              <button
                type="button"
                disabled={pendingUserId === member.userId}
                onClick={() => handleRemove(member.userId)}
                aria-label={`Remove ${member.name}`}
                className="shrink-0 rounded-md p-1.5 text-white/40 transition hover:bg-red-500/10 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <UserMinus size={15} />
              </button>
            </div>
          ))}

          {roomMembers.length === 0 && (
            <p className="px-3 py-3 text-xs text-white/40">No members yet.</p>
          )}
        </div>

        <p className="mb-2 text-xs font-semibold uppercase text-white/40">
          Add from workspace
        </p>

        <div className="max-h-48 divide-y divide-white/5 overflow-y-auto rounded-xl border border-white/10">
          {addableMembers.map((member) => (
            <div
              key={member.userId}
              className="flex items-center justify-between px-3 py-2"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-white">
                  {member.name}
                </p>
                <p className="truncate text-xs text-white/40">{member.email}</p>
              </div>

              <button
                type="button"
                disabled={pendingUserId === member.userId}
                onClick={() => handleAdd(member.userId)}
                aria-label={`Add ${member.name}`}
                className="shrink-0 rounded-md p-1.5 text-white/40 transition hover:bg-blue-500/10 hover:text-blue-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <UserPlus size={15} />
              </button>
            </div>
          ))}

          {addableMembers.length === 0 && (
            <p className="px-3 py-3 text-xs text-white/40">
              All workspace members already have access.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default RoomMembersModal;
