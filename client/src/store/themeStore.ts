import { create } from "zustand";
import { STORAGE_KEYS } from "@/shared/constants/storage.constants";
import { storage } from "@/shared/utils/storage.utils";

export type Theme = "dark" | "light";

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const apply = (theme: Theme) => {
  document.documentElement.classList.toggle("dark", theme === "dark");
  storage.set(STORAGE_KEYS.theme, theme);
};

const initial: Theme = storage.get(STORAGE_KEYS.theme) === "light" ? "light" : "dark";
apply(initial);

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: initial,
  setTheme: (theme) => {
    apply(theme);
    set({ theme });
  },
  toggleTheme: () => get().setTheme(get().theme === "dark" ? "light" : "dark"),
}));
