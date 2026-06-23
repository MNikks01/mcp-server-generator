// MCPForge is free & open source. There are no plan tiers, caps, or paywalls.
// Every capability — unlimited endpoints, premium descriptions, saved history,
// GitHub push — is available to everyone. This module is kept as the single
// place that documents that and to keep the store's typing stable.

export type Plan = "free";

export interface PlanLimits {
  maxEndpoints: number;
  premiumDescriptions: boolean;
}

// Everything is unlimited and premium, for everyone.
export function planLimits(_plan?: Plan): PlanLimits {
  return { maxEndpoints: Number.POSITIVE_INFINITY, premiumDescriptions: true };
}
