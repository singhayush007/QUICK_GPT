import type { ApiResponse } from "@/shared/types";

export type WeatherKind = "clear" | "partly" | "cloudy" | "fog" | "drizzle" | "rain" | "snow" | "thunder";

export interface WeatherCurrent {
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  isDay: boolean;
  condition: string;
  kind: WeatherKind;
}
export interface WeatherDay {
  date: string;
  max: number;
  min: number;
  rainChance: number;
  condition: string;
  kind: WeatherKind;
}
export interface Weather {
  location: string;
  region: string;
  country: string;
  current: WeatherCurrent;
  daily: WeatherDay[];
  updatedAt: string;
}

export type AqiTone = "good" | "moderate" | "sensitive" | "unhealthy" | "very" | "hazardous";
export interface AirQuality {
  location: string;
  region: string;
  country: string;
  aqi: number;
  label: string;
  tone: AqiTone;
  advice: string;
  pollutants: Array<{ key: string; name: string; value: number | null; unit: string }>;
  updatedAt: string;
}

export interface MarketQuote {
  id: string;
  name: string;
  price: number | null;
  change: number | null;
  percent: number | null;
  open?: number | null;
  high?: number | null;
  low?: number | null;
  prevClose?: number | null;
  unit?: string;
}
export interface Markets {
  indices: MarketQuote[];
  currencies: MarketQuote[];
  crypto: MarketQuote[];
  market: { open: boolean; label: string };
  updatedAt: string;
}

export type Sport = "cricket" | "football" | "basketball";
export type MatchState = "pre" | "in" | "post";
export interface MatchTeam {
  name: string;
  abbr?: string;
  logo?: string;
  score: string;
  winner: boolean;
}
export interface Match {
  id: string;
  league: string;
  name: string;
  date: string;
  state: MatchState;
  status: string;
  summary: string;
  venue: string;
  link: string;
  teams: MatchTeam[];
}

/** A city by name, or by coordinates (browser geolocation). */
export interface LivePlace {
  city?: string;
  lat?: number;
  lon?: number;
}
/** What the city picker remembers. */
export interface SelectedCity {
  name: string;
  lat?: number;
  lon?: number;
}

export type WeatherResponse = ApiResponse<{ weather: Weather }>;
export type AqiResponse = ApiResponse<{ aqi: AirQuality }>;
export type MarketsResponse = ApiResponse<{ markets: Markets }>;
export type ScoresResponse = ApiResponse<{ matches: Match[]; updatedAt: string }>;

/** What every panel receives from its query hook. */
export interface LiveResult<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
  refreshing: boolean;
  updatedAt: Date | null;
  refresh: () => void;
}
