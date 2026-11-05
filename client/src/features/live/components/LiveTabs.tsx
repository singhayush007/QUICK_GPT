import { cn } from "@/shared/lib/utils";
import { LIVE_TABS, type LiveTabId } from "../constants/live.constants";

interface LiveTabsProps {
  active: LiveTabId;
  onChange: (id: LiveTabId) => void;
}

export default function LiveTabs({ active, onChange }: LiveTabsProps) {
  return (
    <div role="tablist" className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
      {LIVE_TABS.map((t) => (
        <button
          key={t.id}
          role="tab"
          aria-selected={active === t.id}
          onClick={() => onChange(t.id)}
          className={cn(
            "flex shrink-0 cursor-pointer items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition",
            active === t.id ? "btn-gradient text-white" : "border border-line text-muted hover:text-fg",
          )}
        >
          <t.icon size={15} /> {t.label}
        </button>
      ))}
    </div>
  );
}
