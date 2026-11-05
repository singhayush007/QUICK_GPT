import { useEffect, useState } from "react";
import type { ComposerMode } from "../types/chat.types";

/** After this long without a first token we tell the user the AI is slow (it's not stuck). */
const SLOW_HINT_AFTER_MS = 8000;

/** "Thinking…" indicator shown before the first token (or while an image renders). */
export default function PendingReply({ mode }: { mode: ComposerMode }) {
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setSlow(true), SLOW_HINT_AFTER_MS);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex items-center gap-3 py-3" aria-label="Thinking">
      <span className="btn-gradient grid size-8 place-items-center rounded-xl">
        <span className="size-2 animate-ping rounded-full bg-white" />
      </span>
      <div className="flex gap-1.5">
        {[0, 150, 300].map((d) => (
          <span key={d} style={{ animationDelay: `${d}ms` }} className="size-2 animate-bounce rounded-full bg-muted" />
        ))}
      </div>
      {mode === "image" ? (
        <span className="text-xs text-muted">Generating image — this can take ~20s…</span>
      ) : (
        slow && <span className="text-xs text-muted">The AI is taking longer than usual — hang on…</span>
      )}
    </div>
  );
}
