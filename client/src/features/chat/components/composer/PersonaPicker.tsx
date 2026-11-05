import { ChevronDown } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { PERSONAS } from "../../constants/personas.constants";
import PickerPopover from "./PickerPopover";

interface PersonaPickerProps {
  personaId: string;
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
  onChoose: (id: string) => void;
}

/** Changes the AI's system prompt (Code expert, Tutor, Translator…). */
export default function PersonaPicker({ personaId, open, onToggle, onClose, onChoose }: PersonaPickerProps) {
  const current = PERSONAS.find((p) => p.id === personaId) ?? PERSONAS[0];

  return (
    <div className="relative">
      <button
        onClick={onToggle}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex cursor-pointer items-center gap-1.5 rounded-full border border-line px-2.5 py-1.5 text-xs font-medium text-muted transition hover:text-fg"
      >
        <current.icon size={13} className="text-brand" />
        <span className="max-sm:hidden">{current.label}</span>
        <ChevronDown size={12} />
      </button>
      {open && (
        <PickerPopover onClose={onClose} widthClass="w-64">
          {PERSONAS.map((p) => (
            <li key={p.id}>
              <button
                role="option"
                aria-selected={p.id === current.id}
                onClick={() => onChoose(p.id)}
                className={cn(
                  "flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-left transition hover:bg-surface-2",
                  p.id === current.id && "bg-brand/10",
                )}
              >
                <p.icon size={16} className="shrink-0 text-brand" />
                <span>
                  <span className="block text-sm font-medium">{p.label}</span>
                  <span className="block text-xs text-muted">{p.desc}</span>
                </span>
              </button>
            </li>
          ))}
        </PickerPopover>
      )}
    </div>
  );
}
