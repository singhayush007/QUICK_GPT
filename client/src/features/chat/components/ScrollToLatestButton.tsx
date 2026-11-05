import { ArrowDown } from "lucide-react";

export default function ScrollToLatestButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label="Scroll to latest"
      className="glass absolute bottom-40 left-1/2 z-10 grid size-9 -translate-x-1/2 cursor-pointer place-items-center rounded-full border border-line shadow-lg hover:bg-surface-2"
    >
      <ArrowDown size={16} />
    </button>
  );
}
