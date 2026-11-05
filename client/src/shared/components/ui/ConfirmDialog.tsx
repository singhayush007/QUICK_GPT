import { AlertTriangle } from "lucide-react";
import { useEscapeKey } from "@/shared/hooks/UseEscapeKey";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/** Accessible replacement for window.confirm(). */
export default function ConfirmDialog({ open, title, message, confirmLabel = "Delete", onConfirm, onCancel }: ConfirmDialogProps) {
  useEscapeKey(onCancel, open);
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 backdrop-blur-sm" onClick={onCancel}>
      <div
        role="alertdialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        className="animate-pop w-full max-w-sm rounded-2xl border border-line bg-surface p-6 shadow-2xl"
      >
        <div className="mb-4 grid size-11 place-items-center rounded-full bg-red-500/10 text-red-500">
          <AlertTriangle size={20} />
        </div>
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="mt-1.5 text-sm text-muted">{message}</p>
        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onCancel} className="cursor-pointer rounded-lg border border-line px-4 py-2 text-sm font-medium hover:bg-surface-2">
            Cancel
          </button>
          <button
            autoFocus
            onClick={onConfirm}
            className="cursor-pointer rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
