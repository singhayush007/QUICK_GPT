import { cn } from "@/shared/lib/utils";

interface CreditsHeroProps {
  credits: number;
  isPro: boolean;
}

export default function CreditsHero({ credits, isPro }: CreditsHeroProps) {
  return (
    <div className="text-center">
      <h2 className="text-3xl font-semibold tracking-tight md:text-5xl">
        Simple, <span className="gradient-text whitespace-nowrap">pay-as-you-go</span> pricing
      </h2>
      <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-sm">
        <span className="rounded-full border border-line bg-surface px-4 py-1.5">
          <b>{credits}</b> <span className="text-muted">credits left</span>
        </span>
        <span className={cn("rounded-full border px-4 py-1.5 font-medium", isPro ? "border-amber-500/40 bg-amber-500/10 text-amber-500" : "border-line bg-surface text-muted")}>
          {isPro ? "★ Pro unlocked" : "Free plan"}
        </span>
      </div>
    </div>
  );
}
