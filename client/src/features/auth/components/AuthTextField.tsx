import type { InputHTMLAttributes } from "react";

interface AuthTextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export default function AuthTextField({ label, ...props }: AuthTextFieldProps) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      <input
        {...props}
        className="w-full rounded-xl border border-line bg-surface-2/60 px-4 py-3 text-sm outline-none transition placeholder:text-muted focus:border-brand focus:ring-4 focus:ring-brand/15"
      />
    </label>
  );
}
