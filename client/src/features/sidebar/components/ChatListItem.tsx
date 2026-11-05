import { useState, type MouseEvent } from "react";
import { Check, Globe, MessageSquare, Pencil, Pin, PinOff, Trash2 } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { chatTitle } from "@/shared/utils/chat.utils";
import type { Chat } from "@/shared/types";

interface ChatListItemProps {
  chat: Chat;
  active: boolean;
  onSelect: () => void;
  onRename: (name: string) => void;
  onTogglePin: () => void;
  onRequestDelete: () => void;
}

/** One row of the chat list: select, inline rename, pin, delete. */
export default function ChatListItem({ chat, active, onSelect, onRename, onTogglePin, onRequestDelete }: ChatListItemProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");

  const startEdit = (e: MouseEvent) => {
    e.stopPropagation();
    setDraft(chatTitle(chat));
    setEditing(true);
  };

  const commitEdit = () => {
    const name = draft.trim();
    setEditing(false);
    if (name && name !== chatTitle(chat)) onRename(name);
  };

  return (
    <li>
      <div
        onClick={onSelect}
        className={cn(
          "group flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-sm transition",
          active ? "bg-brand/10 text-fg" : "text-muted hover:bg-surface-2 hover:text-fg",
        )}
      >
        {chat.pinned ? <Pin size={15} className="text-brand" /> : <MessageSquare size={15} className={active ? "text-brand" : ""} />}
        {editing ? (
          <input
            autoFocus
            value={draft}
            maxLength={60}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commitEdit}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitEdit();
              if (e.key === "Escape") setEditing(false);
            }}
            className="min-w-0 flex-1 rounded bg-surface px-1.5 py-0.5 text-fg outline-none ring-1 ring-brand"
          />
        ) : (
          <span className="min-w-0 flex-1 truncate">{chatTitle(chat)}</span>
        )}
        {chat.shareId && !editing && <Globe size={12} className="shrink-0 text-brand group-hover:hidden" aria-label="Shared publicly" />}
        {editing ? (
          <Check size={15} className="text-brand" />
        ) : (
          <span className="flex gap-0.5 opacity-0 transition group-hover:opacity-100 max-md:opacity-100">
            <button
              aria-label={chat.pinned ? "Unpin chat" : "Pin chat"}
              onClick={(e) => {
                e.stopPropagation();
                onTogglePin();
              }}
              className="cursor-pointer rounded p-1 hover:bg-surface hover:text-fg"
            >
              {chat.pinned ? <PinOff size={13} /> : <Pin size={13} />}
            </button>
            <button aria-label="Rename chat" onClick={startEdit} className="cursor-pointer rounded p-1 hover:bg-surface hover:text-fg">
              <Pencil size={13} />
            </button>
            <button
              aria-label="Delete chat"
              onClick={(e) => {
                e.stopPropagation();
                onRequestDelete();
              }}
              className="cursor-pointer rounded p-1 hover:bg-red-500/10 hover:text-red-500"
            >
              <Trash2 size={13} />
            </button>
          </span>
        )}
      </div>
    </li>
  );
}
