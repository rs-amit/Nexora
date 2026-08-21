import { useCallback, useState } from "react";
import { useParams } from "react-router-dom";

import Header from "./components/RoomHeader";
import RoomFooter from "./components/RoomFooter";
import RoomMembersModal from "./components/RoomMembersModal";

import CanvasBoard from "./canva/CanvasBoard";
import ChatDock from "./components/ChatDock";
import useFetch from "../../components/customHooks/useFatch";
import { roomService } from "../../service/room.service";
import type { GetRoomByIdResponse } from "../../types/room.types";
import { useWorkspaceMembers } from "../../hooks/useWorkspaceMembers";
import { useRoomMembers } from "../../hooks/useRoomMembers";
import { getCurrentUser } from "../../lib/currentUser";
import { ChatProvider } from "../../context/ChatContext";
import { CanvasProvider } from "../../store/canvas.store";

function Room() {
  const { roomId } = useParams<{ roomId: string }>();

  const fetchRoom = useCallback((): Promise<GetRoomByIdResponse> => {
    return roomService.getRoomById(roomId as string);
  }, [roomId]);

  const { data: roomResponse, loading: roomLoading } =
    useFetch<GetRoomByIdResponse>(fetchRoom);

  const roomName = roomResponse?.data?.name ?? "Untitled Room";
  const room = roomResponse?.data;

  const {
    members,
    visibility,
    addMember,
    removeMember,
  } = useRoomMembers(roomId);
  const { members: workspaceMembers } = useWorkspaceMembers(room?.workspaceId);

  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);

  const currentUser = getCurrentUser();
  const currentMembership = members.find(
    (member) => member.userId === currentUser?.id
  );
  const isOwner = currentMembership?.role === "OWNER";
  const isRoomCreator = room?.createdBy === currentUser?.id;
  const canManageMembers = isOwner || isRoomCreator;

  return (
    <div className="h-screen flex flex-col overflow-hidden text-white">

      {/* Header */}
      <div className="shrink-0 z-50">
        <Header
          roomName={roomName}
          loading={roomLoading}
          onManageMembers={
            canManageMembers ? () => setIsMembersModalOpen(true) : undefined
          }
        />
      </div>

      {canManageMembers && (
        <RoomMembersModal
          isOpen={isMembersModalOpen}
          onClose={() => setIsMembersModalOpen(false)}
          visibility={visibility}
          roomMembers={members}
          workspaceMembers={workspaceMembers}
          currentUserId={currentUser?.id}
          onAdd={addMember}
          onRemove={removeMember}
        />
      )}

      {/* Canvas */}
      {roomId && (
        <CanvasProvider roomId={roomId}>
          <CanvasBoard members={members} />
        </CanvasProvider>
      )}

      {/* Footer + Chat */}
      {roomId && (
        <ChatProvider roomId={roomId}>
          <div className="shrink-0 z-50">
            <RoomFooter members={members} />
          </div>

          <ChatDock members={members} />
        </ChatProvider>
      )}

    </div>
  );
}

export default Room;