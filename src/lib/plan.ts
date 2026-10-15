import type { PlanType } from "@prisma/client";
import { FEES } from "@/content/schedule";

export function monthlyFeeForPlan(plan: PlanType, sponsoredFeeSen: number = FEES.sponsoredSen): number {
  switch (plan) {
    case "FULL":
      return FEES.monthlySen;
    case "SIBLING_2":
      return FEES.sibling2Sen;
    case "SIBLING_3":
      return FEES.sibling3Sen;
    case "SPONSORED":
      return sponsoredFeeSen;
  }
}

export const PLAN_LABELS: Record<PlanType, string> = {
  FULL: "Full Paying",
  SIBLING_2: "Sibling (2nd child)",
  SIBLING_3: "Sibling (3rd+ child)",
  SPONSORED: "Sponsored",
};
