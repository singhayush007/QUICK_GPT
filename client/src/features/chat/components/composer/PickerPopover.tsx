import type { ReactNode } from "react";
import { cn } from "@/shared/lib/utils";

interface PickerPopoverProps {
  onClose: () => void;
  /** Tailwind width class on desktop (becomes a full-width sheet on mobile). */
  widthClass: string;
  children: ReactNode;
}

/** Listbox that opens above the composer; a bottom sheet on small screens. */
export default function PickerPopover({ onClose, widthClass, children }: PickerPopoverProps) {
  return (
    <>
      <div className="fixed inset-0 z-20" onClick={onClose} />
      <ul
        role="listbox"
        className={cn(
          "animate-pop absolute bottom-full left-0 z-30 mb-2 rounded-2xl border border-line bg-surface p-1.5 shadow-2xl",
          "max-sm:fixed max-sm:inset-x-4 max-sm:bottom-36 max-sm:mb-0 max-sm:w-auto",
          widthClass,
        )}
      >
        {children}
      </ul>
    </>
  );
}
