// Phase A hardening — generate from every example spec and assert the output is
// well-formed (parses, produces all files, generated server is syntactically valid TS,
// auth branch matches the spec). Fast, no network, no installs.
//
//   node scripts/test-specs.ts

import { readFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";
import { writeFile, mkdir } from "node:fs/promises";
import { parseOpenApi } from "../src/openapi/parse.ts";
import { build } from "../src/generator/build.ts";
import { writeFiles } from "../src/output/write.ts";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");

const cases = [
  { file: "petstore.json", expectAuth: "apiKey", minTools: 4 },
  { file: "notes-bearer.json", expectAuth: "bearer", minTools: 4 },
  { file: "quotes-noauth.json", expectAuth: "none", minTools: 2 },
];

let failures = 0;
const REQUIRED_FILES = ["src/index.ts", "package.json", "tsconfig.json", "README.md", "mcp.json", ".env.example", ".gitignore"];

for (const c of cases) {
  const label = c.file.padEnd(20);
  try {
    const raw = await readFile(join(root, "examples", c.file), "utf8");
    const ir = parseOpenApi(raw);

    // assert: auth + tool count
    if (ir.security.type !== c.expectAuth) throw new Error(`auth ${ir.security.type} != ${c.expectAuth}`);
    if (ir.tools.length < c.minTools) throw new Error(`${ir.tools.length} tools < ${c.minTools}`);

    const result = await build(ir);

    // assert: all files present + descriptions for every tool
    for (const f of REQUIRED_FILES) if (!(f in result.files)) throw new Error(`missing file ${f}`);
    for (const t of ir.tools) if (!result.descriptions[t.name]) throw new Error(`missing description ${t.name}`);

    // assert: no secrets hard-coded; auth read from env when expected
    const code = result.files["src/index.ts"];
    if (c.expectAuth !== "none" && !/process\.env\.(API_KEY|API_TOKEN)/.test(code)) {
      throw new Error("expected auth from env, not found");
    }

    // assert: generated server is syntactically valid TS (type-stripped --check)
    const outDir = join(root, "generated", result.name);
    await writeFiles(outDir, result.files);
    execFileSync(process.execPath, ["--check", join(outDir, "src/index.ts")], { stdio: "pipe" });

    console.log(`✓ ${label} -> ${result.name}: ${ir.tools.length} tools, auth=${ir.security.type}, ${Object.keys(result.files).length} files, syntax OK`);
  } catch (e) {
    failures++;
    console.log(`✗ ${label} FAILED: ${(e as Error).message}`);
  }
}

console.log(failures === 0 ? "\n✅ All spec cases passed." : `\n❌ ${failures} case(s) failed.`);
process.exit(failures === 0 ? 0 : 1);
