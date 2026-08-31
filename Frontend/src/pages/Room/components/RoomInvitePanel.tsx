import { useEffect, useState } from "react";
import { Check, Copy, X } from "lucide-react";

import UserSearchInput from "../../../components/ui/UserSearchInput";
import Button from "../../../components/ui/Button/CustomButton";
import { workspaceService } from "../../../service/workspace.service";
import type { InvitableRole } from "../../../types/workspace.types";
import type { SearchedUser } from "../../../service/auth.service";
import type { RoomMemberInfo } from "../../../hooks/useRoomMembers";
import type { WorkspaceMemberInfo } from "../../../hooks/useWorkspaceMembers";

export interface RoomInvitePanelProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId?: string;
  roomMembers: RoomMemberInfo[];
  workspaceMembers: WorkspaceMemberInfo[];
  onAddRoomMember: (userId: string) => Promise<void>;
}

function RoomInvitePanel({
  isOpen,
  onClose,
  workspaceId,
  roomMembers,
  workspaceMembers,
  onAddRoomMember,
}: RoomInvitePanelProps) {
  const [query, setQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<SearchedUser | null>(null);
  const [role, setRole] = useState<InvitableRole>("EDITOR");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  const resetForm = () => {
    setQuery("");
    setSelectedUser(null);
    setRole("EDITOR");
    setSubmitError(null);
  };

  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isSubmitting) {
        resetForm();
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen) return null;

  const handleOverlayClick = () => {
    if (!isSubmitting) {
      resetForm();
      onClose();
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      resetForm();
      onClose();
    }
  };

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleInvite = async () => {
    if (!selectedUser) return;

    setSubmitError(null);
    setIsSubmitting(true);

    try {
      const isWorkspaceMember = workspaceMembers.some(
        (member) => member.userId === selectedUser._id
      );

      if (!isWorkspaceMember && workspaceId) {
        await workspaceService.inviteMember(workspaceId, {
          email: selectedUser.email,
          role,
        });
      }

      await onAddRoomMember(selectedUser._id);

      resetForm();
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Failed to invite that person. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={handleOverlayClick}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="room-invite-title"
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-md rounded-xl border border-white/10 bg-[#111923] p-6 text-white shadow-xl"
      >
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <h2 id="room-invite-title" className="text-[18px] font-semibold">
            Share this room
          </h2>

          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            aria-label="Close"
            className="rounded-md p-1 text-white/50 transition hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        {/* Copy link */}
        <div className="mb-5 flex items-center gap-2 rounded-md border border-white/10 bg-[#171925] px-3 py-2.5">
          <span className="min-w-0 flex-1 truncate text-sm text-white/70">
            {window.location.href}
          </span>

          <button
            type="button"
            onClick={handleCopyLink}
            className="flex shrink-0 items-center gap-1.5 rounded-md px-2 py-1 text-xs text-white/70 transition hover:bg-white/5 hover:text-white"
          >
            {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>

        <div className="mb-4 flex items-center gap-3">
          <div className="h-px flex-1 bg-white/10" />
          <span className="text-xs text-white/40">or invite someone directly</span>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        {/* Invite form */}
        <div className="space-y-4">
          <UserSearchInput
            label="Invite by name or email"
            placeholder="teammate@company.com"
            value={query}
            onQueryChange={setQuery}
            selectedUser={selectedUser}
            onSelect={setSelectedUser}
            onClear={() => setSelectedUser(null)}
            excludeUserIds={roomMembers.map((member) => member.userId)}
            disabled={isSubmitting}
          />

          <div className="w-full">
            <label htmlFor="room-invite-role" className="mb-1 block text-sm font-medium">
              Role
            </label>

            <select
              id="room-invite-role"
              value={role}
              disabled={isSubmitting}
              onChange={(event) => setRole(event.target.value as InvitableRole)}
              className="
                w-full rounded-md border
                bg-[#171925] px-3 py-3 text-sm outline-none
                transition-all duration-150
                focus:border-blue-500 focus:ring-2 focus:ring-blue-200
                disabled:cursor-not-allowed disabled:opacity-60
              "
            >
              <option value="EDITOR">Editor</option>
              <option value="VIEWER">Viewer</option>
            </select>
          </div>

          {submitError && (
            <p className="text-sm text-red-400" role="alert">
              {submitError}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="mt-5 flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            fullWidth
            disabled={isSubmitting}
          >
            Close
          </Button>

          <Button
            type="button"
            fullWidth
            variant="primary"
            loading={isSubmitting}
            disabled={!selectedUser}
            onClick={handleInvite}
          >
            Invite
          </Button>
        </div>
      </div>
    </div>
  );
}

export default RoomInvitePanel;
