#!/usr/bin/env node
// MCPForge CLI — the first shippable surface (and the OSS funnel asset, per GTM.md).
//   mcpforge <spec.json|url> [-o <dir>] [--stdout] [--llm]
// Turns an OpenAPI 3 spec into a runnable MCP server on disk.

import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { parseOpenApi, ParseError } from "./openapi/parse.ts";
import { build } from "./generator/build.ts";
import { writeFiles } from "./output/write.ts";

const HELP = `mcpforge — turn an OpenAPI spec into a production-ready MCP server

Usage:
  mcpforge <spec.json | https://.../openapi.json> [options]

Options:
  -o, --out <dir>   Output directory (default: ./<server-name>)
  --stdout          Print the generated src/index.ts to stdout (don't write files)
  --llm             Use Claude for premium tool descriptions (needs ANTHROPIC_API_KEY)
  -h, --help        Show this help

Examples:
  mcpforge ./openapi.json
  mcpforge https://petstore3.swagger.io/api/v3/openapi.json -o ./petstore-mcp
`;

interface Args { spec?: string; out?: string; stdout: boolean; llm: boolean; help: boolean; }

function parseArgs(argv: string[]): Args {
  const a: Args = { stdout: false, llm: false, help: false };
  for (let i = 0; i < argv.length; i++) {
    const t = argv[i];
    if (t === "-h" || t === "--help") a.help = true;
    else if (t === "--stdout") a.stdout = true;
    else if (t === "--llm") a.llm = true;
    else if (t === "-o" || t === "--out") a.out = argv[++i];
    else if (!t.startsWith("-") && !a.spec) a.spec = t;
  }
  return a;
}

async function loadSpec(spec: string): Promise<string> {
  if (/^https?:\/\//.test(spec)) {
    const res = await fetch(spec, { signal: AbortSignal.timeout(15000) });
    if (!res.ok) throw new Error(`Could not fetch spec (${res.status}) from ${spec}`);
    return await res.text();
  }
  return await readFile(resolve(spec), "utf8");
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  if (args.help || !args.spec) {
    process.stdout.write(HELP);
    process.exit(args.help ? 0 : 1);
  }
  if (args.llm) process.env.USE_LLM = "1";

  let ir;
  try {
    ir = parseOpenApi(await loadSpec(args.spec!));
  } catch (e) {
    const msg = e instanceof ParseError ? e.message : (e as Error).message;
    process.stderr.write(`✗ ${msg}\n`);
    process.exit(1);
  }

  const result = await build(ir);

  if (args.stdout) {
    process.stdout.write(result.files["src/index.ts"]);
    return;
  }

  const outDir = resolve(args.out ?? `./${result.name}`);
  await writeFiles(outDir, result.files);

  process.stdout.write(
    `✓ Generated MCP server "${result.name}" (${result.toolCount} tools) -> ${outDir}\n\n` +
      `  Tools: ${Object.keys(result.descriptions).join(", ")}\n\n` +
      `  Next:\n` +
      `    cd ${outDir}\n` +
      `    npm install && npm run build && node dist/index.js\n` +
      `    # then add mcp.json to Claude Desktop\n`,
  );
}

main().catch((e) => {
  process.stderr.write(`✗ ${(e as Error).message}\n`);
  process.exit(1);
});
