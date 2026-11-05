import { PageHeader } from "@/shared/components/ui";
import { useAuthStore } from "@/store/authStore";
import CreditsFaq from "../components/CreditsFaq";
import CreditsHero from "../components/CreditsHero";
import PlanCard from "../components/PlanCard";
import PurchaseHistory from "../components/PurchaseHistory";
import TrustRow from "../components/TrustRow";
import UsageCards from "../components/UsageCards";
import { POPULAR_PLAN_ID } from "../constants/credits.constants";
import { usePlansQuery } from "../hooks/UsePlansQuery";
import { usePurchaseHistoryQuery } from "../hooks/UsePurchaseHistoryQuery";
import { useRazorpayCheckout } from "../hooks/UseRazorpayCheckout";

/** Credit plans, how credits are spent, purchase history and FAQ. */
export default function CreditsPage({ onMenu }: { onMenu: () => void }) {
  const user = useAuthStore((s) => s.user);
  const { plans, loading } = usePlansQuery();
  const history = usePurchaseHistoryQuery();
  const { buy, buyingId } = useRazorpayCheckout();
  const isPro = user?.plan === "pro";

  return (
    <div className="flex h-full min-w-0 flex-1 flex-col">
      <PageHeader onMenu={onMenu} title="Credits & plans" subtitle="Pay once, use anytime — credits never expire" />
      <div className="flex-1 overflow-y-auto px-4 pb-16 pt-8 md:px-8 md:pt-12">
        <div className="mx-auto max-w-5xl">
          <CreditsHero credits={user?.credits ?? 0} isPro={isPro} />
          <UsageCards isPro={isPro} />

          {/* plans: 3 columns only when there is room, otherwise one centred column (Pro first) */}
          <div className="mx-auto mt-12 grid max-w-md gap-5 xl:max-w-none xl:grid-cols-3 xl:gap-6">
            {loading
              ? [0, 1, 2].map((i) => <div key={i} className="h-96 animate-pulse rounded-3xl bg-surface-2" />)
              : plans.map((plan) => (
                  <PlanCard
                    key={plan._id}
                    plan={plan}
                    popular={plan._id === POPULAR_PLAN_ID}
                    buying={buyingId === plan._id}
                    disabled={Boolean(buyingId)}
                    onBuy={() => void buy(plan)}
                  />
                ))}
          </div>

          <TrustRow />
          <PurchaseHistory items={history} />
          <CreditsFaq />
          <p className="mt-10 text-center text-xs text-muted">Payments are processed by Razorpay (test mode in this demo).</p>
        </div>
      </div>
    </div>
  );
}
