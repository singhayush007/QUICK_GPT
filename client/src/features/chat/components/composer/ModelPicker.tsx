import { ChevronDown, Lock, Zap } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { MODEL_META } from "@/shared/constants/models.constants";
import type { ModelInfo } from "../../types/chat.types";
import PickerPopover from "./PickerPopover";

interface ModelPickerProps {
  models: ModelInfo[];
  active: Pick<ModelInfo, "id" | "name" | "tier">;
  isProUser: boolean;
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
  onChoose: (model: ModelInfo) => void;
}

/** Lite / Flash (free) and Pro (paid) — locked models send the user to the Credits page. */
export default function ModelPicker({ models, active, isProUser, open, onToggle, onClose, onChoose }: ModelPickerProps) {
  const ActiveIcon = MODEL_META[active.id]?.icon || Zap;

  return (
    <div className="relative">
      <button
        onClick={onToggle}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Choose model"
        className="flex cursor-pointer items-center gap-1.5 rounded-full border border-line px-2.5 py-1.5 text-xs font-medium transition hover:bg-surface-2"
      >
        <ActiveIcon size={13} className={active.tier === "pro" ? "text-amber-500" : "text-brand"} />
        {active.name}
        <ChevronDown size={12} className="text-muted" />
      </button>
      {open && (
        <PickerPopover onClose={onClose} widthClass="w-72">
          {models.map((m) => {
            const Icon = MODEL_META[m.id]?.icon || Zap;
            return (
              <li key={m.id}>
                <button
                  role="option"
                  aria-selected={m.id === active.id}
                  onClick={() => onChoose(m)}
                  className={cn(
                    "flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-surface-2",
                    m.id === active.id && "bg-brand/10",
                  )}
                >
                  <Icon size={17} className={cn("shrink-0", m.tier === "pro" ? "text-amber-500" : "text-brand")} />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2 text-sm font-medium">
                      {m.name}
                      <span
                        className={cn(
                          "rounded px-1.5 py-px text-[9px] font-bold tracking-wide",
                          m.tier === "pro" ? "bg-amber-500/15 text-amber-500" : "bg-emerald-500/15 text-emerald-500",
                        )}
                      >
                        {m.tier === "pro" ? "PRO" : "FREE"}
                      </span>
                    </span>
                    <span className="block truncate text-xs text-muted">{m.tagline}</span>
                  </span>
                  <span className="flex shrink-0 flex-col items-end text-[11px] text-muted">
                    {m.locked && <Lock size={13} className="text-amber-500" />}
                    {m.cost} credit{m.cost > 1 ? "s" : ""}
                  </span>
                </button>
              </li>
            );
          })}
          {!isProUser && (
            <li className="px-3 pb-1.5 pt-2 text-[11px] text-muted">
              Buy any plan to unlock <b className="text-amber-500">Pro</b>.
            </li>
          )}
        </PickerPopover>
      )}
    </div>
  );
}
