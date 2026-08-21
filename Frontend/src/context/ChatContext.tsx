import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { getSocket, disconnectSocket } from "../socket/socket";
import { chatService } from "../service/chat.service";
import { getCurrentUser } from "../lib/currentUser";
import type { ChatMessage, ChatScope } from "../types/chat.types";

export type PopupKey = string;

export interface ChatPopupState {
  key: PopupKey;
  type: ChatScope;
  otherUserId?: string;
  minimized: boolean;
}

interface AckResponse {
  ok: boolean;
  error?: string;
}

interface ChatContextValue {
  popups: ChatPopupState[];
  messagesByKey: Record<PopupKey, ChatMessage[]>;
  unreadByKey: Record<PopupKey, number>;
  onlineUserIds: string[];
  openGroupChat: () => void;
  openDm: (otherUserId: string) => void;
  closePopup: (key: PopupKey) => void;
  toggleMinimize: (key: PopupKey) => void;
  sendMessage: (key: PopupKey, text: string) => void;
}

const GROUP_KEY: PopupKey = "group";

const dmKeyFor = (otherUserId: string): PopupKey => `dm:${otherUserId}`;

const otherUserFromDmKey = (dmKey: string, myUserId: string) => {
  const [a, b] = dmKey.split("_");
  return a === myUserId ? b : a;
};

const ChatContext = createContext<ChatContextValue | null>(null);

export function ChatProvider({
  roomId,
  children,
}: {
  roomId: string;
  children: ReactNode;
}) {
  const currentUser = useMemo(() => getCurrentUser(), []);

  const [popups, setPopups] = useState<ChatPopupState[]>([]);
  const [messagesByKey, setMessagesByKey] = useState<
    Record<PopupKey, ChatMessage[]>
  >({});
  const [unreadByKey, setUnreadByKey] = useState<Record<PopupKey, number>>({});
  const [onlineUserIds, setOnlineUserIds] = useState<string[]>([]);

  const openVisibleKeysRef = useRef<Set<PopupKey>>(new Set());

  useEffect(() => {
    openVisibleKeysRef.current = new Set(
      popups.filter((popup) => !popup.minimized).map((popup) => popup.key)
    );
  }, [popups]);

  useEffect(() => {
    if (!currentUser) return;

    const socket = getSocket();
    socket.connect();

    socket.emit("room:join", { roomId });

    const handleMessage = (message: ChatMessage) => {
      const key =
        message.scope === "group"
          ? GROUP_KEY
          : dmKeyFor(otherUserFromDmKey(message.dmKey as string, currentUser.id));

      setMessagesByKey((prev) => ({
        ...prev,
        [key]: [...(prev[key] ?? []), message],
      }));

      if (!openVisibleKeysRef.current.has(key)) {
        setUnreadByKey((prev) => ({
          ...prev,
          [key]: (prev[key] ?? 0) + 1,
        }));
      }
    };

    const handlePresence = (payload: {
      roomId: string;
      onlineUserIds: string[];
    }) => {
      if (payload.roomId === roomId) {
        setOnlineUserIds(payload.onlineUserIds);
      }
    };

    socket.on("message:new", handleMessage);
    socket.on("presence:update", handlePresence);

    return () => {
      socket.off("message:new", handleMessage);
      socket.off("presence:update", handlePresence);
      disconnectSocket();
    };
  }, [roomId, currentUser]);

  const openGroupChat = useCallback(() => {
    setPopups((prev) => {
      if (prev.some((popup) => popup.key === GROUP_KEY)) {
        return prev.map((popup) =>
          popup.key === GROUP_KEY ? { ...popup, minimized: false } : popup
        );
      }

      return [...prev, { key: GROUP_KEY, type: "group" as const, minimized: false }];
    });

    setUnreadByKey((prev) => ({ ...prev, [GROUP_KEY]: 0 }));

    chatService
      .getMessages(roomId, { scope: "group" })
      .then((response) => {
        setMessagesByKey((prev) => ({ ...prev, [GROUP_KEY]: response.data }));
      })
      .catch((error) => console.error(error));
  }, [roomId]);

  const openDm = useCallback(
    (otherUserId: string) => {
      const key = dmKeyFor(otherUserId);

      getSocket().emit(
        "dm:open",
        { roomId, otherUserId },
        (ack: AckResponse) => {
          if (!ack.ok) {
            console.error(ack.error);
            return;
          }

          setPopups((prev) => {
            if (prev.some((popup) => popup.key === key)) {
              return prev.map((popup) =>
                popup.key === key ? { ...popup, minimized: false } : popup
              );
            }

            return [
              ...prev,
              { key, type: "dm" as const, otherUserId, minimized: false },
            ];
          });

          setUnreadByKey((prev) => ({ ...prev, [key]: 0 }));

          chatService
            .getMessages(roomId, { scope: "dm", otherUserId })
            .then((response) => {
              setMessagesByKey((prev) => ({ ...prev, [key]: response.data }));
            })
            .catch((error) => console.error(error));
        }
      );
    },
    [roomId]
  );

  const closePopup = useCallback((key: PopupKey) => {
    setPopups((prev) => prev.filter((popup) => popup.key !== key));
  }, []);

  const toggleMinimize = useCallback(
    (key: PopupKey) => {
      const popup = popups.find((entry) => entry.key === key);

      if (!popup) return;

      const nextMinimized = !popup.minimized;

      setPopups((prev) =>
        prev.map((entry) =>
          entry.key === key ? { ...entry, minimized: nextMinimized } : entry
        )
      );

      if (!nextMinimized) {
        setUnreadByKey((prev) => ({ ...prev, [key]: 0 }));
      }
    },
    [popups]
  );

  const sendMessage = useCallback(
    (key: PopupKey, text: string) => {
      const popup = popups.find((entry) => entry.key === key);

      if (!popup) return;

      getSocket().emit("message:send", {
        roomId,
        scope: popup.type,
        otherUserId: popup.otherUserId,
        text,
      });
    },
    [popups, roomId]
  );

  const value: ChatContextValue = {
    popups,
    messagesByKey,
    unreadByKey,
    onlineUserIds,
    openGroupChat,
    openDm,
    closePopup,
    toggleMinimize,
    sendMessage,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const context = useContext(ChatContext);

  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }

  return context;
}
