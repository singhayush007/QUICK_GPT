import { useEffect, type ReactNode } from "react";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { useAuthStore } from "@/store/authStore";
import { useThemeStore } from "@/store/themeStore";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

/** Cached server data belongs to a user: drop it all on logout. */
function ClearQueryCacheOnLogout() {
  const token = useAuthStore((s) => s.token);
  useEffect(() => {
    if (!token) queryClient.clear();
  }, [token]);
  return null;
}

/** Toasts follow the app theme. */
function ThemedToaster() {
  const dark = useThemeStore((s) => s.theme) === "dark";
  return (
    <Toaster
      position="top-center"
      toastOptions={{
        style: {
          background: dark ? "#181824" : "#fff",
          color: dark ? "#f2f2f8" : "#14141f",
          border: "1px solid var(--color-line)",
          borderRadius: "12px",
          fontSize: "14px",
        },
      }}
    />
  );
}

export default function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ClearQueryCacheOnLogout />
        <ThemedToaster />
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  );
}
