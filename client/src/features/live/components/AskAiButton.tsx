import { useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";

/** Opens the chat with a ready-made question about the data on screen. */
export default function AskAiButton({ prompt }: { prompt: string }) {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate("/", { state: { prefill: prompt } })}
      className="btn-gradient flex cursor-pointer items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold text-white"
    >
      <Sparkles size={13} /> Ask AI about this
    </button>
  );
}
