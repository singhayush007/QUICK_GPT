import { useState, type ReactNode } from "react";
import { Check, Copy, Download, RefreshCw, Volume2, VolumeX } from "lucide-react";
import { downloadFromUrl } from "@/shared/utils/download.utils";
import { stripMarkdown } from "@/shared/utils/format.utils";
import { usePreferencesStore } from "@/store/preferencesStore";
import { useReadAloud } from "@/shared/hooks/UseReadAloud";
import { readAloudSupported } from "@/shared/utils/speech.utils";
import type { ChatMessage } from "@/shared/types";

function IconButton({ onClick, label, children }: { onClick: () => void; label: string; children: ReactNode }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className="cursor-pointer rounded-md p-1.5 text-muted opacity-0 transition hover:bg-surface-2 hover:text-fg focus-visible:opacity-100 group-hover/msg:opacity-100 pointer-coarse:opacity-100"
    >
      {children}
    </button>
  );
}

interface MessageActionsProps {
  message: ChatMessage;
  onRegenerate?: () => void;
}

/** Copy / read aloud / regenerate for text replies, download for images. */
export default function MessageActions({ message, onRegenerate }: MessageActionsProps) {
  const [copied, setCopied] = useState(false);
  const voiceId = usePreferencesStore((s) => s.voiceId);
  const [speaking, toggleSpeak] = useReadAloud(message.isImage ? "" : stripMarkdown(message.content), voiceId);

  const copy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (message.isImage) {
    return (
      <IconButton onClick={() => void downloadFromUrl(message.content, "quickgpt-image.png")} label="Download image">
        <Download size={14} />
      </IconButton>
    );
  }

  return (
    <>
      <IconButton onClick={() => void copy()} label="Copy reply">
        {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
      </IconButton>
      {readAloudSupported && (
        <IconButton onClick={toggleSpeak} label={speaking ? "Stop reading" : "Read aloud"}>
          {speaking ? <VolumeX size={14} className="text-brand" /> : <Volume2 size={14} />}
        </IconButton>
      )}
      {onRegenerate && (
        <IconButton onClick={onRegenerate} label="Regenerate response (1 credit)">
          <RefreshCw size={14} />
        </IconButton>
      )}
    </>
  );
}
