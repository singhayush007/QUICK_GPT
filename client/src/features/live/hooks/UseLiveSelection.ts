import { useCallback, useState } from "react";
import { STORAGE_KEYS } from "@/shared/constants/storage.constants";
import { storage } from "@/shared/utils/storage.utils";
import { DEFAULT_CITY, DEFAULT_TAB, LIVE_TABS, type LiveTabId } from "../constants/live.constants";
import type { LivePlace, SelectedCity } from "../types/live.types";

/** Remembers the selected Live tab and city across visits. */
export function useLiveSelection() {
  const [tab, setTab] = useState<LiveTabId>(() => {
    const saved = storage.get(STORAGE_KEYS.liveTab) as LiveTabId | null;
    return saved && LIVE_TABS.some((t) => t.id === saved) ? saved : DEFAULT_TAB;
  });
  const [city, setCity] = useState<SelectedCity>(() => storage.getJSON<SelectedCity>(STORAGE_KEYS.liveCity, { name: DEFAULT_CITY }));

  const chooseTab = useCallback((id: LiveTabId) => {
    setTab(id);
    storage.set(STORAGE_KEYS.liveTab, id);
  }, []);

  const chooseCity = useCallback((next: SelectedCity) => {
    setCity(next);
    storage.set(STORAGE_KEYS.liveCity, JSON.stringify(next));
  }, []);

  /** Query params for the weather / AQI endpoints. */
  const place: LivePlace = city.lat != null ? { lat: city.lat, lon: city.lon } : { city: city.name };

  return { tab, chooseTab, city, chooseCity, place };
}
