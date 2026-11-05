import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

/**
 * "Ask AI about this" buttons (Live page) navigate here with `state.prefill`.
 * Hands the text to `onPrefill`, then clears the router state so a refresh doesn't repeat it.
 */
export function useChatPrefill(onPrefill: (text: string) => void): void {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const prefill = (location.state as { prefill?: string } | null)?.prefill;
    if (!prefill) return;
    onPrefill(prefill);
    navigate(".", { replace: true, state: null });
  }, [location.state, navigate, onPrefill]);
}
