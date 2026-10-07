import Button from "../../../components/ui/Button/CustomButton";
import Skeleton from "../../../components/ui/Skeleton";
import { UserPlus } from "lucide-react";
import type { WorkspaceMemberInfo } from "../../../hooks/useWorkspaceMembers";
import { getCurrentUser } from "../../../lib/currentUser";

export interface MembersTabProps {
    members: WorkspaceMemberInfo[];
    loading: boolean;
    isOwner: boolean;
    onInviteClick: () => void;
}

// Members come from the parent Workspace page, which already loads them —
// avoids a second identical fetch when this tab opens.
function MembersTab({ members, loading, isOwner, onInviteClick }: MembersTabProps) {
    const currentUser = getCurrentUser();
    const showSkeleton = loading && members.length === 0;

    return (
        <div className="mt-6">
            <div className="mb-4 flex items-center justify-between">
                <div>
                    <h2 className="text-[16px] font-semibold">Members</h2>
                    {showSkeleton ? (
                        <Skeleton className="mt-1.5 h-3 w-20" />
                    ) : (
                        <p className="text-sm text-white/50">
                            {members.length} {members.length === 1 ? "member" : "members"}
                        </p>
                    )}
                </div>

                {isOwner && (
                    <Button
                        type="button"
                        leftIcon={<UserPlus size={15} />}
                        onClick={onInviteClick}
                        className="!text-[12px]"
                    >
                        Invite Member
                    </Button>
                )}
            </div>

            <div className="divide-y divide-white/5 rounded-xl border border-white/10">
                {showSkeleton && Array.from({ length: 5 }).map((_, index) => (
                    <div
                        key={index}
                        className="flex items-center justify-between px-4 py-3"
                    >
                        <div className="min-w-0 space-y-1.5">
                            <Skeleton className="h-3.5 w-32" />
                            <Skeleton className="h-3 w-40" />
                        </div>

                        <Skeleton className="h-5 w-14 shrink-0 rounded-full" />
                    </div>
                ))}

                {!showSkeleton && members.map((member) => (
                    <div
                        key={member.userId}
                        className="flex items-center justify-between px-4 py-3"
                    >
                        <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-white">
                                {member.name}
                                {member.userId === currentUser?.id && (
                                    <span className="text-white/40"> (You)</span>
                                )}
                            </p>
                            <p className="truncate text-xs text-white/40">{member.email}</p>
                        </div>

                        <span
                            className="
                                shrink-0 rounded-full border border-white/10
                                bg-white/5 px-2.5 py-1 text-[11px] text-white/70
                            "
                        >
                            {member.role}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default MembersTab;
