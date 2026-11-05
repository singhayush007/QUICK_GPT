import { http } from "./http.js";
import { cached } from "../../../shared/utils/cache.js";
import { AppError } from "../../../shared/utils/httpErrors.js";

/** Open-Meteo (weather + geocoding) — free and key-less. */
const GEOCODE_TTL_MS = 24 * 3600e3;
const WEATHER_TTL_MS = 10 * 60e3;
const FORECAST_DAYS = 5;

// WMO weather codes -> label + a "kind" the UI maps to an icon
const WMO = (code) => {
  if (code === 0) return { label: "Clear sky", kind: "clear" };
  if (code <= 2) return { label: "Partly cloudy", kind: "partly" };
  if (code === 3) return { label: "Overcast", kind: "cloudy" };
  if (code <= 48) return { label: "Fog", kind: "fog" };
  if (code <= 57) return { label: "Drizzle", kind: "drizzle" };
  if (code <= 67) return { label: "Rain", kind: "rain" };
  if (code <= 77) return { label: "Snow", kind: "snow" };
  if (code <= 82) return { label: "Rain showers", kind: "rain" };
  if (code <= 86) return { label: "Snow showers", kind: "snow" };
  return { label: "Thunderstorm", kind: "thunder" };
};

async function geocode(city) {
  const { data } = await http.get("https://geocoding-api.open-meteo.com/v1/search", {
    params: { name: city, count: 1, language: "en", format: "json" },
  });
  const place = data?.results?.[0];
  if (!place) throw new AppError(`Couldn't find a place called "${city}"`, 404);
  return place;
}

/**
 * Resolves a city name OR { lat, lon } to a place (shared with the air-quality provider).
 * @returns {Promise<{name: string, country: string, admin1?: string, latitude: number, longitude: number}>}
 */
export async function resolvePlace({ city, lat, lon }) {
  if (Number.isFinite(lat) && Number.isFinite(lon)) {
    return { name: "Your location", country: "", latitude: lat, longitude: lon };
  }
  return cached(`geo:${city.toLowerCase()}`, GEOCODE_TTL_MS, () => geocode(city));
}

/** Current weather + 5 day forecast. Pass a city name OR { lat, lon }. */
export async function getWeatherForecast({ city, lat, lon }) {
  const place = await resolvePlace({ city, lat, lon });
  const key = `wx:${place.latitude.toFixed(2)},${place.longitude.toFixed(2)}`;

  return cached(key, WEATHER_TTL_MS, async () => {
    const { data } = await http.get("https://api.open-meteo.com/v1/forecast", {
      params: {
        latitude: place.latitude,
        longitude: place.longitude,
        current:
          "temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m,is_day",
        daily:
          "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max",
        forecast_days: FORECAST_DAYS,
        timezone: "auto",
      },
    });
    const c = data.current;
    const now = WMO(c.weather_code);
    return {
      location: place.name,
      region: place.admin1 || "",
      country: place.country || "",
      current: {
        temperature: Math.round(c.temperature_2m),
        feelsLike: Math.round(c.apparent_temperature),
        humidity: c.relative_humidity_2m,
        windSpeed: Math.round(c.wind_speed_10m),
        isDay: Boolean(c.is_day),
        condition: now.label,
        kind: now.kind,
      },
      daily: data.daily.time.map((date, i) => {
        const w = WMO(data.daily.weather_code[i]);
        return {
          date,
          max: Math.round(data.daily.temperature_2m_max[i]),
          min: Math.round(data.daily.temperature_2m_min[i]),
          rainChance: data.daily.precipitation_probability_max[i] ?? 0,
          condition: w.label,
          kind: w.kind,
        };
      }),
      updatedAt: new Date().toISOString(),
    };
  });
}

/** Compact version for the AI prompt. */
export async function getWeather(city) {
  const w = await getWeatherForecast({ city });
  return {
    location: `${w.location}${w.country ? ", " + w.country : ""}`,
    temperatureC: w.current.temperature,
    feelsLikeC: w.current.feelsLike,
    condition: w.current.condition,
    humidityPercent: w.current.humidity,
    windKmh: w.current.windSpeed,
    forecast: w.daily.map((d) => `${d.date}: ${d.min}-${d.max}°C, ${d.condition}, rain ${d.rainChance}%`),
    observedAt: w.updatedAt,
  };
}
