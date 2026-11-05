import { cn } from "@/shared/lib/utils";
import { LOW_CREDITS, MAX_CREDITS_BAR } from "../constants/sidebar.constants";

export default function CreditsMeter({ credits }: { credits: number }) {
  const pct = Math.min(100, (credits / MAX_CREDITS_BAR) * 100);
  return (
    <div className="mt-2 rounded-xl border border-line bg-surface-2/60 p-3">
      <div className="flex items-baseline justify-between text-xs">
        <span className="text-muted">Credits</span>
        <span className="text-sm font-semibold">{credits}</span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-line">
        <div className={cn("h-full rounded-full transition-all", credits < LOW_CREDITS ? "bg-red-500" : "btn-gradient")} style={{ width: `${Math.max(pct, 3)}%` }} />
      </div>
    </div>
  );
}
