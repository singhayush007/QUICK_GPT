import * as liveService from "./live.service.js";
import { AppError } from "../../shared/utils/httpErrors.js";
import { MAX_CITY_LENGTH } from "../../shared/constants/limits.js";

// "Couldn't find a place…" (404) is shown as is; everything else is a generic 502
const fail = (res, error, fallback) =>
  error instanceof AppError
    ? res.status(error.status).json({ success: false, message: error.message })
    : res.status(502).json({ success: false, message: fallback });

/** Reads `?city=` (trimmed, capped) and `?lat=&lon=` from the query string. */
const parseLocation = (query) => {
  const city = String(query.city || "").trim().slice(0, MAX_CITY_LENGTH);
  const lat = parseFloat(query.lat);
  const lon = parseFloat(query.lon);
  return { city, lat, lon, hasCoords: Number.isFinite(lat) && Number.isFinite(lon) };
};

// GET /api/live/weather?city=Mumbai   or   ?lat=19.07&lon=72.87
export const liveWeather = async (req, res) => {
  const { city, lat, lon, hasCoords } = parseLocation(req.query);
  if (!city && !hasCoords) {
    return res.status(400).json({ success: false, message: "Provide a city or lat/lon" });
  }
  try {
    const weather = await liveService.weatherForecast({ city, lat, lon });
    res.json({ success: true, weather });
  } catch (error) {
    console.error("Weather error:", error.message);
    fail(res, error, "Weather service is unavailable right now");
  }
};

// GET /api/live/aqi?city=Delhi   or   ?lat=..&lon=..
export const liveAqi = async (req, res) => {
  const { city, lat, lon, hasCoords } = parseLocation(req.query);
  if (!city && !hasCoords) {
    return res.status(400).json({ success: false, message: "Provide a city or lat/lon" });
  }
  try {
    res.json({ success: true, aqi: await liveService.airQuality({ city, lat, lon }) });
  } catch (error) {
    console.error("AQI error:", error.message);
    fail(res, error, "Air quality service is unavailable right now");
  }
};

// GET /api/live/markets
export const liveMarkets = async (req, res) => {
  try {
    res.json({ success: true, markets: await liveService.markets() });
  } catch (error) {
    console.error("Markets error:", error.message);
    fail(res, error, "Market data is unavailable right now");
  }
};

// GET /api/live/scores?sport=cricket|football|basketball
export const liveScores = async (req, res) => {
  try {
    const result = await liveService.scores(req.query.sport);
    if (!result) {
      return res.status(400).json({ success: false, message: "Unknown sport" });
    }
    res.json({ success: true, ...result });
  } catch (error) {
    console.error("Scores error:", error.message);
    fail(res, error, "Live scores are unavailable right now");
  }
};
