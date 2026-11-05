import { Component, type ErrorInfo, type ReactNode } from "react";
import { RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
}
interface State {
  error: Error | null;
}

/** Keeps one broken page from blanking the whole app. */
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("UI crashed:", error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="grid h-full w-full place-items-center p-6 text-center">
        <div className="max-w-sm">
          <p className="text-lg font-semibold">Something went wrong</p>
          <p className="mt-2 text-sm text-muted">This page hit an unexpected error. Your chats are safe.</p>
          <button
            onClick={() => this.setState({ error: null })}
            className="btn-gradient mt-5 inline-flex cursor-pointer items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white"
          >
            <RefreshCw size={14} /> Try again
          </button>
        </div>
      </div>
    );
  }
}
