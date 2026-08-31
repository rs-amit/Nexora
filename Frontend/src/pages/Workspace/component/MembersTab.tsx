import { useState } from "react";
import { UserPlus } from "lucide-react";
import Button from "../../../components/ui/Button/CustomButton";
import { useWorkspaceMembers } from "../../../hooks/useWorkspaceMembers";
import { getCurrentUser } from "../../../lib/currentUser";
import { workspaceService } from "../../../service/workspace.service";
import InviteMemberModal, {
    type InviteMemberPayload,
} from "./InviteMemberModal";

export interface MembersTabProps {
    workspaceId: string;
}

function MembersTab({ workspaceId }: MembersTabProps) {
    const { members, loading, refetch } = useWorkspaceMembers(workspaceId);
    const [isInviteOpen, setIsInviteOpen] = useState(false);

    const currentUser = getCurrentUser();
    const currentMembership = members.find(
        (member) => member.userId === currentUser?.id
    );
    const isOwner = currentMembership?.role === "OWNER";

    const handleInvite = async (payload: InviteMemberPayload) => {
        await workspaceService.inviteMember(workspaceId, payload);
        await refetch();
        setIsInviteOpen(false);
    };

    if (loading && members.length === 0) {
        return <p className="mt-10 text-center text-white/40">Loading members...</p>;
    }

    return (
        <div className="mt-6">
            <div className="mb-4 flex items-center justify-between">
                <div>
                    <h2 className="text-[16px] font-semibold">Members</h2>
                    <p className="text-sm text-white/50">
                        {members.length} {members.length === 1 ? "member" : "members"}
                    </p>
                </div>

                {isOwner && (
                    <Button
                        type="button"
                        leftIcon={<UserPlus size={15} />}
                        onClick={() => setIsInviteOpen(true)}
                        className="!text-[12px]"
                    >
                        Invite Member
                    </Button>
                )}
            </div>

            <div className="divide-y divide-white/5 rounded-xl border border-white/10">
                {members.map((member) => (
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

            <InviteMemberModal
                isOpen={isInviteOpen}
                onClose={() => setIsInviteOpen(false)}
                onInvite={handleInvite}
                existingMemberIds={members.map((member) => member.userId)}
            />
        </div>
    );
}

export default MembersTab;
