import type { ReactNode } from "react";
import { cn } from "@/shared/lib/utils";

export default function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("rounded-3xl border border-line bg-surface p-5 md:p-6", className)}>{children}</div>;
}
