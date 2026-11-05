import { NavLink } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface NavItemProps {
  to: string;
  icon: LucideIcon;
  label: string;
  onClick: () => void;
}

export default function NavItem({ to, icon: Icon, label, onClick }: NavItemProps) {
  return (
    <NavLink
      to={to}
      end
      onClick={onClick}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition",
          isActive ? "bg-brand/10 text-brand" : "text-muted hover:bg-surface-2 hover:text-fg",
        )
      }
    >
      <Icon size={17} /> {label}
    </NavLink>
  );
}
