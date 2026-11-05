import { Image as ImageIcon, Sparkles, Zap } from "lucide-react";
import { IMAGE_CREDIT_COST, PRO_REPLY_COST } from "../constants/credits.constants";

/** How credits are spent: free models, the Pro model, images. */
export default function UsageCards({ isPro }: { isPro: boolean }) {
  const cards = [
    { icon: Zap, title: "Lite & Flash", text: "1 credit / reply", tag: "FREE", tone: "text-emerald-500" },
    { icon: Sparkles, title: "Pro model", text: `${PRO_REPLY_COST} credits / reply`, tag: isPro ? "UNLOCKED" : "PAID", tone: "text-amber-500" },
    { icon: ImageIcon, title: "Image", text: `${IMAGE_CREDIT_COST} credits / image`, tag: "", tone: "text-brand" },
  ];

  return (
    <div className="mx-auto mt-8 grid max-w-md gap-3 xl:max-w-3xl xl:grid-cols-3">
      {cards.map((c) => (
        <div key={c.title} className="flex items-center gap-3 rounded-2xl border border-line bg-surface px-4 py-3">
          <c.icon size={18} className={`shrink-0 ${c.tone}`} />
          <div className="min-w-0">
            <p className="flex items-center gap-2 text-sm font-medium">
              {c.title}
              {c.tag && (
                <span className={`rounded px-1.5 py-px text-[9px] font-bold tracking-wide ${c.tone} bg-current/10`}>
                  <span className={c.tone}>{c.tag}</span>
                </span>
              )}
            </p>
            <p className="text-xs text-muted">{c.text}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
