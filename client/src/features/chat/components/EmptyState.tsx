import { greeting } from "@/shared/utils/time.utils";
import { useAuthStore } from "@/store/authStore";
import { SUGGESTIONS, type Suggestion } from "../constants/chat.constants";

export default function EmptyState({ onPick }: { onPick: (suggestion: Suggestion) => void }) {
  const firstName = useAuthStore((s) => s.user?.name?.split(" ")[0]);

  return (
    <div className="animate-fade-up my-auto flex flex-col items-center py-4 text-center">
      <h2 className="text-3xl font-semibold tracking-tight sm:text-5xl">
        <span className="gradient-text">
          {greeting()}, {firstName}
        </span>
      </h2>
      <p className="mt-3 text-base text-muted sm:text-lg">How can I help you today?</p>
      <div className="mt-8 grid w-full max-w-2xl grid-cols-2 gap-2.5 sm:mt-10 sm:gap-3">
        {SUGGESTIONS.map((s) => (
          <button
            key={s.title}
            onClick={() => onPick(s)}
            className="group cursor-pointer rounded-2xl border border-line bg-surface p-3 text-left sm:p-4 transition hover:-translate-y-0.5 hover:border-brand/60 hover:shadow-lg hover:shadow-brand/10"
          >
            <s.icon size={18} className="text-brand" />
            <p className="mt-2 text-sm font-medium sm:mt-3">{s.title}</p>
            <p className="mt-1 line-clamp-2 text-xs text-muted max-sm:hidden">{s.prompt}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
