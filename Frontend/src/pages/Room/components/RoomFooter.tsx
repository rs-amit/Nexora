import { useState } from "react";

import { BsChatSquare } from "react-icons/bs";
import { MdPeopleOutline } from "react-icons/md";

import { useChat } from "../../../context/ChatContext";
import { getCurrentUser } from "../../../lib/currentUser";
import type { WorkspaceMemberInfo } from "../../../hooks/useWorkspaceMembers";
import ParticipantsPanel from "./ParticipantsPanel";

export interface RoomFooterProps {
  members: WorkspaceMemberInfo[];
}

function RoomFooter({ members }: RoomFooterProps) {
  const { openGroupChat, openDm, onlineUserIds } = useChat();
  const [showParticipants, setShowParticipants] = useState(false);

  const currentUser = getCurrentUser();

  const items = [
    {
      label: "Chat",
      icon: <BsChatSquare size={16} />,
      onClick: () => {
        setShowParticipants(false);
        openGroupChat();
      },
    },
    {
      label: "Participants",
      icon: <MdPeopleOutline size={16} />,
      onClick: () => setShowParticipants((prev) => !prev),
    },
  ];

  return (
    <div
      className="
        relative
        h-[58px]
        flex items-center justify-center
        px-4
        bg-[#171717]
        border-t border-white/5
      "
    >
      <div className="flex items-center gap-3">

        {items.map((item) => (
          <button
            key={item.label}
            onClick={item.onClick}
            className="
              flex items-center gap-2
              px-4 py-2
              rounded-xl
              text-white/70 text-sm
              hover:bg-white/5
              hover:text-white
              transition-all duration-200
            "
          >
            {item.icon}

            <span>{item.label}</span>
          </button>
        ))}

      </div>

      {showParticipants && (
        <ParticipantsPanel
          members={members}
          onlineUserIds={onlineUserIds}
          currentUserId={currentUser?.id}
          onMessageMember={(userId) => {
            openDm(userId);
            setShowParticipants(false);
          }}
        />
      )}
    </div>
  );
}

export default RoomFooter;
