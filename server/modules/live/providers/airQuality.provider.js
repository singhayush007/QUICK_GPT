import { http } from "./http.js";
import { resolvePlace } from "./weather.provider.js";
import { cached } from "../../../shared/utils/cache.js";

/** Open-Meteo air-quality API — free and key-less. */
const AQI_TTL_MS = 15 * 60e3;

const aqiCategory = (v) => {
  if (v <= 50) return { label: "Good", tone: "good", advice: "Air quality is satisfactory. Enjoy outdoor activities." };
  if (v <= 100) return { label: "Moderate", tone: "moderate", advice: "Acceptable. Unusually sensitive people should limit long outdoor exertion." };
  if (v <= 150) return { label: "Unhealthy for sensitive groups", tone: "sensitive", advice: "Children, elderly and people with asthma should reduce outdoor activity." };
  if (v <= 200) return { label: "Unhealthy", tone: "unhealthy", advice: "Everyone may feel effects. Limit outdoor exertion and consider a mask." };
  if (v <= 300) return { label: "Very unhealthy", tone: "very", advice: "Avoid outdoor activity. Use an N95 mask if you must go out." };
  return { label: "Hazardous", tone: "hazardous", advice: "Stay indoors with windows closed and use an air purifier." };
};

/** US-AQI + pollutant levels for a city or coordinates. */
export async function getAirQuality({ city, lat, lon }) {
  const place = await resolvePlace({ city, lat, lon });
  return cached(`aqi:${place.latitude.toFixed(2)},${place.longitude.toFixed(2)}`, AQI_TTL_MS, async () => {
    const { data } = await http.get("https://air-quality-api.open-meteo.com/v1/air-quality", {
      params: {
        latitude: place.latitude,
        longitude: place.longitude,
        current: "us_aqi,pm2_5,pm10,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone",
        timezone: "auto",
      },
    });
    const c = data.current;
    const aqi = Math.round(c.us_aqi ?? 0);
    const round = (n) => (n == null ? null : Math.round(n * 10) / 10);
    return {
      location: place.name,
      region: place.admin1 || "",
      country: place.country || "",
      aqi,
      ...aqiCategory(aqi),
      pollutants: [
        { key: "pm2_5", name: "PM2.5", value: round(c.pm2_5), unit: "µg/m³" },
        { key: "pm10", name: "PM10", value: round(c.pm10), unit: "µg/m³" },
        { key: "no2", name: "NO₂", value: round(c.nitrogen_dioxide), unit: "µg/m³" },
        { key: "so2", name: "SO₂", value: round(c.sulphur_dioxide), unit: "µg/m³" },
        { key: "o3", name: "Ozone", value: round(c.ozone), unit: "µg/m³" },
        { key: "co", name: "CO", value: round(c.carbon_monoxide), unit: "µg/m³" },
      ],
      updatedAt: new Date().toISOString(),
    };
  });
}
