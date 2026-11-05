import { useState } from "react";
import toast from "react-hot-toast";
import { AudioLines, Languages, PhoneOff } from "lucide-react";
import { useEscapeKey } from "@/shared/hooks/UseEscapeKey";
import { usePreferencesStore } from "@/store/preferencesStore";
import { FALLBACK_VOICE, PHASE_TEXT } from "../constants/voice.constants";
import { useVoiceConversation } from "../hooks/UseVoiceConversation";
import { useVoicesQuery } from "../hooks/UseVoicesQuery";
import ConversationBubbles from "./ConversationBubbles";
import VoiceOrb from "./VoiceOrb";
import VoicePicker from "./VoicePicker";

interface VoiceModeProps {
  modelName: string;
  cost: number;
  onSend: (text: string) => Promise<string | null>;
  onStopRequest: () => void;
  onClose: () => void;
}

/**
 * Full-screen hands-free voice conversation. Turns are normal chat messages,
 * so they appear in the history and use credits.
 */
export default function VoiceMode({ modelName, cost, onSend, onStopRequest, onClose }: VoiceModeProps) {
  const lang = usePreferencesStore((s) => s.voiceLang);
  const voiceId = usePreferencesStore((s) => s.voiceId);
  const toggleVoiceLangPref = usePreferencesStore((s) => s.toggleVoiceLang);
  const voices = useVoicesQuery();
  const [pickerOpen, setPickerOpen] = useState(false);

  const { phase, transcript, said, reply, tick, onOrb, close } = useVoiceConversation({
    lang,
    voice: voiceId,
    onSend,
    onStopRequest,
    onClose,
  });
  useEscapeKey(close);

  const toggleVoiceLang = () => {
    const next = toggleVoiceLangPref();
    toast(next === "hi-IN" ? "Voice language: हिन्दी" : "Voice language: English (India)", { icon: "🎙️" });
  };

  return (
    <div role="dialog" aria-modal="true" aria-label="Voice conversation" className="fixed inset-0 z-50 flex flex-col items-center bg-bg/95 px-6 backdrop-blur-xl">
      <div className="mt-6 flex w-full max-w-md items-center justify-between text-xs text-muted">
        <span className="rounded-full border border-line px-3 py-1">
          {modelName} · {cost} credit{cost > 1 ? "s" : ""} / turn
        </span>
        <div className="flex items-center gap-2">
          <button onClick={() => setPickerOpen(true)} className="flex cursor-pointer items-center gap-1.5 rounded-full border border-line px-3 py-1 hover:text-fg" aria-label="Choose AI voice">
            <AudioLines size={13} /> {voices.find((v) => v.id === voiceId)?.name || FALLBACK_VOICE.name}
          </button>
          <button onClick={toggleVoiceLang} className="flex cursor-pointer items-center gap-1.5 rounded-full border border-line px-3 py-1 hover:text-fg" aria-label="Switch voice language">
            <Languages size={13} /> {lang === "hi-IN" ? "हिन्दी" : "EN"}
          </button>
        </div>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center">
        <VoiceOrb phase={phase} onClick={onOrb} />
        <p className="mt-6 text-lg font-medium" aria-live="polite">
          {PHASE_TEXT[phase]}
        </p>
        <ConversationBubbles phase={phase} transcript={transcript} said={said} reply={reply} tick={tick} />
      </div>

      {pickerOpen && <VoicePicker lang={lang} onClose={() => setPickerOpen(false)} />}
      <p className="mb-4 text-xs text-muted">Pause for 3 seconds and I'll answer · tap the orb to send now / interrupt</p>
      <button
        onClick={close}
        aria-label="End voice conversation"
        className="mb-8 grid size-14 cursor-pointer place-items-center rounded-full bg-red-500 text-white shadow-lg shadow-red-500/30 transition hover:bg-red-600 active:scale-95"
      >
        <PhoneOff size={22} />
      </button>
    </div>
  );
}
