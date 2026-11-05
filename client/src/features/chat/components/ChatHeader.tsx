import { Download, Globe } from "lucide-react";
import { PageHeader } from "@/shared/components/ui";
import { cn } from "@/shared/lib/utils";
import { chatTitle } from "@/shared/utils/chat.utils";
import type { Chat } from "@/shared/types";

interface ChatHeaderProps {
  chat: Chat | null;
  messageCount: number;
  onMenu: () => void;
  onShare: () => void;
  onExport: () => void;
}

export default function ChatHeader({ chat, messageCount, onMenu, onShare, onExport }: ChatHeaderProps) {
  return (
    <PageHeader
      onMenu={onMenu}
      title={chat ? chatTitle(chat) : "QuickGPT"}
      subtitle={`${messageCount} message${messageCount === 1 ? "" : "s"}`}
    >
      <button
        onClick={onShare}
        disabled={!chat}
        className={cn(
          "flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition hover:bg-surface-2",
          chat?.shareId ? "border-brand/50 text-brand" : "border-line text-muted hover:text-fg",
        )}
      >
        <Globe size={14} /> <span className="max-sm:hidden">{chat?.shareId ? "Shared" : "Share"}</span>
      </button>
      <button
        onClick={onExport}
        title="Export chat as Markdown"
        className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-xs font-medium text-muted transition hover:bg-surface-2 hover:text-fg"
      >
        <Download size={14} /> <span className="max-sm:hidden">Export</span>
      </button>
    </PageHeader>
  );
}
