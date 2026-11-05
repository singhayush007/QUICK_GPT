import { useCallback, useRef, useState, type RefObject } from "react";
import { STICK_TO_BOTTOM_THRESHOLD } from "../constants/chat.constants";

/**
 * Keeps a scroll container pinned to the bottom while content grows, unless the
 * user scrolled up (then a "jump to latest" button is offered).
 */
export function useAutoScroll(): {
  scrollRef: RefObject<HTMLDivElement | null>;
  showJump: boolean;
  onScroll: () => void;
  jumpToBottom: () => void;
  /** Re-attach to the bottom (e.g. right after sending a message). */
  stickToBottom: () => void;
  /** Scroll down if the user hasn't scrolled away; call when the content grows. */
  pinIfStuck: () => void;
} {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const stickRef = useRef(true);
  const [showJump, setShowJump] = useState(false);

  const pinIfStuck = useCallback(() => {
    const el = scrollRef.current;
    if (el && stickRef.current) el.scrollTo({ top: el.scrollHeight });
  }, []);

  const onScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < STICK_TO_BOTTOM_THRESHOLD;
    stickRef.current = nearBottom;
    setShowJump(!nearBottom);
  }, []);

  const jumpToBottom = useCallback(() => {
    stickRef.current = true;
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, []);

  const stickToBottom = useCallback(() => {
    stickRef.current = true;
  }, []);

  return { scrollRef, showJump, onScroll, jumpToBottom, stickToBottom, pinIfStuck };
}
