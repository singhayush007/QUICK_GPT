import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { ErrorState, Skeleton } from "@/shared/components/ui";
import { cn } from "@/shared/lib/utils";
import { inr } from "@/shared/utils/format.utils";
import type { LiveResult, MarketQuote, Markets } from "../types/live.types";
import AskAiButton from "./AskAiButton";
import RefreshBar from "./RefreshBar";

function Change({ change, percent, className }: { change: number | null; percent: number | null; className?: string }) {
  if (percent == null && change == null) return <span className="text-xs text-muted">—</span>;
  const value = percent ?? change ?? 0;
  const flat = value === 0;
  const up = value > 0;
  const Icon = flat ? Minus : up ? ArrowUpRight : ArrowDownRight;
  return (
    <span className={cn("inline-flex items-center gap-0.5 text-sm font-medium", flat ? "text-muted" : up ? "text-emerald-500" : "text-red-500", className)}>
      <Icon size={15} />
      {change != null && `${change > 0 ? "+" : ""}${inr(change)} `}
      {percent != null && `(${percent > 0 ? "+" : ""}${percent.toFixed(2)}%)`}
    </span>
  );
}

function IndexCard({ q, headline = false }: { q: MarketQuote; headline?: boolean }) {
  const { price, high, low } = q;
  const range = price != null && high != null && low != null && high > low ? ((price - low) / (high - low)) * 100 : null;
  const isVix = q.id === "INDIA VIX";
  return (
    <div className={cn("rounded-2xl border border-line bg-surface p-4", headline && "md:p-5")}>
      <p className="text-xs font-medium text-muted">{q.name}</p>
      <p className={cn("mt-1.5 font-semibold tracking-tight", headline ? "text-3xl" : "text-2xl")}>{inr(q.price)}</p>
      {/* VIX up = fear, so don't paint it green */}
      <Change change={q.change} percent={q.percent} className={isVix ? "[&]:text-muted" : undefined} />
      {range != null && (
        <div className="mt-3">
          <div className="relative h-1.5 rounded-full bg-surface-2">
            <span className="absolute top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand" style={{ left: `${Math.min(100, Math.max(0, range))}%` }} />
          </div>
          <div className="mt-1 flex justify-between text-[10px] text-muted">
            <span>L {inr(low, 0)}</span>
            <span>H {inr(high, 0)}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function QuoteRow({ q, prefix }: { q: MarketQuote; prefix: string }) {
  return (
    <li className="flex items-center justify-between px-4 py-3">
      <span className="text-sm font-medium">{q.name}</span>
      <span className="text-right">
        <span className="block text-sm font-semibold">
          {prefix}
          {inr(q.price, (q.price ?? 0) > 1000 ? 0 : 2)}
        </span>
        {q.percent != null && <Change change={null} percent={q.percent} className="!text-xs" />}
      </span>
    </li>
  );
}

function QuoteList({ title, items, prefix }: { title: string; items: MarketQuote[]; prefix: string }) {
  if (!items?.length) return null;
  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold">{title}</h3>
      <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
        {items.map((q) => (
          <QuoteRow key={q.id} q={q} prefix={prefix} />
        ))}
      </ul>
    </div>
  );
}

export default function MarketsPanel({ live }: { live: LiveResult<Markets> }) {
  const { data: m, error, loading, refreshing, updatedAt, refresh } = live;
  if (loading)
    return (
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-36" />
        ))}
      </div>
    );
  if (error || !m) return <ErrorState message={error ?? "Market data is unavailable"} onRetry={refresh} />;
  const [nifty, sensex, ...rest] = m.indices;

  return (
    <>
      <RefreshBar updatedAt={updatedAt} refreshing={refreshing} onRefresh={refresh}>
        <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-medium", m.market.open ? "border-emerald-500/30 text-emerald-500" : "border-line")}>
          <span className={cn("size-1.5 rounded-full", m.market.open ? "animate-pulse bg-emerald-500" : "bg-muted")} /> {m.market.label}
        </span>
      </RefreshBar>

      {m.indices.length > 0 && (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            {nifty && <IndexCard q={nifty} headline />}
            {sensex && <IndexCard q={sensex} headline />}
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {rest.map((q) => (
              <IndexCard key={q.id} q={q} />
            ))}
          </div>
        </>
      )}

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <QuoteList title="Currencies (in ₹)" items={m.currencies} prefix="₹" />
        <QuoteList title="Crypto (24h change)" items={m.crypto} prefix="₹" />
      </div>

      <p className="mt-6 text-[11px] text-muted">Data from NSE, Moneycontrol, CoinGecko & exchange-rate APIs; may be delayed. Not financial advice.</p>
      <div className="mt-4">
        <AskAiButton prompt="Give me a quick summary of how Nifty and Sensex are doing today and what is driving the market." />
      </div>
    </>
  );
}
