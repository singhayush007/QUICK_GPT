import type { ReactNode } from "react";
import { Loader2, RefreshCw } from "lucide-react";

interface RefreshBarProps {
  updatedAt: Date | null;
  refreshing: boolean;
  onRefresh: () => void;
  children?: ReactNode;
}

/** "Updated 05:16 pm" + manual refresh button (top of every panel). */
export default function RefreshBar({ updatedAt, refreshing, onRefresh, children }: RefreshBarProps) {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2 text-xs text-muted">
        {children}
        {updatedAt && <span>Updated {updatedAt.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</span>}
      </div>
      <button
        onClick={onRefresh}
        disabled={refreshing}
        aria-label="Refresh"
        className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-xs font-medium text-muted transition hover:bg-surface-2 hover:text-fg disabled:opacity-60"
      >
        {refreshing ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />} Refresh
      </button>
    </div>
  );
}
