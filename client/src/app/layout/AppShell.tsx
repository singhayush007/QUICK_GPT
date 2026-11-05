import { Suspense, lazy, useState } from "react";
import { Route, Routes } from "react-router-dom";
import ChatPage from "@/features/chat/views/ChatPage";
import Sidebar from "@/features/sidebar/components/Sidebar";
import { ErrorBoundary, LoadingScreen } from "@/shared/components/ui";

// route-level code splitting: these pages are only downloaded when visited
const CreditsPage = lazy(() => import("@/features/credits/views/CreditsPage"));
const CommunityPage = lazy(() => import("@/features/community/views/CommunityPage"));
const LivePage = lazy(() => import("@/features/live/views/LivePage"));

/** Signed-in layout: sidebar + the routed page. */
export default function AppShell() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const openMenu = () => setIsMenuOpen(true);

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <Sidebar isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
      <main className="flex min-w-0 flex-1">
        <ErrorBoundary>
          <Suspense fallback={<LoadingScreen fullScreen={false} />}>
            <Routes>
              <Route path="/" element={<ChatPage onMenu={openMenu} />} />
              <Route path="/credits" element={<CreditsPage onMenu={openMenu} />} />
              <Route path="/live" element={<LivePage onMenu={openMenu} />} />
              <Route path="/community" element={<CommunityPage onMenu={openMenu} />} />
              <Route path="*" element={<ChatPage onMenu={openMenu} />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </main>
    </div>
  );
}
