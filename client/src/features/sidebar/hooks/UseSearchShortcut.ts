import { useEffect, type RefObject } from "react";

/** Ctrl/Cmd+K opens the sidebar (on mobile) and focuses the search box. */
export function useSearchShortcut(inputRef: RefObject<HTMLInputElement | null>, openSidebar: () => void): void {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        openSidebar();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [inputRef, openSidebar]);
}
