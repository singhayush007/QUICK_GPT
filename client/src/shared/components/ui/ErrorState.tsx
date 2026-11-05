import { AlertCircle } from "lucide-react";
import Card from "./Card";

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export default function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <Card className="grid place-items-center py-14 text-center">
      <AlertCircle size={30} className="text-amber-500" />
      <p className="mt-3 max-w-sm text-sm text-muted">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="mt-5 cursor-pointer rounded-lg border border-line px-4 py-2 text-sm font-medium hover:bg-surface-2">
          Try again
        </button>
      )}
    </Card>
  );
}
