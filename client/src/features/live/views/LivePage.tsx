import { PageHeader } from "@/shared/components/ui";
import AqiPanel from "../components/AqiPanel";
import CityPicker from "../components/CityPicker";
import LiveTabs from "../components/LiveTabs";
import MarketsPanel from "../components/MarketsPanel";
import ScoresPanel from "../components/ScoresPanel";
import WeatherPanel from "../components/WeatherPanel";
import { LIVE_TABS } from "../constants/live.constants";
import { useAirQualityQuery, useMarketsQuery, useScoresQuery, useWeatherQuery } from "../hooks/UseLiveData";
import { useLiveSelection } from "../hooks/UseLiveSelection";
import type { Sport } from "../types/live.types";

/** Weather, air quality, markets and live sports in one place. */
export default function LivePage({ onMenu }: { onMenu: () => void }) {
  const { tab, chooseTab, city, chooseCity, place } = useLiveSelection();
  const active = LIVE_TABS.find((t) => t.id === tab) ?? LIVE_TABS[0];
  const isSport = tab === "cricket" || tab === "football" || tab === "basketball";

  const weather = useWeatherQuery(place, tab === "weather");
  const aqi = useAirQualityQuery(place, tab === "aqi");
  const markets = useMarketsQuery(tab === "markets");
  const scores = useScoresQuery(isSport ? (tab as Sport) : "cricket", isSport);

  return (
    <div className="flex h-full min-w-0 flex-1 flex-col">
      <PageHeader onMenu={onMenu} title="Live" subtitle="Weather, air quality, markets & sports" />
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-4xl px-4 pb-12 pt-5 md:px-8">
          <LiveTabs active={tab} onChange={chooseTab} />
          {active.city && <CityPicker city={city} onChange={chooseCity} />}

          <div className="mt-6">
            {tab === "weather" && <WeatherPanel live={weather} cityName={city.name} />}
            {tab === "aqi" && <AqiPanel live={aqi} cityName={city.name} />}
            {tab === "markets" && <MarketsPanel live={markets} />}
            {isSport && <ScoresPanel key={tab} live={scores} sportLabel={active.label} />}
          </div>
        </div>
      </div>
    </div>
  );
}
