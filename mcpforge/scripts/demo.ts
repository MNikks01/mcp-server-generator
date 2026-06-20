// Phase A end-to-end demo (BUILD_ORDER item 8 + the Phase A gate).
// Runs the full pipeline on a real-ish OpenAPI spec and writes a complete, runnable
// MCP server to ./generated/<name>/. Zero network, zero deps (spec-derived descriptions).
//
//   node scripts/demo.ts                 # uses examples/petstore.json
//   node scripts/demo.ts <path-to-spec>  # any OpenAPI 3 JSON
//   USE_LLM=1 ANTHROPIC_API_KEY=... node scripts/demo.ts   # premium descriptions

import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";
import { parseOpenApi } from "../src/openapi/parse.ts";
import { build } from "../src/generator/build.ts";
import { writeFiles } from "../src/output/write.ts";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");

const specArg = process.argv[2];
const specPath = specArg ? resolve(specArg) : join(root, "examples", "petstore.json");

const t0 = Date.now();
const raw = await readFile(specPath, "utf8");

// 1) parse -> IR
const ir = parseOpenApi(raw);
console.log(`\n▸ Parsed "${ir.title}" v${ir.version}`);
console.log(`  baseUrl: ${ir.baseUrl}`);
console.log(`  security: ${ir.security.type}`);
console.log(`  ${ir.tools.length} operations -> tools:`);
for (const t of ir.tools) {
  console.log(`    - ${t.name.padEnd(20)} ${t.method.padEnd(6)} ${t.path}${t.sideEffecting ? "  [side-effecting]" : ""}`);
}

// 2) build (descriptions + code + project files)
const result = await build(ir);

// 3) write to disk
const outDir = join(root, "generated", result.name);
await writeFiles(outDir, result.files);

const ms = Date.now() - t0;
console.log(`\n▸ Generated ${Object.keys(result.files).length} files in ${ms}ms -> generated/${result.name}/`);
console.log(`  files: ${Object.keys(result.files).join(", ")}`);

console.log(`\n▸ Sample tool descriptions (the differentiator):`);
for (const [name, desc] of Object.entries(result.descriptions)) {
  console.log(`  • ${name}:\n      ${desc}`);
}

console.log(`\n▸ Generated src/index.ts (first 30 lines):`);
console.log(
  result.files["src/index.ts"]
    .split("\n")
    .slice(0, 30)
    .map((l) => "  | " + l)
    .join("\n"),
);

console.log(`\n✅ Phase A pipeline complete. Inspect: generated/${result.name}/\n`);
