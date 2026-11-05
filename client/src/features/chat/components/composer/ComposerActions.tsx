import { ArrowUp, Mic, Square } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { readAloudSupported, voiceInputSupported } from "@/shared/utils/speech.utils";
import { MAX_PROMPT_LENGTH } from "../../constants/chat.constants";
import type { ComposerMode } from "../../types/chat.types";

interface ComposerActionsProps {
  prompt: string;
  mode: ComposerMode;
  cost: number;
  busy: boolean;
  hasChat: boolean;
  onSubmit: () => void;
  onStop: () => void;
  onStartVoice: () => void;
}

/** Right side of the composer: credit cost, voice-conversation mic, Stop / Send. */
export default function ComposerActions({ prompt, mode, cost, busy, hasChat, onSubmit, onStop, onStartVoice }: ComposerActionsProps) {
  const voiceSupported = voiceInputSupported && readAloudSupported;
  const hasText = Boolean(prompt.trim());

  return (
    <div className="flex items-center gap-1.5 sm:gap-3">
      <span className="text-[11px] text-muted max-sm:hidden">
        {prompt.length > MAX_PROMPT_LENGTH * 0.8 ? `${prompt.length}/${MAX_PROMPT_LENGTH} · ` : ""}
        {cost} credit{cost > 1 ? "s" : ""}
      </span>
      {voiceSupported && !busy && mode === "text" && (
        <button
          onClick={onStartVoice}
          disabled={!hasChat}
          aria-label="Start voice conversation"
          title="Talk to QuickGPT — it sends after 3 seconds of silence and answers out loud"
          className={cn(
            "grid size-9 cursor-pointer place-items-center rounded-full transition disabled:opacity-40",
            hasText ? "text-muted hover:bg-surface-2 hover:text-fg" : "btn-gradient text-white",
          )}
        >
          <Mic size={17} />
        </button>
      )}
      {busy ? (
        <button
          onClick={onStop}
          aria-label="Stop generating"
          className="grid size-9 cursor-pointer place-items-center rounded-full bg-fg text-bg transition hover:opacity-80"
        >
          <Square size={14} fill="currentColor" />
        </button>
      ) : (
        (hasText || mode === "image" || !voiceSupported) && (
          <button
            onClick={onSubmit}
            disabled={!hasText}
            aria-label="Send message"
            className="btn-gradient grid size-9 cursor-pointer place-items-center rounded-full text-white transition disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ArrowUp size={18} />
          </button>
        )
      )}
    </div>
  );
}
