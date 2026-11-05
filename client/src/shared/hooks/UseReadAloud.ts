import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { readAloudSupported, speak } from "@/shared/utils/speech.utils";
import type { SpeakController } from "@/shared/types/voice.types";

/** Read text aloud with the selected voice; returns [speaking, toggle]. */
export function useReadAloud(text: string, voice = "device"): [boolean, () => void] {
  const [speaking, setSpeaking] = useState(false);
  const ref = useRef<SpeakController | null>(null);

  useEffect(() => () => ref.current?.cancel(), []);

  const toggle = useCallback(() => {
    if (!readAloudSupported) return;
    if (ref.current && speaking) {
      ref.current.cancel();
      ref.current = null;
      return setSpeaking(false);
    }
    const controller = speak(text, {
      voice,
      onFallback: () => toast("Premium voice unavailable right now — using your device voice.", { icon: "🔈" }),
    });
    ref.current = controller;
    setSpeaking(true);
    void controller.done.then(() => {
      if (ref.current === controller) {
        ref.current = null;
        setSpeaking(false);
      }
    });
  }, [speaking, text, voice]);

  return [speaking, toggle];
}
