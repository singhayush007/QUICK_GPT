import { useMemo, useState } from "react";
import { Trophy } from "lucide-react";
import { Card, ErrorState, Skeleton } from "@/shared/components/ui";
import { cn } from "@/shared/lib/utils";
import { SCORE_FILTERS } from "../constants/live.constants";
import type { LiveResult, Match, MatchState } from "../types/live.types";
import AskAiButton from "./AskAiButton";
import MatchCard from "./MatchCard";
import RefreshBar from "./RefreshBar";

interface ScoresPanelProps {
  live: LiveResult<Match[]>;
  sportLabel: string;
}

export default function ScoresPanel({ live, sportLabel }: ScoresPanelProps) {
  const { data: matches, error, loading, refreshing, updatedAt, refresh } = live;
  const [filter, setFilter] = useState<"all" | MatchState>("all");

  const groups = useMemo(() => {
    const list = (matches ?? []).filter((m) => filter === "all" || m.state === filter);
    const map = new Map<string, Match[]>();
    list.forEach((m) => map.set(m.league, [...(map.get(m.league) ?? []), m]));
    return [...map.entries()];
  }, [matches, filter]);

  if (loading)
    return (
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-40" />
        ))}
      </div>
    );
  if (error || !matches) return <ErrorState message={error ?? "Scores are unavailable"} onRetry={refresh} />;

  const liveCount = matches.filter((m) => m.state === "in").length;
  const filterLabel = SCORE_FILTERS.find((f) => f.id === filter)?.label.toLowerCase();

  return (
    <>
      <RefreshBar updatedAt={updatedAt} refreshing={refreshing} onRefresh={refresh}>
        <span>{liveCount} live · auto-refreshes every 30s</span>
      </RefreshBar>
      <div className="mb-5 flex gap-2 overflow-x-auto">
        {SCORE_FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            aria-pressed={filter === f.id}
            className={cn(
              "shrink-0 cursor-pointer rounded-full px-4 py-1.5 text-xs font-medium transition",
              filter === f.id ? "btn-gradient text-white" : "border border-line text-muted hover:text-fg",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {groups.length === 0 ? (
        <Card className="grid place-items-center py-14 text-center">
          <Trophy size={30} className="text-muted" />
          <p className="mt-3 text-sm text-muted">No {filter === "all" ? "" : `${filterLabel} `}matches right now.</p>
        </Card>
      ) : (
        <div className="space-y-8">
          {groups.map(([league, list]) => (
            <section key={league}>
              <h3 className="mb-3 text-sm font-semibold">{league}</h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {list.map((m) => (
                  <MatchCard key={m.id} match={m} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
      <div className="mt-8">
        <AskAiButton prompt={`Give me a summary of today's ${sportLabel} matches and the live scores.`} />
      </div>
    </>
  );
}
