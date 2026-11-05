import { useEffect } from "react";

interface Options {
  /** Listen in the capture phase and stop the event so dialogs behind don't also close. */
  capture?: boolean;
}

/** Calls `onEscape` when Escape is pressed while `enabled`. */
export function useEscapeKey(onEscape: () => void, enabled = true, { capture = false }: Options = {}): void {
  useEffect(() => {
    if (!enabled) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (capture) e.stopPropagation();
      onEscape();
    };
    window.addEventListener("keydown", onKey, capture);
    return () => window.removeEventListener("keydown", onKey, capture);
  }, [onEscape, enabled, capture]);
}
