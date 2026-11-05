import { HeartPulse, MapPin } from "lucide-react";
import { Card, ErrorState, Skeleton } from "@/shared/components/ui";
import type { AirQuality, AqiTone, LiveResult } from "../types/live.types";
import AskAiButton from "./AskAiButton";
import RefreshBar from "./RefreshBar";

/** [hex color, text color class] per AQI category. */
const TONES: Record<AqiTone, [string, string]> = {
  good: ["#22c55e", "text-green-500"],
  moderate: ["#eab308", "text-yellow-500"],
  sensitive: ["#f97316", "text-orange-500"],
  unhealthy: ["#ef4444", "text-red-500"],
  very: ["#a855f7", "text-purple-500"],
  hazardous: ["#9f1239", "text-rose-700"],
};

const SCALE_GRADIENT = "linear-gradient(90deg,#22c55e 0%,#eab308 17%,#f97316 33%,#ef4444 50%,#a855f7 67%,#9f1239 100%)";

interface AqiPanelProps {
  live: LiveResult<AirQuality>;
  cityName: string;
}

export default function AqiPanel({ live, cityName }: AqiPanelProps) {
  const { data: a, error, loading, refreshing, updatedAt, refresh } = live;
  if (loading)
    return (
      <div className="space-y-4">
        <Skeleton className="h-60" />
        <Skeleton className="h-32" />
      </div>
    );
  if (error || !a) return <ErrorState message={error ?? "Air quality is unavailable"} onRetry={refresh} />;
  const [color, text] = TONES[a.tone] ?? TONES.good;
  const pos = Math.min(100, (a.aqi / 300) * 100);

  return (
    <>
      <RefreshBar updatedAt={updatedAt} refreshing={refreshing} onRefresh={refresh} />
      <Card>
        <p className="flex items-center gap-1.5 text-sm text-muted">
          <MapPin size={14} /> {a.location}
          {a.region && `, ${a.region}`}
          {a.country && ` · ${a.country}`}
        </p>
        <div className="mt-4 flex flex-wrap items-end gap-x-6 gap-y-2">
          <p className="text-7xl font-semibold leading-none tracking-tighter md:text-8xl" style={{ color }}>
            {a.aqi}
          </p>
          <div className="pb-1">
            <p className={`text-xl font-semibold ${text}`}>{a.label}</p>
            <p className="text-xs text-muted">US AQI · lower is better</p>
          </div>
        </div>

        {/* scale */}
        <div className="relative mt-7">
          <div className="h-2.5 rounded-full" style={{ background: SCALE_GRADIENT }} />
          <span className="absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-white shadow-lg" style={{ left: `${pos}%`, background: color }} />
          <div className="mt-1.5 flex justify-between text-[10px] text-muted">
            <span>0</span>
            <span>100</span>
            <span>200</span>
            <span>300+</span>
          </div>
        </div>

        <p className="mt-5 flex gap-2.5 rounded-2xl bg-surface-2/70 p-3.5 text-sm">
          <HeartPulse size={17} className={`mt-0.5 shrink-0 ${text}`} /> {a.advice}
        </p>
      </Card>

      <h3 className="mb-3 mt-8 text-sm font-semibold">Pollutants</h3>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {a.pollutants.map((p) => (
          <div key={p.key} className="rounded-2xl border border-line bg-surface p-4">
            <p className="text-xs text-muted">{p.name}</p>
            <p className="mt-1 text-xl font-semibold">
              {p.value ?? "—"}
              <span className="ml-1 text-xs font-normal text-muted">{p.unit}</span>
            </p>
          </div>
        ))}
      </div>
      <div className="mt-6">
        <AskAiButton prompt={`What's the air quality in ${cityName} right now? Is it safe to go for a run?`} />
      </div>
    </>
  );
}
