// Smoke test for the Nice-to-Have features: YAML parsing, saved history (Pro),
// and the GitHub-push guards. Requires the server started with ALLOW_DEV_PLAN=1.
const BASE = process.env.BASE || "http://localhost:3942";
let cookie = "";
async function call(path, opts = {}) {
  const res = await fetch(BASE + path, { ...opts, headers: { ...(opts.headers || {}), ...(cookie ? { cookie } : {}) } });
  const sc = res.headers.get("set-cookie");
  if (sc) cookie = sc.split(";")[0];
  return res;
}
const post = (p, b) => call(p, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(b) });

// session
await call("/api/me");

// 1) YAML spec parsing
const YAML_SPEC = `openapi: 3.0.0
info:
  title: YAML Test API
  version: 1.0.0
servers:
  - url: https://api.yamltest.com
paths:
  /things:
    get:
      operationId: listThings
      summary: List things
  /things/{id}:
    get:
      operationId: getThing
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string`;
let r = await post("/api/parse", { spec: YAML_SPEC });
let j = await r.json();
if (!r.ok || j.ir.tools.length !== 2) throw new Error("YAML parse failed: " + JSON.stringify(j));
console.log(`✓ YAML parse -> "${j.ir.title}" (${j.ir.tools.length} tools)`);

// 2) history gated to Pro (currently free)
r = await call("/api/generations");
if (r.status !== 402) throw new Error(`free history expected 402, got ${r.status}`);
console.log("✓ history (free) -> 402 gated");

// 3) upgrade to pro, parse petstore, generate (persists), list, download
await post("/api/dev/set-plan", { plan: "pro" });
r = await post("/api/parse", { specUrl: "https://petstore3.swagger.io/api/v3/openapi.json" });
const ir = (await r.json()).ir;
r = await post("/api/generate", { ir, selectedTools: ir.tools.slice(0, 5).map((t) => t.name) });
const gen = await r.json();
if (!gen.generationId) throw new Error("no generationId returned");
console.log(`✓ generate (pro) persisted -> generationId ${gen.generationId.slice(0, 8)}…`);

r = await call("/api/generations");
const list = (await r.json()).generations;
if (!list?.length) throw new Error("history empty after generate");
console.log(`✓ history (pro) -> ${list.length} saved`);

r = await call(`/api/generations/${list[0].id}/download`);
const buf = Buffer.from(await r.arrayBuffer());
if (buf.subarray(0, 2).toString() !== "PK") throw new Error("history download not a zip");
console.log(`✓ history download -> valid zip (${buf.length} bytes)`);

// 4) GitHub push guard: pro but no token -> 400
r = await post("/api/github/push", { generationId: gen.generationId, repoName: "x" });
if (r.status !== 400) throw new Error(`github push (no token) expected 400, got ${r.status}`);
console.log(`✓ github push without token -> 400 (${(await r.json()).error.code})`);

// 5) GitHub push guard: free -> 402
await post("/api/dev/set-plan", { plan: "free" });
r = await post("/api/github/push", { generationId: gen.generationId, repoName: "x", token: "fake" });
if (r.status !== 402) throw new Error(`github push (free) expected 402, got ${r.status}`);
console.log(`✓ github push as free -> 402 gated`);

console.log("\n✅ Features smoke PASSED");
