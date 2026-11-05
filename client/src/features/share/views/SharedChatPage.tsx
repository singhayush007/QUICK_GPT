import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowRight, Eye, LinkIcon, Moon, Sun } from "lucide-react";
import Message from "@/shared/components/messages/Message";
import { LoadingScreen, Logo } from "@/shared/components/ui";
import { formatDate } from "@/shared/utils/time.utils";
import { useAuthStore } from "@/store/authStore";
import { useThemeStore } from "@/store/themeStore";
import { useShareActions } from "../hooks/UseShareActions";
import { useSharedChatQuery } from "../hooks/UseSharedChatQuery";

/** Public, read-only view of a shared chat. Works without logging in. */
export default function SharedChatPage() {
  const { shareId } = useParams();
  const user = useAuthStore((s) => s.user);
  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  const { importChat } = useShareActions();
  const { chat, error, loading } = useSharedChatQuery(shareId);

  // keep shared pages out of search engines (the API also sends X-Robots-Tag)
  useEffect(() => {
    const meta = Object.assign(document.createElement("meta"), { name: "robots", content: "noindex,nofollow" });
    document.head.appendChild(meta);
    const prevTitle = document.title;
    return () => {
      meta.remove();
      document.title = prevTitle;
    };
  }, []);

  useEffect(() => {
    if (chat) document.title = `${chat.title} — shared on QuickGPT`;
  }, [chat]);

  if (loading) return <LoadingScreen />;

  return (
    <div className="flex h-screen flex-col">
      <header className="glass flex min-h-14 items-center justify-between gap-3 border-b border-line px-4 md:px-8">
        <Link to="/">
          <Logo />
        </Link>
        <div className="flex items-center gap-2">
          <button onClick={toggleTheme} aria-label="Toggle theme" className="cursor-pointer rounded-lg p-2 text-muted hover:bg-surface-2 hover:text-fg">
            {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
          </button>
          <Link to="/" className="btn-gradient rounded-lg px-4 py-2 text-sm font-semibold text-white">
            {user ? "Open app" : "Try QuickGPT"}
          </Link>
        </div>
      </header>

      {error || !chat ? (
        <div className="grid flex-1 place-items-center p-6 text-center">
          <div className="animate-fade-up max-w-sm">
            <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-surface-2 text-muted">
              <LinkIcon size={28} />
            </span>
            <h1 className="mt-5 text-xl font-semibold">Link not available</h1>
            <p className="mt-2 text-sm text-muted">{error ?? "Could not load this chat"}</p>
            <Link to="/" className="btn-gradient mt-6 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white">
              Go to QuickGPT <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-3xl px-4 pb-16 pt-8 md:px-6">
            <div className="animate-fade-up">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1 text-xs font-medium text-muted">
                <Eye size={13} className="text-brand" /> Read-only shared chat
              </span>
              <h1 className="mt-4 text-2xl font-semibold tracking-tight md:text-3xl">{chat.title}</h1>
              <p className="mt-1.5 text-sm text-muted">
                Shared by <b className="text-fg">{chat.authorName}</b> · {formatDate(chat.sharedAt)} · {chat.messages.length} messages
              </p>
            </div>

            <div className="mt-6 border-t border-line pt-2">
              {chat.messages.map((m, i) => (
                <Message key={`${m.timestamp}-${i}`} message={m} />
              ))}
            </div>

            <div className="mt-10 rounded-2xl border border-line bg-surface p-6 text-center">
              <h2 className="text-lg font-semibold">Want to chat like this?</h2>
              <p className="mt-1 text-sm text-muted">QuickGPT gives you streaming AI chat, image generation and 20 free credits.</p>
              <div className="mt-5 flex flex-wrap justify-center gap-3">
                {user && shareId && (
                  <button onClick={() => void importChat(shareId)} className="btn-gradient cursor-pointer rounded-xl px-5 py-2.5 text-sm font-semibold text-white">
                    Continue in my chats
                  </button>
                )}
                <Link
                  to="/"
                  className={
                    user
                      ? "rounded-xl border border-line px-5 py-2.5 text-sm font-medium hover:bg-surface-2"
                      : "btn-gradient rounded-xl px-5 py-2.5 text-sm font-semibold text-white"
                  }
                >
                  {user ? "Back to my chats" : "Start free"}
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
