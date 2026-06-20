// Phase C proof: the money mechanic end-to-end (identity -> plan -> gating -> upgrade)
// without a live Stripe/Clerk/DB, using the guarded dev plan route.
// Requires the server started with ALLOW_DEV_PLAN=1.
const BASE = process.env.BASE || "http://localhost:3939";
let cookie = "";

async function call(path, opts = {}) {
  const res = await fetch(BASE + path, {
    ...opts,
    headers: { ...(opts.headers || {}), ...(cookie ? { cookie } : {}) },
  });
  const sc = res.headers.get("set-cookie");
  if (sc) cookie = sc.split(";")[0];
  return res;
}
const post = (p, b) => call(p, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(b) });

// 1) session
let r = await call("/api/me");
const me = await r.json();
if (!cookie) throw new Error("no session cookie set");
console.log(`✓ /api/me -> plan=${me.plan}, freeCap=${me.freeEndpointCap}`);

// 2) parse the live 19-tool Petstore
r = await post("/api/parse", { specUrl: "https://petstore3.swagger.io/api/v3/openapi.json" });
const { ir } = await r.json();
const all = ir.tools.map((t) => t.name);
console.log(`✓ parsed ${all.length} tools`);

// 3) free + 8 tools -> 200
r = await post("/api/generate", { ir, selectedTools: all.slice(0, 8) });
if (r.status !== 200) throw new Error(`free/8 expected 200, got ${r.status}`);
console.log("✓ free plan, 8 tools -> 200 OK");

// 4) free + 19 tools -> 402 (gated)
r = await post("/api/generate", { ir, selectedTools: all });
if (r.status !== 402) throw new Error(`free/19 expected 402, got ${r.status}`);
console.log(`✓ free plan, 19 tools -> 402 gated (${(await r.json()).error.code})`);

// 5) upgrade to pro (dev route stands in for the Stripe webhook)
r = await post("/api/dev/set-plan", { plan: "pro" });
if (r.status !== 200) throw new Error(`dev set-plan failed ${r.status}`);
r = await call("/api/me");
const after = await r.json();
console.log(`✓ upgraded -> /api/me plan=${after.plan}`);

// 6) pro + 19 tools -> 200 (unlimited)
r = await post("/api/generate", { ir, selectedTools: all });
if (r.status !== 200) throw new Error(`pro/19 expected 200, got ${r.status}`);
console.log("✓ pro plan, 19 tools -> 200 OK (unlimited)");

// 7) checkout without Stripe keys -> graceful 501
r = await post("/api/stripe/checkout", {});
if (r.status !== 501) throw new Error(`checkout expected 501 (no keys), got ${r.status}`);
console.log("✓ checkout without keys -> 501 (graceful, drop-in once keys are set)");

console.log("\n✅ Phase C gating mechanic PASSED");
