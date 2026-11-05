import { Sparkles } from "lucide-react";
import { Logo } from "@/shared/components/ui";
import { LOGIN_FEATURES } from "../constants/auth.constants";

/** Brand panel on the left of the login screen (desktop only). */
export default function LoginHero() {
  return (
    <div className="relative hidden flex-col justify-between overflow-hidden p-12 lg:flex">
      <div className="absolute -left-24 top-1/4 size-96 rounded-full bg-brand/25 blur-[120px]" />
      <div className="absolute -right-10 bottom-10 size-80 rounded-full bg-brand-2/25 blur-[120px]" />
      <Logo size="lg" />
      <div className="relative max-w-lg">
        <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-line bg-surface/60 px-3 py-1 text-xs font-medium text-muted backdrop-blur">
          <Sparkles size={13} className="text-brand" /> 20 free credits on sign-up
        </span>
        <h1 className="text-5xl font-semibold leading-[1.1] tracking-tight">
          Your fastest way to <span className="gradient-text">chat, code & create</span>
        </h1>
        <ul className="mt-10 space-y-5">
          {LOGIN_FEATURES.map((f) => (
            <li key={f.title} className="flex gap-4">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-line bg-surface/70 text-brand backdrop-blur">
                <f.icon size={18} />
              </span>
              <div>
                <p className="font-medium">{f.title}</p>
                <p className="text-sm text-muted">{f.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <p className="relative text-xs text-muted">Built with React, Node, MongoDB & Gemini</p>
    </div>
  );
}
