import type { CSSProperties } from "react";
import { cn } from "@/shared/lib/utils";

export default function Skeleton({ className, style }: { className?: string; style?: CSSProperties }) {
  return <div className={cn("animate-pulse rounded-2xl bg-surface-2", className)} style={style} />;
}
