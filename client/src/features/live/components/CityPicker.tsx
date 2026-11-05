import { useState, type FormEvent } from "react";
import { LocateFixed, Search } from "lucide-react";
import toast from "react-hot-toast";
import { cn } from "@/shared/lib/utils";
import { QUICK_CITIES } from "../constants/live.constants";
import type { SelectedCity } from "../types/live.types";

interface CityPickerProps {
  city: SelectedCity;
  onChange: (city: SelectedCity) => void;
}

/** City search box, "use my location" and quick-pick chips (Weather + Air quality tabs). */
export default function CityPicker({ city, onChange }: CityPickerProps) {
  const [draft, setDraft] = useState("");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (draft.trim()) onChange({ name: draft.trim() });
    setDraft("");
  };

  const locate = () => {
    if (!navigator.geolocation) return void toast.error("Location isn't supported in this browser");
    navigator.geolocation.getCurrentPosition(
      (pos) => onChange({ name: "My location", lat: pos.coords.latitude, lon: pos.coords.longitude }),
      () => toast.error("Location permission denied"),
      { timeout: 8000 },
    );
  };

  return (
    <div className="mt-5">
      <form onSubmit={submit} className="flex gap-2">
        <div className="relative flex-1">
          <Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={`Search a city — showing ${city.name}`}
            className="w-full rounded-xl border border-line bg-surface py-2.5 pl-10 pr-3 text-sm outline-none transition placeholder:text-muted focus:border-brand"
          />
        </div>
        <button
          type="button"
          onClick={locate}
          aria-label="Use my location"
          title="Use my location"
          className="grid size-10 shrink-0 cursor-pointer place-items-center rounded-xl border border-line text-muted hover:bg-surface-2 hover:text-fg"
        >
          <LocateFixed size={17} />
        </button>
      </form>
      <div className="mt-3 flex gap-1.5 overflow-x-auto">
        {QUICK_CITIES.map((c) => (
          <button
            key={c}
            onClick={() => onChange({ name: c })}
            className={cn(
              "shrink-0 cursor-pointer rounded-full border px-3 py-1 text-xs transition",
              city.name === c ? "border-brand text-brand" : "border-line text-muted hover:text-fg",
            )}
          >
            {c}
          </button>
        ))}
      </div>
    </div>
  );
}
