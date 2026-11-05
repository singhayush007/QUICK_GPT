import { useQuery } from "@tanstack/react-query";
import { creditsService } from "../services/credits.service";

export function usePlansQuery() {
  const query = useQuery({ queryKey: ["credit-plans"], queryFn: creditsService.plans });
  const plans = query.data?.success ? query.data.plans : [];
  return { plans, loading: query.isPending, error: query.data && !query.data.success ? query.data.message : null };
}
