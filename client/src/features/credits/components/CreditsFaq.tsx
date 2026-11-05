import { ChevronDown } from "lucide-react";
import { FAQ } from "../constants/credits.constants";

export default function CreditsFaq() {
  return (
    <section className="mx-auto mt-14 max-w-2xl">
      <h3 className="mb-3 text-sm font-semibold">Questions</h3>
      <div className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
        {FAQ.map(([q, a]) => (
          <details key={q} className="group px-4 py-3">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-medium">
              {q}
              <ChevronDown size={16} className="shrink-0 text-muted transition group-open:rotate-180" />
            </summary>
            <p className="mt-2 text-sm text-muted">{a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
