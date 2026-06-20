// Unit test for the pure plan/gating logic. Run: node scripts/test-plan.ts
import { checkEndpointLimit, planLimits, FREE_ENDPOINT_CAP } from "../lib/plan.ts";

let fails = 0;
function ok(cond: boolean, label: string) {
  console.log(`${cond ? "✓" : "✗"} ${label}`);
  if (!cond) fails++;
}

ok(FREE_ENDPOINT_CAP === 8, "free cap is 8");
ok(planLimits("free").maxEndpoints === 8, "free maxEndpoints = 8");
ok(planLimits("pro").maxEndpoints === Infinity, "pro maxEndpoints = Infinity");
ok(planLimits("pro").premiumDescriptions === true, "pro premium descriptions on");
ok(planLimits("free").premiumDescriptions === false, "free premium descriptions off");
ok(checkEndpointLimit("free", 8).ok === true, "free allows 8");
ok(checkEndpointLimit("free", 9).ok === false, "free blocks 9");
ok(checkEndpointLimit("pro", 999).ok === true, "pro allows 999");
const blocked = checkEndpointLimit("free", 20);
ok(blocked.ok === false && blocked.message.includes("Upgrade"), "free block message mentions Upgrade");

console.log(fails === 0 ? "\n✅ plan logic OK" : `\n❌ ${fails} failed`);
process.exit(fails === 0 ? 0 : 1);
