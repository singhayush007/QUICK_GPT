import { Droplets, MapPin, Thermometer, Wind, type LucideIcon } from "lucide-react";
import { Card, ErrorState, Skeleton } from "@/shared/components/ui";
import { cn } from "@/shared/lib/utils";
import type { LiveResult, Weather, WeatherKind } from "../types/live.types";
import AskAiButton from "./AskAiButton";
import RefreshBar from "./RefreshBar";
import WeatherIcon from "./WeatherIcon";

const GRADIENTS: Record<WeatherKind, string> = {
  clear: "from-amber-400/25 via-orange-400/10",
  partly: "from-sky-400/25 via-amber-300/10",
  cloudy: "from-slate-400/25 via-slate-500/10",
  fog: "from-slate-300/25 via-slate-400/10",
  drizzle: "from-sky-500/25 via-slate-400/10",
  rain: "from-blue-500/30 via-slate-500/10",
  snow: "from-cyan-200/30 via-sky-300/10",
  thunder: "from-violet-500/30 via-slate-600/10",
};

function Stat({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-surface-2/70 p-3">
      <p className="flex items-center gap-1.5 text-xs text-muted">
        <Icon size={13} /> {label}
      </p>
      <p className="mt-1 text-lg font-semibold">{value}</p>
    </div>
  );
}

const dayLabel = (iso: string, i: number) => (i === 0 ? "Today" : new Date(`${iso}T00:00:00`).toLocaleDateString("en-IN", { weekday: "short" }));

interface WeatherPanelProps {
  live: LiveResult<Weather>;
  cityName: string;
}

export default function WeatherPanel({ live, cityName }: WeatherPanelProps) {
  const { data: w, error, loading, refreshing, updatedAt, refresh } = live;
  if (loading)
    return (
      <div className="space-y-4">
        <Skeleton className="h-64" />
        <Skeleton className="h-36" />
      </div>
    );
  if (error || !w) return <ErrorState message={error ?? "Weather is unavailable"} onRetry={refresh} />;
  const c = w.current;

  return (
    <>
      <RefreshBar updatedAt={updatedAt} refreshing={refreshing} onRefresh={refresh} />
      <Card className={cn("relative overflow-hidden bg-gradient-to-br to-transparent", GRADIENTS[c.kind])}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="flex items-center gap-1.5 text-sm text-muted">
              <MapPin size={14} /> {w.location}
              {w.region && `, ${w.region}`}
              {w.country && ` · ${w.country}`}
            </p>
            <p className="mt-3 flex items-start text-7xl font-semibold tracking-tighter md:text-8xl">
              {c.temperature}
              <span className="mt-2 text-3xl font-medium text-muted md:text-4xl">°C</span>
            </p>
            <p className="mt-1 text-lg">{c.condition}</p>
            <p className="text-sm text-muted">Feels like {c.feelsLike}°C</p>
          </div>
          <WeatherIcon kind={c.kind} size={96} className="text-brand/80 max-sm:size-16" />
        </div>
        <div className="mt-6 grid grid-cols-3 gap-3">
          <Stat icon={Droplets} label="Humidity" value={`${c.humidity}%`} />
          <Stat icon={Wind} label="Wind" value={`${c.windSpeed} km/h`} />
          <Stat icon={Thermometer} label="Rain today" value={`${w.daily[0].rainChance}%`} />
        </div>
      </Card>

      <h3 className="mb-3 mt-8 text-sm font-semibold">5-day forecast</h3>
      <div className="grid grid-cols-5 gap-2 md:gap-3">
        {w.daily.map((d, i) => (
          <div key={d.date} className="rounded-2xl border border-line bg-surface p-2.5 text-center md:p-4">
            <p className="text-xs font-medium text-muted">{dayLabel(d.date, i)}</p>
            <WeatherIcon kind={d.kind} size={26} className="mx-auto my-2.5 text-brand" />
            <p className="text-sm font-semibold">{d.max}°</p>
            <p className="text-xs text-muted">{d.min}°</p>
            <p className="mt-1.5 text-[11px] text-sky-500">{d.rainChance}% rain</p>
          </div>
        ))}
      </div>
      <div className="mt-6">
        <AskAiButton prompt={`What's the weather in ${cityName} right now, and what should I wear today?`} />
      </div>
    </>
  );
}
