import type { ReactNode } from "react";
import { Menu } from "lucide-react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  onMenu: () => void;
  children?: ReactNode;
}

/** Sticky top bar used by every page (shows the hamburger on mobile). */
export default function PageHeader({ title, subtitle, onMenu, children }: PageHeaderProps) {
  return (
    <header className="glass sticky top-0 z-10 flex min-h-14 items-center gap-3 border-b border-line px-4 md:px-6">
      <button
        onClick={onMenu}
        aria-label="Open menu"
        className="-ml-1 cursor-pointer rounded-lg p-2 text-muted hover:bg-surface-2 hover:text-fg md:hidden"
      >
        <Menu size={20} />
      </button>
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-sm font-semibold md:text-base">{title}</h1>
        {subtitle && <p className="truncate text-xs text-muted">{subtitle}</p>}
      </div>
      {children}
    </header>
  );
}
