import { liveService } from "../services/live.service";
import { REFRESH_MS } from "../constants/live.constants";
import type { LivePlace, Sport } from "../types/live.types";
import { useLiveQuery } from "./UseLiveQuery";

export const useWeatherQuery = (place: LivePlace, enabled: boolean) =>
  useLiveQuery(["weather", place], () => liveService.weather(place), (r) => r.weather, { enabled, refreshMs: REFRESH_MS.weather });

export const useAirQualityQuery = (place: LivePlace, enabled: boolean) =>
  useLiveQuery(["aqi", place], () => liveService.airQuality(place), (r) => r.aqi, { enabled, refreshMs: REFRESH_MS.aqi });

export const useMarketsQuery = (enabled: boolean) =>
  useLiveQuery(["markets"], () => liveService.markets(), (r) => r.markets, { enabled, refreshMs: REFRESH_MS.markets });

export const useScoresQuery = (sport: Sport, enabled: boolean) =>
  useLiveQuery(["scores", sport], () => liveService.scores(sport), (r) => r.matches, { enabled, refreshMs: REFRESH_MS.scores });
