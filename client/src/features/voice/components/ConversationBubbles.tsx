import { cn } from "@/shared/lib/utils";
import { stripMarkdown } from "@/shared/utils/format.utils";
import { SILENCE_MS } from "../constants/voice.constants";
import type { VoicePhase } from "../types/voice.types";

interface ConversationBubblesProps {
  phase: VoicePhase;
  transcript: string;
  said: string;
  reply: string;
  tick: number;
}

/** Your words (right) and the AI's answer (left), like ChatGPT voice. */
export default function ConversationBubbles({ phase, transcript, said, reply, tick }: ConversationBubblesProps) {
  const userText = phase === "listening" || phase === "hearing" ? transcript : said;

  return (
    <div className="mt-5 flex min-h-32 w-full max-w-md flex-col gap-3 px-1">
      {userText && (
        <div className="animate-fade-up flex flex-col items-end">
          <div className="btn-gradient max-w-[85%] rounded-2xl rounded-br-md px-4 py-2.5 text-[0.95rem] leading-relaxed text-white [overflow-wrap:anywhere]">
            {userText}
          </div>
          {phase === "hearing" && (
            <div className="mt-2 h-1 w-24 overflow-hidden rounded-full bg-line" title="Sends after 3 seconds of silence">
              <div key={tick} className="h-full origin-left rounded-full bg-brand" style={{ animation: `silence ${SILENCE_MS}ms linear forwards` }} />
            </div>
          )}
        </div>
      )}
      {phase !== "hearing" && (phase === "thinking" || reply) && (
        <div className="animate-fade-up flex justify-start">
          <div
            className={cn(
              "max-h-44 max-w-[90%] overflow-y-auto rounded-2xl rounded-bl-md border border-line bg-surface px-4 py-2.5 text-[0.95rem] leading-relaxed [overflow-wrap:anywhere]",
              phase === "listening" && "opacity-60",
            )}
          >
            {phase === "thinking" ? (
              <span className="flex gap-1.5 py-1.5" aria-label="Thinking">
                {[0, 150, 300].map((d) => (
                  <span key={d} style={{ animationDelay: `${d}ms` }} className="size-2 animate-bounce rounded-full bg-muted" />
                ))}
              </span>
            ) : (
              stripMarkdown(reply)
            )}
          </div>
        </div>
      )}
    </div>
  );
}
