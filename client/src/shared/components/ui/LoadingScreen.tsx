import { cn } from "@/shared/lib/utils";
import Logo from "./Logo";

interface LoadingScreenProps {
  /** Full-screen splash with the logo, or an inline spinner that fills its container. */
  fullScreen?: boolean;
}

export default function LoadingScreen({ fullScreen = true }: LoadingScreenProps) {
  return (
    <div
      className={cn("grid place-items-center", fullScreen ? "h-screen w-screen" : "h-full min-h-[50vh] w-full")}
      role="status"
      aria-label="Loading"
    >
      <div className="flex flex-col items-center gap-5">
        {fullScreen && <Logo size="lg" />}
        <div className="size-8 animate-spin rounded-full border-[3px] border-brand/25 border-t-brand" />
      </div>
    </div>
  );
}
