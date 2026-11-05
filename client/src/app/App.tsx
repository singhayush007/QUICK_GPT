import { Suspense, lazy } from "react";
import { Route, Routes, useMatch } from "react-router-dom";
import LoginPage from "@/features/auth/views/LoginPage";
import ServerDownPage from "@/features/auth/views/ServerDownPage";
import { useSessionBootstrap } from "@/features/auth/hooks/UseSessionBootstrap";
import { LoadingScreen } from "@/shared/components/ui";
import { useAuthStore } from "@/store/authStore";
import AppShell from "./layout/AppShell";

const SharedChatPage = lazy(() => import("@/features/share/views/SharedChatPage"));

/** Chooses what to show: public share page, splash, "server down", login or the app. */
export default function App() {
  useSessionBootstrap();

  const user = useAuthStore((s) => s.user);
  const loading = useAuthStore((s) => s.loading);
  const serverDown = useAuthStore((s) => s.serverDown);
  const retryConnection = useAuthStore((s) => s.retryConnection);

  // public shared chats must work without logging in (and without waiting for auth)
  const isSharePage = useMatch("/share/:shareId");
  if (isSharePage) {
    return (
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route path="/share/:shareId" element={<SharedChatPage />} />
        </Routes>
      </Suspense>
    );
  }

  if (loading) return <LoadingScreen />;
  if (serverDown && !user) return <ServerDownPage onRetry={() => void retryConnection()} />;
  return user ? <AppShell /> : <LoginPage />;
}
