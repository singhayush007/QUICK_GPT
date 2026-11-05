import { ExternalLink } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import type { Match } from "../types/live.types";

const startTime = (iso: string) =>
  new Date(iso).toLocaleString("en-IN", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

export default function MatchCard({ match: m }: { match: Match }) {
  const live = m.state === "in";
  return (
    <div className={cn("min-w-0 rounded-2xl border bg-surface p-4 transition hover:shadow-lg", live ? "border-red-500/40 shadow-red-500/5" : "border-line")}>
      <div className="mb-3 flex items-center justify-between gap-2">
        {live ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 px-2.5 py-0.5 text-[11px] font-bold tracking-wide text-red-500">
            <span className="size-1.5 animate-pulse rounded-full bg-red-500" /> LIVE
          </span>
        ) : (
          <span className="text-[11px] font-semibold uppercase tracking-wide text-muted">{m.state === "pre" ? "Upcoming" : "Final"}</span>
        )}
        {m.link && (
          <a href={m.link} target="_blank" rel="noreferrer" aria-label="Open scorecard" className="text-muted hover:text-brand">
            <ExternalLink size={14} />
          </a>
        )}
      </div>
      <ul className="space-y-2.5">
        {m.teams.map((t) => {
          // long cricket scores ("268 & 191/7 (41 ov, target 342)") get their own line
          const long = String(t.score).length > 14;
          return (
            <li key={t.name}>
              <div className="flex items-center justify-between gap-3">
                <span className="flex min-w-0 items-center gap-2.5">
                  {t.logo ? (
                    <img src={t.logo} alt="" className="size-6 shrink-0 object-contain" loading="lazy" />
                  ) : (
                    <span className="grid size-6 shrink-0 place-items-center rounded-full bg-surface-2 text-[10px] font-bold">{t.abbr?.slice(0, 2)}</span>
                  )}
                  <span className={cn("truncate text-sm", t.winner ? "font-semibold" : m.state === "post" ? "text-muted" : "font-medium")}>{t.name}</span>
                </span>
                {!long && m.state !== "pre" && <span className={cn("shrink-0 text-sm tabular-nums", t.winner ? "font-bold" : "font-medium")}>{t.score}</span>}
              </div>
              {long && m.state !== "pre" && <p className={cn("mt-0.5 pl-[34px] text-xs tabular-nums", t.winner ? "font-bold" : "text-muted")}>{t.score}</p>}
            </li>
          );
        })}
      </ul>
      <p className="mt-3 border-t border-line pt-2.5 text-xs text-muted">
        {m.state === "pre" ? startTime(m.date) : m.summary || m.status}
        {m.venue && <span className="block truncate">{m.venue}</span>}
      </p>
    </div>
  );
}
