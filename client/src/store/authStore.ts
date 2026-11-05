import { isAxiosError } from "axios";
import toast from "react-hot-toast";
import { create } from "zustand";
import { authService } from "@/shared/services/auth.service";
import { getErrorMessage } from "@/shared/utils/error.utils";
import { tokenStorage } from "@/shared/utils/token.utils";
import type { User } from "@/shared/types";
import { useChatStore } from "./chatStore";

interface AuthState {
  token: string | null;
  user: User | null;
  /** True while the stored token is being verified on app start. */
  loading: boolean;
  /** The API could not be reached (offline / server stopped) — keep the session, offer a retry. */
  serverDown: boolean;

  setToken: (token: string | null) => void;
  /** Patch the cached user (e.g. new credit balance after a reply). */
  patchUser: (patch: Partial<User>) => void;
  fetchUser: () => Promise<void>;
  retryConnection: () => Promise<void>;
  logout: () => void;
}

const initialToken = tokenStorage.get();

export const useAuthStore = create<AuthState>((set, get) => ({
  token: initialToken,
  user: null,
  loading: Boolean(initialToken),
  serverDown: false,

  setToken: (token) => {
    if (token) tokenStorage.set(token);
    else tokenStorage.clear();
    set({ token });
  },

  patchUser: (patch) => set((state) => (state.user ? { user: { ...state.user, ...patch } } : state)),

  fetchUser: async () => {
    try {
      const data = await authService.currentUser();
      set({ serverDown: false });
      if (data.success) set({ user: data.user });
    } catch (error) {
      if (!isAxiosError(error) || !error.response) {
        // network error / server offline: keep the token, show a retry screen (not the login form)
        set({ serverDown: true });
      } else if (error.response.status === 401) {
        // expired / invalid token -> sign out instead of leaving a broken session
        get().setToken(null);
        set({ user: null });
      } else {
        toast.error(getErrorMessage(error));
      }
    } finally {
      set({ loading: false });
    }
  },

  retryConnection: () => {
    set({ loading: true });
    return get().fetchUser();
  },

  logout: () => {
    get().setToken(null);
    set({ user: null });
    useChatStore.getState().reset();
  },
}));
