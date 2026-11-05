import { Mic, Volume2 } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { ORB_CLASSES, PHASE_TEXT } from "../constants/voice.constants";
import type { VoicePhase } from "../types/voice.types";

interface VoiceOrbProps {
  phase: VoicePhase;
  onClick: () => void;
}

/** The big pulsing orb: tap to interrupt the AI or to send right away. */
export default function VoiceOrb({ phase, onClick }: VoiceOrbProps) {
  const active = phase === "hearing" || phase === "speaking";
  return (
    <button onClick={onClick} aria-label={PHASE_TEXT[phase]} className="relative grid size-56 cursor-pointer place-items-center rounded-full outline-none">
      <span
        className={cn(
          "absolute inset-0 rounded-full bg-gradient-to-br from-violet-500/30 to-blue-500/30 blur-2xl transition-transform duration-500",
          active && "scale-125",
        )}
      />
      <span className={cn("absolute inset-6 rounded-full border border-brand/30", active && "animate-ping")} />
      <span className={cn("btn-gradient relative grid size-36 place-items-center rounded-full text-white transition-transform duration-300", ORB_CLASSES[phase])}>
        {phase === "speaking" ? <Volume2 size={42} /> : <Mic size={42} />}
      </span>
    </button>
  );
}
