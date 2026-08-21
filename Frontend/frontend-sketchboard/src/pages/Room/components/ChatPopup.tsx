import { useEffect, useRef, useState } from "react";
import { X, Minus } from "lucide-react";
import type { ChatMessage } from "../../../types/chat.types";
import type { ChatPopupState } from "../../../context/ChatContext";

export interface ChatPopupProps {
  popup: ChatPopupState;
  title: string;
  online?: boolean;
  messages: ChatMessage[];
  unreadCount: number;
  currentUserId: string;
  getSenderName: (userId: string) => string;
  onClose: () => void;
  onToggleMinimize: () => void;
  onSend: (text: string) => void;
}

function ChatPopup({
  popup,
  title,
  online,
  messages,
  unreadCount,
  currentUserId,
  getSenderName,
  onClose,
  onToggleMinimize,
  onSend,
}: ChatPopupProps) {
  const [text, setText] = useState("");
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (popup.minimized) return;

    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages, popup.minimized]);

  const handleSend = () => {
    const trimmed = text.trim();

    if (!trimmed) return;

    onSend(trimmed);
    setText("");
  };

  return (
    <div className="flex w-80 flex-col overflow-hidden rounded-t-xl border border-white/10 bg-[#111923] shadow-xl">
      {/* Header */}
      <div
        onClick={onToggleMinimize}
        className="flex cursor-pointer items-center justify-between border-b border-white/5 bg-[#171925] px-3 py-2.5"
      >
        <div className="flex min-w-0 items-center gap-2">
          {popup.type === "dm" && (
            <span
              className={`h-2 w-2 shrink-0 rounded-full ${
                online ? "bg-emerald-400" : "bg-white/20"
              }`}
            />
          )}

          <span className="truncate text-[13px] font-medium text-white">
            {title}
          </span>

          {unreadCount > 0 && (
            <span className="flex h-4 min-w-4 shrink-0 items-center justify-center rounded-full bg-[#2563EB] px-1 text-[10px] text-white">
              {unreadCount}
            </span>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            aria-label="Minimize"
            onClick={(event) => {
              event.stopPropagation();
              onToggleMinimize();
            }}
            className="rounded p-1 text-white/50 transition hover:bg-white/5 hover:text-white"
          >
            <Minus size={14} />
          </button>

          <button
            type="button"
            aria-label="Close"
            onClick={(event) => {
              event.stopPropagation();
              onClose();
            }}
            className="rounded p-1 text-white/50 transition hover:bg-white/5 hover:text-white"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {!popup.minimized && (
        <>
          {/* Messages */}
          <div
            ref={listRef}
            className="h-80 flex-1 space-y-2 overflow-y-auto px-3 py-3"
          >
            {messages.length === 0 && (
              <p className="mt-4 text-center text-[12px] text-white/30">
                No messages yet
              </p>
            )}

            {messages.map((message) => {
              const isOwn = message.senderId === currentUserId;

              return (
                <div
                  key={message._id}
                  className={`flex flex-col ${
                    isOwn ? "items-end" : "items-start"
                  }`}
                >
                  {popup.type === "group" && !isOwn && (
                    <span className="mb-0.5 text-[11px] text-white/40">
                      {getSenderName(message.senderId)}
                    </span>
                  )}

                  <span
                    className={`max-w-[85%] rounded-lg px-3 py-1.5 text-[13px] ${
                      isOwn
                        ? "bg-[#2563EB]/20 text-white"
                        : "bg-white/5 text-white/90"
                    }`}
                  >
                    {message.text}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="flex items-end gap-2 border-t border-white/5 p-2">
            <textarea
              rows={1}
              value={text}
              onChange={(event) => setText(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Write a message..."
              className="max-h-24 flex-1 resize-none rounded-md border border-white/10 bg-transparent px-2.5 py-1.5 text-[13px] text-white outline-none placeholder:text-white/30 focus:border-[#2563EB]"
            />

            <button
              type="button"
              onClick={handleSend}
              disabled={!text.trim()}
              className="rounded-md bg-[#2563EB] px-3 py-1.5 text-[13px] font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Send
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default ChatPopup;
