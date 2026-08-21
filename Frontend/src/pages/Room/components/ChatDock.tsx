import { useChat } from "../../../context/ChatContext";
import { getCurrentUser } from "../../../lib/currentUser";
import type { WorkspaceMemberInfo } from "../../../hooks/useWorkspaceMembers";
import ChatPopup from "./ChatPopup";

export interface ChatDockProps {
  members: WorkspaceMemberInfo[];
}

function ChatDock({ members }: ChatDockProps) {
  const {
    popups,
    messagesByKey,
    unreadByKey,
    onlineUserIds,
    closePopup,
    toggleMinimize,
    sendMessage,
  } = useChat();

  const currentUser = getCurrentUser();

  if (popups.length === 0 || !currentUser) return null;

  const getSenderName = (userId: string) =>
    userId === currentUser.id
      ? "You"
      : members.find((member) => member.userId === userId)?.name ?? "Unknown";

  return (
    <div className="fixed bottom-0 right-4 z-50 flex flex-row-reverse items-end gap-3">
      {popups.map((popup) => {
        const title =
          popup.type === "group"
            ? "Room Chat"
            : getSenderName(popup.otherUserId ?? "");

        return (
          <ChatPopup
            key={popup.key}
            popup={popup}
            title={title}
            online={
              popup.otherUserId
                ? onlineUserIds.includes(popup.otherUserId)
                : undefined
            }
            messages={messagesByKey[popup.key] ?? []}
            unreadCount={unreadByKey[popup.key] ?? 0}
            currentUserId={currentUser.id}
            getSenderName={getSenderName}
            onClose={() => closePopup(popup.key)}
            onToggleMinimize={() => toggleMinimize(popup.key)}
            onSend={(text) => sendMessage(popup.key, text)}
          />
        );
      })}
    </div>
  );
}

export default ChatDock;
