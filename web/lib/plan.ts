// Plan + gating logic (pure, unit-testable). Free vs Pro.

export type Plan = "free" | "pro";

export const FREE_ENDPOINT_CAP = 8;

export interface PlanLimits {
  maxEndpoints: number;
  premiumDescriptions: boolean;
}

export function planLimits(plan: Plan): PlanLimits {
  return plan === "pro"
    ? { maxEndpoints: Number.POSITIVE_INFINITY, premiumDescriptions: true }
    : { maxEndpoints: FREE_ENDPOINT_CAP, premiumDescriptions: false };
}

export type LimitCheck = { ok: true } | { ok: false; message: string };

export function checkEndpointLimit(plan: Plan, count: number): LimitCheck {
  const { maxEndpoints } = planLimits(plan);
  if (count > maxEndpoints) {
    return {
      ok: false,
      message: `The Free plan generates up to ${FREE_ENDPOINT_CAP} endpoints (you selected ${count}). Upgrade to Pro for unlimited endpoints + premium descriptions.`,
    };
  }
  return { ok: true };
}
