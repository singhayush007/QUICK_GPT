import { Zap } from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface LogoProps {
  size?: "md" | "lg";
  onClick?: () => void;
}

export default function Logo({ size = "md", onClick }: LogoProps) {
  const large = size === "lg";
  return (
    <div onClick={onClick} className={cn("flex items-center gap-2.5 select-none", onClick && "cursor-pointer")}>
      <span className={cn("btn-gradient grid place-items-center text-white", large ? "size-11 rounded-2xl" : "size-9 rounded-xl")}>
        <Zap size={large ? 22 : 18} fill="currentColor" strokeWidth={1.5} />
      </span>
      <span className={cn("font-semibold tracking-tight", large ? "text-2xl" : "text-lg")}>
        Quick<span className="gradient-text">GPT</span>
      </span>
    </div>
  );
}
