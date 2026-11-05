import { RefreshCw, WifiOff } from "lucide-react";
import { Logo } from "@/shared/components/ui";

/** Shown when the API can't be reached — instead of bouncing a logged-in user to the login form. */
export default function ServerDownPage({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="grid h-screen w-screen place-items-center p-6 text-center">
      <div className="animate-fade-up max-w-sm">
        <div className="mb-8 flex justify-center">
          <Logo size="lg" />
        </div>
        <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-surface-2 text-amber-500">
          <WifiOff size={28} />
        </span>
        <h1 className="mt-5 text-xl font-semibold">Can't reach the server</h1>
        <p className="mt-2 text-sm text-muted">
          Check your internet connection. If you're running QuickGPT locally, make sure the backend is started (
          <code className="rounded bg-surface-2 px-1.5 py-0.5 text-xs">npm run server</code>). You're still logged in.
        </p>
        <button
          onClick={onRetry}
          className="btn-gradient mt-6 inline-flex cursor-pointer items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white"
        >
          <RefreshCw size={15} /> Try again
        </button>
      </div>
    </div>
  );
}
