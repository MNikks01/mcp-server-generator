// End-to-end web API proof: drives the running Next server through the full flow
// (parse -> generate -> download) + checks the SSRF guard. No browser needed.
const BASE = process.env.BASE || "http://localhost:3939";
const post = (path, body) =>
  fetch(BASE + path, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });

// 1) parse a real public spec via URL (exercises fetch + SSRF allow + real parse)
let r = await post("/api/parse", { specUrl: "https://petstore3.swagger.io/api/v3/openapi.json" });
let j = await r.json();
if (!r.ok) throw new Error("parse failed: " + JSON.stringify(j));
console.log(`✓ /api/parse  -> "${j.ir.title}" ${j.ir.tools.length} tools, auth=${j.ir.security.type}`);

// 2) generate from a subset of tools
const selectedTools = j.ir.tools.slice(0, 3).map((t) => t.name);
r = await post("/api/generate", { ir: j.ir, selectedTools });
const g = await r.json();
if (!r.ok) throw new Error("generate failed: " + JSON.stringify(g));
if (!g.files["src/index.ts"].includes("McpServer")) throw new Error("no server code emitted");
console.log(`✓ /api/generate -> "${g.name}" ${g.toolCount} tools, ${Object.keys(g.files).length} files`);
console.log(`    sample description: ${Object.values(g.descriptions)[0]}`);

// 3) download a real zip
r = await post("/api/download", { ir: j.ir, selectedTools });
const buf = Buffer.from(await r.arrayBuffer());
if (buf.subarray(0, 2).toString() !== "PK") throw new Error("not a zip");
console.log(`✓ /api/download -> ${r.headers.get("content-type")}, ${buf.length} bytes (valid zip)`);

// 4) SSRF guard blocks internal hosts
r = await post("/api/parse", { specUrl: "http://169.254.169.254/latest/meta-data/" });
if (r.ok) throw new Error("SSRF guard FAILED — internal host was allowed!");
console.log(`✓ SSRF guard blocks internal host (status ${r.status})`);

// 5) invalid spec -> clean 400
r = await post("/api/parse", { spec: "{ not valid openapi }" });
if (r.status !== 400) throw new Error("expected 400 for invalid spec");
console.log(`✓ invalid spec -> clean 400`);

console.log("\n✅ Web API end-to-end PASSED");
