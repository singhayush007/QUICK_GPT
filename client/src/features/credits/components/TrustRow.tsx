import { Check, ShieldCheck, Zap } from "lucide-react";

export default function TrustRow() {
  return (
    <div className="mx-auto mt-10 flex max-w-3xl flex-wrap justify-center gap-x-8 gap-y-3 text-xs text-muted">
      <span className="flex items-center gap-1.5">
        <ShieldCheck size={14} className="text-emerald-500" /> Secure checkout by Razorpay
      </span>
      <span className="flex items-center gap-1.5">
        <Zap size={14} className="text-brand" /> Credits added instantly
      </span>
      <span className="flex items-center gap-1.5">
        <Check size={14} className="text-emerald-500" /> Credits never expire
      </span>
    </div>
  );
}
