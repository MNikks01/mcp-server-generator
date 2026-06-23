// Smoke test for the features: YAML parsing, saved history, and the GitHub-push
// token guard. MCPForge is free & open source — history and GitHub push are
// available to every session (no plan gating).
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

// 2) generate (persists to history) — unlimited, no plan needed
r = await post("/api/parse", { specUrl: "https://petstore3.swagger.io/api/v3/openapi.json" });
const ir = (await r.json()).ir;
r = await post("/api/generate", { ir, selectedTools: ir.tools.map((t) => t.name) });
if (r.status !== 200) throw new Error(`generate (all ${ir.tools.length} tools) expected 200, got ${r.status}`);
const gen = await r.json();
if (!gen.generationId) throw new Error("no generationId returned");
console.log(`✓ generate (${ir.tools.length} tools, unlimited) persisted -> ${gen.generationId.slice(0, 8)}…`);

// 3) history available to everyone
r = await call("/api/generations");
const list = (await r.json()).generations;
if (!list?.length) throw new Error("history empty after generate");
console.log(`✓ history -> ${list.length} saved (free, no gating)`);

// 4) history download
r = await call(`/api/generations/${list[0].id}/download`);
const buf = Buffer.from(await r.arrayBuffer());
if (buf.subarray(0, 2).toString() !== "PK") throw new Error("history download not a zip");
console.log(`✓ history download -> valid zip (${buf.length} bytes)`);

// 5) GitHub push guard: no token -> 400 (only remaining guard; not a paywall)
r = await post("/api/github/push", { generationId: gen.generationId, repoName: "x" });
if (r.status !== 400) throw new Error(`github push (no token) expected 400, got ${r.status}`);
console.log(`✓ github push without token -> 400 (${(await r.json()).error.code})`);

console.log("\n✅ Features smoke PASSED");
