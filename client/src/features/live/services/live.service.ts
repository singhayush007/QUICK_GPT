import { api } from "@/shared/api/api";
import { API_PATHS } from "@/shared/constants/apiPaths.constants";
import type { AqiResponse, LivePlace, MarketsResponse, ScoresResponse, Sport, WeatherResponse } from "../types/live.types";

export const liveService = {
  weather: (place: LivePlace) => api.get<WeatherResponse>(API_PATHS.live.weather, { params: place }),
  airQuality: (place: LivePlace) => api.get<AqiResponse>(API_PATHS.live.aqi, { params: place }),
  markets: () => api.get<MarketsResponse>(API_PATHS.live.markets),
  scores: (sport: Sport) => api.get<ScoresResponse>(API_PATHS.live.scores, { params: { sport } }),
};
