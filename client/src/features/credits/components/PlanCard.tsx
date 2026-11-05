import { Check, Gem, Image as ImageIcon, Loader2, MessageSquare, Sparkles } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { PRO_REPLY_COST } from "../constants/credits.constants";
import type { CreditPlan } from "../types/credits.types";

interface PlanCardProps {
  plan: CreditPlan;
  popular: boolean;
  buying: boolean;
  /** Another plan is being purchased: disable every button. */
  disabled: boolean;
  onBuy: () => void;
}

export default function PlanCard({ plan, popular, buying, disabled, onBuy }: PlanCardProps) {
  const worth = [
    { n: plan.credits, label: "Flash replies", icon: MessageSquare },
    { n: Math.floor(plan.credits / PRO_REPLY_COST), label: "Pro replies", icon: Sparkles },
    { n: Math.floor(plan.credits / 2), label: "Images", icon: ImageIcon },
  ];

  return (
    <div
      className={cn(
        "relative flex flex-col rounded-3xl border p-6 transition xl:p-7",
        popular ? "border-brand bg-surface shadow-2xl shadow-brand/20 ring-1 ring-brand/40 max-xl:order-first" : "border-line bg-surface hover:border-brand/40 hover:shadow-xl",
      )}
    >
      {popular && (
        <span className="btn-gradient absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold text-white">Most popular</span>
      )}
      <div className="flex items-center gap-2">
        <Gem size={18} className="text-brand" />
        <h3 className="text-lg font-semibold">{plan.name}</h3>
      </div>

      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-4xl font-semibold tracking-tight md:text-5xl">₹{plan.price}</span>
        <span className="text-sm text-muted">one-time</span>
      </div>
      <p className="mt-1 text-sm text-muted">
        <b className="text-fg">{plan.credits}</b> credits · ₹{(plan.price / plan.credits).toFixed(2)} each
      </p>

      {/* what the credits are worth */}
      <div className="mt-5 grid grid-cols-3 divide-x divide-line rounded-2xl bg-surface-2/60 py-3 text-center">
        {worth.map((x) => (
          <div key={x.label} className="px-1">
            <p className="text-lg font-semibold leading-none">{x.n.toLocaleString("en-IN")}</p>
            <p className="mt-1.5 text-[10px] leading-tight text-muted">{x.label}</p>
          </div>
        ))}
      </div>

      <ul className="mt-5 flex-1 space-y-2.5 text-sm">
        {plan.features.map((f) => (
          <li key={f} className="flex gap-2.5">
            <Check size={16} className="mt-0.5 shrink-0 text-emerald-500" />
            <span className="min-w-0">{f}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={onBuy}
        disabled={disabled}
        className={cn(
          "mt-7 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border py-3 text-sm font-semibold transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60",
          popular ? "btn-gradient border-transparent text-white" : "border-line hover:bg-surface-2",
        )}
      >
        {buying && <Loader2 size={15} className="animate-spin" />}
        Buy {plan.name}
      </button>
    </div>
  );
}
