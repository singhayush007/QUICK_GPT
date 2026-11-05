import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Logo } from "@/shared/components/ui";
import { useAuthForm } from "../hooks/UseAuthForm";
import AuthTextField from "./AuthTextField";

/** Login / sign-up form (toggles between the two). */
export default function LoginForm() {
  const f = useAuthForm();

  return (
    <div className="grid place-items-center p-6">
      <form onSubmit={f.submit} className="animate-fade-up w-full max-w-sm">
        <div className="mb-8 lg:hidden">
          <Logo size="lg" />
        </div>
        <h2 className="text-3xl font-semibold tracking-tight">{f.isRegister ? "Create your account" : "Welcome back"}</h2>
        <p className="mt-2 text-sm text-muted">{f.isRegister ? "Start with 20 free credits — no card needed." : "Log in to continue your conversations."}</p>

        <div className="mt-8 space-y-4">
          {f.isRegister && (
            <AuthTextField label="Name" value={f.name} onChange={(e) => f.setName(e.target.value)} placeholder="Ayush Singh" autoComplete="name" required />
          )}
          <AuthTextField label="Email" type="email" value={f.email} onChange={(e) => f.setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" required />
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">Password</span>
            <div className="relative">
              <input
                type={f.showPassword ? "text" : "password"}
                value={f.password}
                onChange={(e) => f.setPassword(e.target.value)}
                placeholder={f.isRegister ? "At least 6 characters" : "Your password"}
                autoComplete={f.isRegister ? "new-password" : "current-password"}
                required
                className="w-full rounded-xl border border-line bg-surface-2/60 px-4 py-3 pr-11 text-sm outline-none transition placeholder:text-muted focus:border-brand focus:ring-4 focus:ring-brand/15"
              />
              <button
                type="button"
                onClick={f.toggleShowPassword}
                aria-label={f.showPassword ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-muted hover:text-fg"
              >
                {f.showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </label>
        </div>

        <button
          type="submit"
          disabled={f.submitting}
          className="btn-gradient mt-6 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white transition active:scale-[0.98] disabled:opacity-70"
        >
          {f.submitting && <Loader2 size={16} className="animate-spin" />}
          {f.isRegister ? "Create account" : "Log in"}
        </button>

        <p className="mt-6 text-center text-sm text-muted">
          {f.isRegister ? "Already have an account?" : "New to QuickGPT?"}{" "}
          <button type="button" onClick={f.toggleMode} className="cursor-pointer font-semibold text-brand hover:underline">
            {f.isRegister ? "Log in" : "Sign up free"}
          </button>
        </p>
      </form>
    </div>
  );
}
