// Unit test for the (free & open source) plan policy. Run: node scripts/test-plan.ts
// MCPForge has no tiers or caps — every capability is unlimited for everyone.
import { planLimits } from "../lib/plan.ts";

let fails = 0;
function ok(cond: boolean, label: string) {
  console.log(`${cond ? "✓" : "✗"} ${label}`);
  if (!cond) fails++;
}

ok(planLimits().maxEndpoints === Infinity, "endpoints are unlimited for everyone");
ok(planLimits().premiumDescriptions === true, "premium descriptions on for everyone");
ok(planLimits("free").maxEndpoints === Infinity, "free is unlimited (no tiers)");

console.log(fails === 0 ? "\n✅ free/open-source plan policy OK" : `\n❌ ${fails} failed`);
process.exit(fails === 0 ? 0 : 1);
