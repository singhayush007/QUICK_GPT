import { useState } from "react";
import { Check, Copy, ExternalLink, Globe, Loader2, Lock, RefreshCw, Share2, X } from "lucide-react";
import toast from "react-hot-toast";
import { useEscapeKey } from "@/shared/hooks/UseEscapeKey";
import { chatTitle, shareUrl } from "@/shared/utils/chat.utils";
import type { Chat } from "@/shared/types";
import { useShareActions } from "../hooks/UseShareActions";

function Point({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-2.5 text-sm text-muted">
      <Lock size={14} className="mt-0.5 shrink-0 text-brand" />
      <span>{children}</span>
    </li>
  );
}

interface ShareDialogProps {
  chat: Chat;
  onClose: () => void;
}

/** Create / copy / refresh / revoke the public link of a chat. */
export default function ShareDialog({ chat, onClose }: ShareDialogProps) {
  const { share, unshare } = useShareActions();
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const shareId = chat.shareId;
  const link = shareId ? shareUrl(shareId) : "";

  useEscapeKey(onClose);

  const run = async <T,>(fn: (chatId: string) => Promise<T>, successMsg?: string): Promise<T> => {
    setBusy(true);
    const result = await fn(chat._id);
    setBusy(false);
    if (result && successMsg) toast.success(successMsg);
    return result;
  };

  const copy = async () => {
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const nativeShare = () => navigator.share({ title: chatTitle(chat), text: "Check out this QuickGPT chat", url: link }).catch(() => {});

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Share chat"
        onClick={(e) => e.stopPropagation()}
        className="animate-pop relative w-full max-w-md rounded-2xl border border-line bg-surface p-6 shadow-2xl"
      >
        <button onClick={onClose} aria-label="Close" className="absolute right-4 top-4 cursor-pointer rounded-lg p-1.5 text-muted hover:bg-surface-2">
          <X size={18} />
        </button>

        <div className="mb-4 grid size-11 place-items-center rounded-full bg-brand/10 text-brand">
          <Globe size={20} />
        </div>
        <h3 className="text-lg font-semibold">{shareId ? "Public link is live" : "Share this chat"}</h3>
        <p className="mt-1 truncate text-sm text-muted">{chatTitle(chat)}</p>

        {shareId ? (
          <>
            <div className="mt-5 flex items-center gap-2 rounded-xl border border-line bg-surface-2/60 p-1.5 pl-3">
              <input readOnly value={link} onFocus={(e) => e.target.select()} className="min-w-0 flex-1 bg-transparent text-sm outline-none" aria-label="Share link" />
              <button onClick={() => void copy()} className="btn-gradient flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-white">
                {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? "Copied" : "Copy"}
              </button>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <a href={link} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 rounded-lg border border-line px-3 py-2 text-xs font-medium hover:bg-surface-2">
                <ExternalLink size={13} /> Open
              </a>
              {"share" in navigator && (
                <button onClick={nativeShare} className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-line px-3 py-2 text-xs font-medium hover:bg-surface-2">
                  <Share2 size={13} /> Share…
                </button>
              )}
              <button
                disabled={busy}
                onClick={() => void run(share, "Link updated with the latest messages")}
                className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-line px-3 py-2 text-xs font-medium hover:bg-surface-2 disabled:opacity-60"
              >
                {busy ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />} Update snapshot
              </button>
            </div>

            <p className="mt-4 text-xs text-muted">
              The link shows the chat as it was when you last shared. New messages stay private until you update it.
            </p>
            <button
              disabled={busy}
              onClick={async () => {
                if (await run(unshare, "Sharing stopped — the link no longer works")) onClose();
              }}
              className="mt-5 w-full cursor-pointer rounded-xl border border-red-500/30 py-2.5 text-sm font-medium text-red-500 transition hover:bg-red-500/10 disabled:opacity-60"
            >
              Stop sharing
            </button>
          </>
        ) : (
          <>
            <ul className="mt-5 space-y-2.5">
              <Point>
                Anyone with the link can read a <b className="text-fg">read-only copy</b> — no login needed.
              </Point>
              <Point>
                It's a <b className="text-fg">snapshot</b> of {chat.messages.length} message{chat.messages.length === 1 ? "" : "s"}; later messages stay private.
              </Point>
              <Point>
                Only your <b className="text-fg">first name</b> is shown — never your email. Generated images are included.
              </Point>
              <Point>The link is unlisted (not searchable) and you can revoke it anytime.</Point>
            </ul>
            <button
              disabled={busy || chat.messages.length === 0}
              onClick={() => void run(share)}
              className="btn-gradient mt-6 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {busy && <Loader2 size={15} className="animate-spin" />}
              {chat.messages.length === 0 ? "Send a message first" : "Create public link"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
