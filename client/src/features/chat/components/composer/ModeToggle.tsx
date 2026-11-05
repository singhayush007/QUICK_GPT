import { Image as ImageIcon, Type, type LucideIcon } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import type { ComposerMode } from "../../types/chat.types";

const MODES: ReadonlyArray<{ id: ComposerMode; label: string; icon: LucideIcon }> = [
  { id: "text", label: "Text", icon: Type },
  { id: "image", label: "Image", icon: ImageIcon },
];

interface ModeToggleProps {
  mode: ComposerMode;
  onChange: (mode: ComposerMode) => void;
}

export default function ModeToggle({ mode, onChange }: ModeToggleProps) {
  return (
    <div className="flex rounded-full bg-surface-2 p-0.5 text-xs font-medium">
      {MODES.map((m) => (
        <button
          key={m.id}
          onClick={() => onChange(m.id)}
          aria-pressed={mode === m.id}
          aria-label={m.label}
          className={cn(
            "flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 transition",
            mode === m.id ? "btn-gradient text-white" : "text-muted hover:text-fg",
          )}
        >
          <m.icon size={13} /> <span className="max-sm:hidden">{m.label}</span>
        </button>
      ))}
    </div>
  );
}
