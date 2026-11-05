import { memo } from "react";
import { Zap } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { timeAgo } from "@/shared/utils/time.utils";
import type { ChatMessage } from "@/shared/types";
import { modelLabel } from "@/shared/constants/models.constants";
import MarkdownContent from "./MarkdownContent";
import MessageActions from "./MessageActions";

interface MessageProps {
  message: ChatMessage;
  /** Assistant message that is still receiving tokens (shows a caret, hides actions). */
  streaming?: boolean;
  onRegenerate?: () => void;
}

function UserMessage({ message }: { message: ChatMessage }) {
  return (
    <div className="animate-fade-up group/msg flex justify-end py-3">
      <div className="max-w-[85%] md:max-w-2xl">
        <div className="btn-gradient rounded-2xl rounded-br-md px-4 py-2.5 text-[0.95rem] leading-relaxed text-white whitespace-pre-wrap [overflow-wrap:anywhere]">
          {message.content}
        </div>
        <p className="mt-1 text-right text-[11px] text-muted">{timeAgo(message.timestamp)}</p>
      </div>
    </div>
  );
}

function Message({ message, streaming = false, onRegenerate }: MessageProps) {
  if (message.role === "user") return <UserMessage message={message} />;

  const label = modelLabel(message.model);
  return (
    <div className="animate-fade-up group/msg flex gap-3 py-3">
      <span className="btn-gradient mt-0.5 grid size-8 shrink-0 place-items-center rounded-xl text-white">
        <Zap size={15} fill="currentColor" strokeWidth={1.5} />
      </span>
      <div className="min-w-0 max-w-full flex-1 md:max-w-3xl">
        {message.isImage ? (
          <img src={message.content} alt="AI generated" loading="lazy" className="w-full max-w-md rounded-2xl border border-line shadow-lg" />
        ) : (
          <div className="md">
            <MarkdownContent>{message.content}</MarkdownContent>
            {streaming && <span className="animate-blink ml-0.5 inline-block h-4 w-0.5 translate-y-0.5 bg-brand" />}
          </div>
        )}
        {!streaming && (
          <div className="mt-1 flex items-center gap-1">
            <span className="mr-1 text-[11px] text-muted">{timeAgo(message.timestamp)}</span>
            {label && (
              <span
                className={cn(
                  "mr-1 rounded px-1.5 py-px text-[10px] font-semibold",
                  message.model === "pro" ? "bg-amber-500/15 text-amber-500" : "bg-surface-2 text-muted",
                )}
              >
                {label}
              </span>
            )}
            <MessageActions message={message} onRegenerate={onRegenerate} />
          </div>
        )}
      </div>
    </div>
  );
}

export default memo(Message);
