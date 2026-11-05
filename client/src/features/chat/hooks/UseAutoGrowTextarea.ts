import { useEffect, type RefObject } from "react";
import { TEXTAREA_MAX_HEIGHT } from "../constants/chat.constants";

/** Grows a textarea with its content (up to TEXTAREA_MAX_HEIGHT). */
export function useAutoGrowTextarea(ref: RefObject<HTMLTextAreaElement | null>, value: string): void {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, TEXTAREA_MAX_HEIGHT)}px`;
  }, [ref, value]);
}
