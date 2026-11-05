import { Receipt } from "lucide-react";
import { formatDate } from "@/shared/utils/time.utils";
import type { PurchaseHistoryItem } from "../types/credits.types";

export default function PurchaseHistory({ items }: { items: PurchaseHistoryItem[] }) {
  if (!items.length) return null;
  return (
    <section className="mx-auto mt-14 max-w-2xl">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
        <Receipt size={16} className="text-brand" /> Purchase history
      </h3>
      <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
        {items.map((h) => (
          <li key={h._id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
            <span className="min-w-0">
              <span className="font-medium capitalize">{h.planId}</span>
              <span className="ml-2 text-muted">+{h.credits} credits</span>
            </span>
            <span className="shrink-0 text-right">
              <span className="block font-medium">₹{h.amount}</span>
              <span className="block text-xs text-muted">{formatDate(h.createdAt)}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
