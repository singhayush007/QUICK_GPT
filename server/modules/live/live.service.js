import { getWeather, getWeatherForecast } from "./providers/weather.provider.js";
import { getAirQuality } from "./providers/airQuality.provider.js";
import { getMarkets } from "./providers/markets.provider.js";
import {
  SPORTS,
  getBasketballScores,
  getCricketScores,
  getFootballScores,
} from "./providers/sports.provider.js";
import { detectRealTimeIntent, extractCity, summariseMatches } from "./intent.util.js";

/** Current weather + forecast for the Live page. */
export const weatherForecast = (query) => getWeatherForecast(query);

/** US-AQI + pollutants for the Live page. */
export const airQuality = (query) => getAirQuality(query);

/** Indices, currencies and crypto for the Live page. */
export const markets = () => getMarkets();

/**
 * Scores for a sport, or null when the sport is unknown.
 * @param {string} sport cricket | football | basketball
 */
export async function scores(sport) {
  const load = SPORTS[sport];
  if (!load) return null;
  return { matches: await load(), updatedAt: new Date().toISOString() };
}

const liveBlock = (label, data) =>
  `[LIVE DATA — ${label}, fetched just now: ${JSON.stringify(data)}]`;

/** Appends live weather / AQI / markets / scores to the prompt when it needs them. */
export async function enrichWithRealTimeData(prompt) {
  const intent = detectRealTimeIntent(prompt);
  const city = () => extractCity(prompt);
  const jobs = [];
  if (intent.weather) jobs.push(getWeather(city()).then((d) => liveBlock("weather", d)));
  if (intent.aqi) jobs.push(getAirQuality({ city: city() }).then((d) => liveBlock("air quality (US AQI)", d)));
  if (intent.markets)
    jobs.push(getMarkets().then((d) => liveBlock("markets (INR)", { marketStatus: d.market.label, indices: d.indices, currencies: d.currencies, crypto: d.crypto })));
  if (intent.cricket) jobs.push(getCricketScores().then((d) => liveBlock("cricket scores", summariseMatches(d))));
  if (intent.football) jobs.push(getFootballScores().then((d) => liveBlock("football scores", summariseMatches(d))));
  if (intent.basketball) jobs.push(getBasketballScores().then((d) => liveBlock("NBA scores", summariseMatches(d))));

  // one failing provider must never block the chat — just skip its block
  const settled = await Promise.allSettled(jobs);
  const blocks = settled.flatMap((r) => {
    if (r.status === "fulfilled") return [r.value];
    console.warn("Real-time data fetch failed:", r.reason?.message);
    return [];
  });
  return blocks.length ? `${prompt}\n\n${blocks.join("\n")}` : prompt;
}
