import { useCallback, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Users, DoorOpen, Clock3, FilePlusCorner, UserPlus } from "lucide-react";
import useFetch from "../../components/customHooks/useFatch";
import Button from "../../components/ui/Button/CustomButton";
import { workspaceService } from "../../service/workspace.service";
import { roomService } from "../../service/room.service";
import type { GetWorkspaceByIdResponse } from "../../types/workspace.types";
import type { GetWorkspaceRoomsResponse } from "../../types/room.types";
import { formatRelativeTime } from "../../utils/formatRelativeTime";
import CreateRoomModal, {
    type CreateRoomPayload,
} from "./component/CreateRoomModal";
import RoomCard from "./component/RoomCard";
import MembersTab from "./component/MembersTab";
import { useWorkspaceMembers } from "../../hooks/useWorkspaceMembers";
import type { InviteMemberPayload } from "./component/InviteMemberModal";
import InviteMemberModal from "./component/InviteMemberModal";
import { getCurrentUser } from "../../lib/currentUser";

const TABS = ["Overview", "Rooms", "Members", "Settings"] as const;
type Tab = (typeof TABS)[number];

function Workspace() {
    const { workspaceId } = useParams<{ workspaceId: string }>();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<Tab>("Overview");
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const { members, refetch } = useWorkspaceMembers(workspaceId);
        const [isInviteOpen, setIsInviteOpen] = useState(false);

    const fetchWorkspace = useCallback((): Promise<GetWorkspaceByIdResponse> => {
        return workspaceService.getWorkspaceById(workspaceId as string);
    }, [workspaceId]);

    const fetchRooms = useCallback((): Promise<GetWorkspaceRoomsResponse> => {
        return roomService.getWorkspaceRooms(workspaceId as string);
    }, [workspaceId]);

    const {
        data: workspaceResponse,
        refetch: refetchWorkspace,
        loading: workspaceLoading,
        error: workspaceError,
    } = useFetch<GetWorkspaceByIdResponse>(fetchWorkspace);

    const {
        data: roomsResponse,
        refetch: refetchRooms,
        loading: roomsLoading,
        error: roomsError,
    } = useFetch<GetWorkspaceRoomsResponse>(fetchRooms);

    const workspace = workspaceResponse?.data;
    const rooms = useMemo(() => roomsResponse?.data ?? [], [roomsResponse]);

    const currentUser = getCurrentUser();
    const currentMembership = members.find(
        (member) => member.userId === currentUser?.id
    );

    const isOwner = currentMembership?.role === "OWNER";

    const handleInvite = async (payload: InviteMemberPayload) => {
        await workspaceService.inviteMember(workspaceId as string, payload);
        await refetch();
        setIsInviteOpen(false);
    };

    const handleCreateRoom = async ({
        name,
        description,
    }: CreateRoomPayload) => {
        await roomService.createWorkspaceRoom(workspaceId as string, {
            name,
            description,
        });

        await Promise.all([refetchRooms(), refetchWorkspace()]);

        setIsCreateModalOpen(false);
    };

    if (workspaceLoading) {
        return <div className="p-8 text-white/60">Loading workspace...</div>;
    }

    if (workspaceError || !workspace) {
        return (
            <div className="p-8 text-red-400">
                {workspaceError ?? "Workspace not found."}
            </div>
        );
    }

    return (
        <div className="mx-auto w-full max-w-[1200px] p-6 text-white">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-[24px] font-semibold">{workspace.name}</h1>
                    {workspace.description && (
                        <p className="mt-1 text-white/55">{workspace.description}</p>
                    )}
                </div>
                <div>
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
            </div>

            {/* Tabs */}
            <div className="mt-6 flex gap-6 border-b border-white/10">
                {TABS.map((tab) => (
                    <button
                        key={tab}
                        type="button"
                        onClick={() => setActiveTab(tab)}
                        className={`
                            border-b-2 pb-3 text-sm transition
                            ${activeTab === tab
                                ? "border-blue-500 text-white"
                                : "border-transparent text-white/50 hover:text-white/80"
                            }
                        `}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {activeTab === "Overview" ? (
                <div className="mt-6">
                    {/* Stats */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div className="rounded-xl border p-5">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/15 text-cyan-400">
                                <Users size={18} strokeWidth={1.8} />
                            </div>
                            <p className="mt-3 text-sm text-white/55">Members</p>
                            <p className="text-2xl font-semibold">
                                {workspace.stats.memberCount}
                            </p>
                            {workspace.stats.newMembersThisWeek > 0 && (
                                <p className="mt-1 text-xs text-green-400">
                                    +{workspace.stats.newMembersThisWeek} this week
                                </p>
                            )}
                        </div>

                        <div className="rounded-xl border p-5">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/15 text-purple-400">
                                <DoorOpen size={18} strokeWidth={1.8} />
                            </div>
                            <p className="mt-3 text-sm text-white/55">Rooms</p>
                            <p className="text-2xl font-semibold">{rooms.length}</p>
                            {workspace.stats.activeRoomCount > 0 && (
                                <p className="mt-1 text-xs text-green-400">
                                    {workspace.stats.activeRoomCount} active now
                                </p>
                            )}
                        </div>

                        <div className="rounded-xl border p-5">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/15 text-orange-400">
                                <Clock3 size={18} strokeWidth={1.8} />
                            </div>
                            <p className="mt-3 text-sm text-white/55">Last Activity</p>
                            <p className="text-2xl font-semibold">
                                {formatRelativeTime(workspace.stats.lastActivity.at)}
                            </p>
                            <p className="mt-1 truncate text-xs text-white/40">
                                By {workspace.stats.lastActivity.userId}
                            </p>
                        </div>
                    </div>

                    {/* Rooms */}
                    <div className="mt-8">
                        <div className="mb-4 flex items-center justify-between">
                            <div>
                                <h2 className="text-[16px] font-semibold">Rooms</h2>
                                <p className="text-sm text-white/50">
                                    Create or join a room to start collaborating.
                                </p>
                            </div>

                            <Button
                                type="button"
                                leftIcon={<FilePlusCorner size={15} />}
                                onClick={() => setIsCreateModalOpen(true)}
                                className="!text-[12px]"
                            >
                                New Room
                            </Button>
                        </div>

                        {roomsError && (
                            <p className="mb-4 text-sm text-red-400">{roomsError}</p>
                        )}

                        {roomsLoading ? (
                            <p className="text-white/50">Loading rooms...</p>
                        ) : (
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                {rooms.map((room) => (
                                    <RoomCard
                                        key={room._id}
                                        room={room}
                                        onClick={() => navigate(`/room/${room._id}`)}
                                    />
                                ))}

                                <button
                                    type="button"
                                    onClick={() => setIsCreateModalOpen(true)}
                                    className="
                                        flex min-h-[140px] flex-col items-center
                                        justify-center gap-2 rounded-xl border
                                        border-dashed text-white/50 transition
                                        hover:border-white/25 hover:text-white
                                    "
                                >
                                    <span className="flex h-9 w-9 items-center justify-center rounded-full border text-lg">
                                        +
                                    </span>
                                    <span className="text-sm font-medium">Create New Room</span>
                                    <span className="text-xs text-white/40">
                                        Start a new discussion or canvas
                                    </span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            ) : activeTab === "Members" ? (
                <MembersTab workspaceId={workspaceId as string} />
            ) : (
                <div className="mt-10 text-center text-white/40">
                    {activeTab} coming soon.
                </div>
            )}

            <CreateRoomModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onCreate={handleCreateRoom}
            />

             <InviteMemberModal
                isOpen={isInviteOpen}
                onClose={() => setIsInviteOpen(false)}
                onInvite={handleInvite}
            />
        </div>
    );
}

export default Workspace;
