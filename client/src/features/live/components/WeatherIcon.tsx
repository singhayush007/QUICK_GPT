import { Cloud, CloudDrizzle, CloudFog, CloudLightning, CloudRain, CloudSnow, CloudSun, Sun, type LucideIcon } from "lucide-react";
import type { WeatherKind } from "../types/live.types";

const ICONS: Record<WeatherKind, LucideIcon> = {
  clear: Sun,
  partly: CloudSun,
  cloudy: Cloud,
  fog: CloudFog,
  drizzle: CloudDrizzle,
  rain: CloudRain,
  snow: CloudSnow,
  thunder: CloudLightning,
};

export default function WeatherIcon({ kind, size = 24, className }: { kind: WeatherKind; size?: number; className?: string }) {
  const Icon = ICONS[kind] ?? Cloud;
  return <Icon size={size} className={className} />;
}
