import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { LISTEN_RESUME_DELAY_MS, SILENCE_MS } from "../constants/voice.constants";
import { SpeechRecognitionImpl, describeVoiceError, speak } from "@/shared/utils/speech.utils";
import type { SpeakController, SpeechRecognitionLike } from "@/shared/types/voice.types";
import type { VoicePhase } from "../types/voice.types";

/**
 * Retire a recognizer: detach its handlers FIRST so the `onend`/`onerror` that abort() fires can't
 * restart a new session. (Without this, React StrictMode's double mount made two recognizers abort
 * each other in an endless restart loop and the speech never reached the app.)
 */
function discard(rec: SpeechRecognitionLike | null): void {
  if (!rec) return;
  rec.onresult = null;
  rec.onerror = null;
  rec.onend = null;
  try {
    rec.abort();
  } catch {
    /* already stopped */
  }
}

interface Options {
  lang: string;
  voice: string;
  /** Sends one spoken turn through the normal chat pipeline; resolves with the answer (null on failure). */
  onSend: (text: string) => Promise<string | null>;
  /** Abort a request that is still in flight (used when the conversation is closed). */
  onStopRequest: () => void;
  onClose: () => void;
}

/**
 * Hands-free voice conversation (like ChatGPT voice):
 * listen → 3 s of silence → send to the AI → read the answer aloud → listen again.
 */
export function useVoiceConversation({ lang, voice, onSend, onStopRequest, onClose }: Options) {
  const [phase, setPhase] = useState<VoicePhase>("listening");
  const [transcript, setTranscript] = useState("");
  const [reply, setReply] = useState("");
  /** What you just sent (shown while the AI thinks / answers). */
  const [said, setSaid] = useState("");
  /** Restarts the silence countdown bar on every new word. */
  const [tick, setTick] = useState(0);

  const activeRef = useRef(true);
  const phaseRef = useRef<VoicePhase>("listening");
  const recRef = useRef<SpeechRecognitionLike | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const textRef = useRef(""); // everything heard in this turn
  const baseRef = useRef(""); // text from earlier recognition sessions of the same turn
  const speakerRef = useRef<SpeakController | null>(null);
  const listenRef = useRef<() => void>(() => {});
  const latest = useRef({ lang, voice, onSend });

  useEffect(() => {
    latest.current = { lang, voice, onSend };
  });

  const setPhaseBoth = (p: VoicePhase) => {
    phaseRef.current = p;
    setPhase(p);
  };

  const teardown = useCallback(() => {
    activeRef.current = false;
    clearTimeout(timerRef.current);
    discard(recRef.current);
    recRef.current = null;
    speakerRef.current?.cancel();
    window.speechSynthesis.cancel();
  }, []);

  const close = useCallback(() => {
    teardown();
    onStopRequest();
    onClose();
  }, [teardown, onStopRequest, onClose]);

  const speakAnswer = useCallback((text: string) => {
    if (!activeRef.current) return Promise.resolve();
    const controller = speak(text, {
      voice: latest.current.voice,
      lang: latest.current.lang,
      onFallback: () => toast("Premium voice unavailable right now — using your device voice.", { icon: "🔈" }),
    });
    speakerRef.current = controller;
    return controller.done;
  }, []);

  /** Called after 3 s of silence: send what was said, then speak the answer. */
  const finishTurn = useCallback(async () => {
    const text = textRef.current.trim();
    if (!text || !activeRef.current) return;
    discard(recRef.current);
    recRef.current = null;
    setSaid(text);
    setPhaseBoth("thinking");

    const answer = await latest.current.onSend(text);
    if (!activeRef.current) return;
    if (!answer) return close(); // error / no credits: send() already told the user

    setReply(answer);
    setPhaseBoth("speaking");
    await speakAnswer(answer);
    setTimeout(() => {
      if (activeRef.current && phaseRef.current === "speaking") listenRef.current();
    }, LISTEN_RESUME_DELAY_MS);
  }, [close, speakAnswer]);

  const listen = useCallback(() => {
    const Recognition = SpeechRecognitionImpl;
    if (!activeRef.current || !Recognition) return;
    clearTimeout(timerRef.current);
    discard(recRef.current); // never keep two recognizers alive
    recRef.current = null;
    textRef.current = "";
    baseRef.current = "";
    setTranscript("");
    setPhaseBoth("listening");

    const start = () => {
      if (!activeRef.current || phaseRef.current === "thinking" || phaseRef.current === "speaking") return;
      discard(recRef.current);
      const rec = new Recognition();
      rec.lang = latest.current.lang;
      rec.interimResults = true;
      rec.continuous = true;
      let fatal = false;
      // events from a recognizer that is no longer the current one must be ignored
      const isCurrent = () => recRef.current === rec;

      rec.onresult = (e) => {
        if (!isCurrent()) return;
        const heard = baseRef.current + Array.from(e.results).map((r) => r[0].transcript).join("");
        if (!heard.trim()) return;
        textRef.current = heard;
        setTranscript(heard);
        setPhaseBoth("hearing");
        setTick((t) => t + 1);
        // every new word restarts the silence timer
        clearTimeout(timerRef.current);
        timerRef.current = setTimeout(finishTurn, SILENCE_MS);
      };
      rec.onerror = async (e) => {
        if (!isCurrent()) return;
        if (e.error === "no-speech" || e.error === "aborted") return;
        fatal = true;
        const message = await describeVoiceError(e.error);
        if (message) toast.error(message, { duration: 6000 });
        close();
      };
      rec.onend = () => {
        // the browser ends sessions by itself (silence / time limit) — keep the mic open
        if (!isCurrent() || fatal || !activeRef.current || phaseRef.current === "thinking" || phaseRef.current === "speaking") return;
        baseRef.current = textRef.current ? `${textRef.current} ` : "";
        setTimeout(start, 150);
      };
      recRef.current = rec;
      try {
        rec.start();
      } catch {
        /* already started */
      }
    };
    start();
  }, [close, finishTurn]);

  useEffect(() => {
    listenRef.current = listen;
  }, [listen]);

  // start listening on open, clean everything up on close
  useEffect(() => {
    activeRef.current = true;
    listen();
    return teardown;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Tapping the orb: interrupt the AI while it speaks, or send right now while you talk. */
  const onOrb = () => {
    if (phaseRef.current === "speaking") {
      speakerRef.current?.cancel(); // resolves speakAnswer(); then listen again
      setPhaseBoth("listening");
      listen();
    } else if (phaseRef.current === "hearing") {
      clearTimeout(timerRef.current);
      void finishTurn();
    }
  };

  return { phase, transcript, said, reply, tick, onOrb, close };
}
