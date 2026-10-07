import type { WorkspaceMemberInfo } from "../../../hooks/useWorkspaceMembers";
import Skeleton from "../../../components/ui/Skeleton";

export interface ParticipantsPanelProps {
  members: WorkspaceMemberInfo[];
  onlineUserIds: string[];
  currentUserId?: string;
  onMessageMember: (userId: string) => void;
}

function ParticipantsPanel({
  members,
  onlineUserIds,
  currentUserId,
  onMessageMember,
}: ParticipantsPanelProps) {
  return (
    <div className="absolute bottom-[64px] right-4 w-64 rounded-xl border border-white/10 bg-[#111923] p-2 shadow-xl">
      <p className="px-2 py-1 text-[11px] font-semibold uppercase text-white/40">
        Participants
      </p>

      <div className="max-h-72 space-y-0.5 overflow-y-auto">
        {members.map((member) => {
          const isSelf = member.userId === currentUserId;
          const isOnline = onlineUserIds.includes(member.userId);

          return (
            <div
              key={member.userId}
              className="flex items-center justify-between rounded-lg px-2 py-1.5 hover:bg-white/5"
            >
              <div className="flex min-w-0 items-center gap-2">
                <span
                  className={`h-2 w-2 shrink-0 rounded-full ${
                    isOnline ? "bg-emerald-400" : "bg-white/20"
                  }`}
                />

                <span className="truncate text-[13px] text-white/90">
                  {member.name}
                  {isSelf && <span className="text-white/40"> (You)</span>}
                </span>
              </div>

              {!isSelf && (
                <button
                  type="button"
                  onClick={() => onMessageMember(member.userId)}
                  className="shrink-0 rounded-md px-2 py-1 text-[11px] text-[#2563EB] transition hover:bg-[#2563EB]/10"
                >
                  Message
                </button>
              )}
            </div>
          );
        })}

        {members.length === 0 &&
          Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="flex items-center gap-2 px-2 py-2">
              <Skeleton className="h-2 w-2 shrink-0 rounded-full" />
              <Skeleton className={`h-3 ${index % 2 === 0 ? "w-28" : "w-20"}`} />
            </div>
          ))}
      </div>
    </div>
  );
}

export default ParticipantsPanel;
