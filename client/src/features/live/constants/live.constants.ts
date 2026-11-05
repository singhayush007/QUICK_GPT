import { CloudSun, Dumbbell, LineChart, Trophy, Wind, type LucideIcon } from "lucide-react";
import type { MatchState, Sport } from "../types/live.types";

export type LiveTabId = "weather" | "aqi" | "markets" | Sport;

export const LIVE_TABS: ReadonlyArray<{ id: LiveTabId; label: string; icon: LucideIcon; city?: boolean }> = [
  { id: "weather", label: "Weather", icon: CloudSun, city: true },
  { id: "aqi", label: "Air quality", icon: Wind, city: true },
  { id: "markets", label: "Markets", icon: LineChart },
  { id: "cricket", label: "Cricket", icon: Trophy },
  { id: "football", label: "Football", icon: Trophy },
  { id: "basketball", label: "NBA", icon: Dumbbell },
];

export const SPORT_TABS: readonly LiveTabId[] = ["cricket", "football", "basketball"];

export const QUICK_CITIES = ["Delhi", "Mumbai", "Bengaluru", "Kolkata", "Chennai", "Hyderabad", "London", "New York"] as const;
export const DEFAULT_CITY = "Mumbai";
export const DEFAULT_TAB: LiveTabId = "markets";

/** Auto-refresh intervals (ms). Polling pauses while the browser tab is hidden. */
export const REFRESH_MS = { weather: 10 * 60_000, aqi: 15 * 60_000, markets: 30_000, scores: 30_000 } as const;

export const SCORE_FILTERS: ReadonlyArray<{ id: "all" | MatchState; label: string }> = [
  { id: "all", label: "All" },
  { id: "in", label: "Live" },
  { id: "pre", label: "Upcoming" },
  { id: "post", label: "Results" },
];
