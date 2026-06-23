// Single source of truth = mcpforge/src. The web app can't import it directly
// (Turbopack won't resolve files outside its root, and Node's native-TS CLI requires
// .ts import extensions that the bundler rejects). So web/lib/engine is a GENERATED
// copy with the .ts import extensions stripped for the bundler.
//
//   node mcpforge/scripts/sync-engine.mjs          # regenerate web/lib/engine
//   node mcpforge/scripts/sync-engine.mjs --check   # fail (exit 1) if out of sync
//
// Run this after changing anything in mcpforge/src.

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, resolve, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const srcRoot = resolve(here, "../src");
const destRoot = resolve(here, "../../web/lib/engine");

// Files the web app needs (cli.ts, output/write.ts, and codebase/walk.ts are CLI-only).
// The codebase trio (types/discover/scan) is the pure, fs-free scanner path the web
// /api/scan route uses; walk.ts is excluded because it imports node:fs.
const FILES = [
  "ir/types.ts",
  "openapi/parse.ts",
  "generator/descriptions.ts",
  "generator/server-template.ts",
  "generator/project-files.ts",
  "generator/build.ts",
  "codebase/types.ts",
  "codebase/discover.ts",
  "codebase/scan.ts",
];

function transform(rel, content) {
  const stripped = content.replace(/from "(\.\.?\/[^"]+?)\.ts"/g, 'from "$1"');
  const header =
    `// GENERATED from mcpforge/src/${rel} — DO NOT EDIT.\n` +
    `// Single source of truth: mcpforge/src. Regenerate via: node mcpforge/scripts/sync-engine.mjs\n\n`;
  return header + stripped;
}

const check = process.argv.includes("--check");
let drift = 0;

for (const rel of FILES) {
  const generated = transform(rel, await readFile(join(srcRoot, rel), "utf8"));
  const destPath = join(destRoot, rel);
  if (check) {
    let existing = "";
    try {
      existing = await readFile(destPath, "utf8");
    } catch {
      /* missing */
    }
    if (existing !== generated) {
      drift++;
      console.log(`✗ out of sync: web/lib/engine/${rel}`);
    }
  } else {
    await mkdir(dirname(destPath), { recursive: true });
    await writeFile(destPath, generated, "utf8");
    console.log(`✓ wrote web/lib/engine/${rel}`);
  }
}

if (check) {
  console.log(drift === 0 ? "\n✅ engine copy is in sync." : `\n❌ ${drift} file(s) out of sync — run: node mcpforge/scripts/sync-engine.mjs`);
  process.exit(drift === 0 ? 0 : 1);
}
console.log("\n✅ synced web/lib/engine from mcpforge/src");
