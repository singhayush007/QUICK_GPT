import { useEffect, useRef, useState, type MouseEvent } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Check, Loader2, Lock, Play, Square, X } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { useEscapeKey } from "@/shared/hooks/UseEscapeKey";
import { useAuthStore } from "@/store/authStore";
import { usePreferencesStore } from "@/store/preferencesStore";
import { FALLBACK_VOICE, VOICE_SECTIONS } from "../constants/voice.constants";
import { useVoicesQuery } from "../hooks/UseVoicesQuery";
import { previewVoice } from "@/shared/utils/speech.utils";
import type { SpeakController, VoiceInfo } from "@/shared/types/voice.types";

interface VoicePickerProps {
  lang: string;
  onClose: () => void;
}

/** Pick the voice the AI answers with. Every voice can be previewed, even locked ones. */
export default function VoicePicker({ lang, onClose }: VoicePickerProps) {
  const navigate = useNavigate();
  const voices = useVoicesQuery();
  const plan = useAuthStore((s) => s.user?.plan);
  const voiceId = usePreferencesStore((s) => s.voiceId);
  const setVoiceId = usePreferencesStore((s) => s.setVoiceId);

  const [playing, setPlaying] = useState<string | null>(null); // voice id being previewed
  const [loading, setLoading] = useState<string | null>(null);
  const playerRef = useRef<SpeakController | null>(null);

  // capture phase: the voice mode behind must not close as well
  useEscapeKey(onClose, true, { capture: true });

  const stop = () => {
    playerRef.current?.cancel();
    playerRef.current = null;
    setPlaying(null);
    setLoading(null);
  };

  useEffect(
    () => () => {
      playerRef.current?.cancel();
      window.speechSynthesis?.cancel();
    },
    [],
  );

  const preview = async (e: MouseEvent, v: VoiceInfo) => {
    e.stopPropagation();
    if (playing === v.id || loading === v.id) return stop();
    stop();
    setLoading(v.id);
    const player: SpeakController = previewVoice(v.id, lang, {
      // premium previews are generated on the server, so "loading" lasts until sound starts
      onStart: () => {
        if (playerRef.current !== player && playerRef.current) return;
        setLoading(null);
        setPlaying(v.id);
      },
    });
    playerRef.current = player;
    try {
      await player.done;
    } catch {
      if (playerRef.current === player) toast.error("Couldn't play the preview right now.");
    } finally {
      if (playerRef.current === player) {
        playerRef.current = null;
        setPlaying(null);
        setLoading(null);
      }
    }
  };

  const choose = (v: VoiceInfo) => {
    if (v.locked) {
      toast(`The ${v.name} voice is for paid users — unlock it with any credit plan.`, { icon: "🔒" });
      return navigate("/credits");
    }
    setVoiceId(v.id);
  };

  const list: VoiceInfo[] = voices.length ? voices : [FALLBACK_VOICE];

  return (
    <div className="fixed inset-0 z-[60] grid place-items-end bg-black/60 p-0 backdrop-blur-sm sm:place-items-center sm:p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Choose a voice"
        onClick={(e) => e.stopPropagation()}
        className="animate-pop flex max-h-[88vh] w-full max-w-md flex-col rounded-t-3xl border border-line bg-surface shadow-2xl sm:rounded-3xl"
      >
        <div className="flex items-center justify-between px-5 pb-2 pt-5">
          <div>
            <h3 className="text-lg font-semibold">Choose a voice</h3>
            <p className="text-xs text-muted">How QuickGPT sounds when it talks back</p>
          </div>
          <button onClick={onClose} aria-label="Close" className="cursor-pointer rounded-lg p-1.5 text-muted hover:bg-surface-2">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-5 overflow-y-auto px-5 pb-5 pt-2">
          {VOICE_SECTIONS.map((sec) => {
            const items = list.filter((v) => sec.match(v.gender, v.id));
            if (!items.length) return null;
            return (
              <section key={sec.title}>
                <h4 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted">{sec.title}</h4>
                <ul className="space-y-2">
                  {items.map((v) => {
                    const active = v.id === voiceId && !v.locked;
                    return (
                      <li key={v.id}>
                        <div
                          role="button"
                          tabIndex={0}
                          onClick={() => choose(v)}
                          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && choose(v)}
                          className={cn(
                            "flex cursor-pointer items-center gap-3 rounded-2xl border px-3.5 py-3 transition hover:bg-surface-2",
                            active ? "border-brand bg-brand/10" : "border-line",
                          )}
                        >
                          <button
                            onClick={(e) => preview(e, v)}
                            aria-label={playing === v.id ? `Stop ${v.name}` : `Preview ${v.name}`}
                            className="grid size-9 shrink-0 cursor-pointer place-items-center rounded-full bg-surface-2 text-brand transition hover:bg-brand hover:text-white"
                          >
                            {loading === v.id ? (
                              <Loader2 size={15} className="animate-spin" />
                            ) : playing === v.id ? (
                              <Square size={13} fill="currentColor" />
                            ) : (
                              <Play size={14} fill="currentColor" className="ml-0.5" />
                            )}
                          </button>
                          <span className="min-w-0 flex-1">
                            <span className="flex items-center gap-2 text-sm font-medium">
                              {v.name}
                              <span
                                className={cn(
                                  "rounded px-1.5 py-px text-[9px] font-bold tracking-wide",
                                  v.tier === "pro" ? "bg-amber-500/15 text-amber-500" : "bg-emerald-500/15 text-emerald-500",
                                )}
                              >
                                {v.tier === "pro" ? "PRO" : "FREE"}
                              </span>
                            </span>
                            <span className="block truncate text-xs text-muted">{v.desc}</span>
                          </span>
                          {v.locked ? <Lock size={15} className="shrink-0 text-amber-500" /> : active ? <Check size={17} className="shrink-0 text-brand" /> : null}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })}
          {plan !== "pro" && (
            <p className="rounded-xl bg-surface-2/70 p-3 text-xs text-muted">
              You can preview every voice. Buy any credit plan to unlock the <b className="text-amber-500">PRO</b> voices.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
