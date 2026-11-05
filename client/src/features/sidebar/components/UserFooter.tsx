import { LogOut, Moon, Sun } from "lucide-react";
import { useLogout } from "@/features/auth/hooks/UseLogout";
import { useAuthStore } from "@/store/authStore";
import { useThemeStore } from "@/store/themeStore";

/** Avatar, name/email, theme toggle and log out. */
export default function UserFooter() {
  const user = useAuthStore((s) => s.user);
  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  const logout = useLogout();

  return (
    <div className="mt-2 flex items-center gap-2 rounded-xl p-1.5">
      <span className="btn-gradient grid size-9 shrink-0 place-items-center rounded-full text-sm font-semibold text-white">
        {user?.name?.[0]?.toUpperCase()}
      </span>
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1.5 truncate text-sm font-medium">
          {user?.name}
          {user?.plan === "pro" && <span className="rounded bg-amber-500/15 px-1.5 py-px text-[9px] font-bold tracking-wide text-amber-500">PRO</span>}
        </p>
        <p className="truncate text-xs text-muted">{user?.email}</p>
      </div>
      <button onClick={toggleTheme} aria-label="Toggle theme" className="cursor-pointer rounded-lg p-2 text-muted hover:bg-surface-2 hover:text-fg">
        {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
      </button>
      <button onClick={logout} aria-label="Log out" className="cursor-pointer rounded-lg p-2 text-muted hover:bg-red-500/10 hover:text-red-500">
        <LogOut size={16} />
      </button>
    </div>
  );
}
