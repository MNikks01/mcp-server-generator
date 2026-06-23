#!/usr/bin/env node
// MCPForge CLI — the first shippable surface (and the OSS funnel asset, per GTM.md).
//   mcpforge <spec.json|url> [-o <dir>] [--stdout] [--llm]      (OpenAPI -> MCP server)
//   mcpforge scan <dir>      [-o <dir>] [--llm] [--base-url u]   (codebase -> MCP server)
// A directory argument auto-selects scan mode, so `mcpforge ./my-app` also works.

import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { statSync } from "node:fs";
import { parseOpenApi, ParseError } from "./openapi/parse.ts";
import { scanCodebase, ScanError } from "./codebase/scan.ts";
import { build } from "./generator/build.ts";
import { writeFiles } from "./output/write.ts";

const HELP = `mcpforge — turn an OpenAPI spec OR your codebase into a production-ready MCP server

Usage:
  mcpforge <spec.json | https://.../openapi.json> [options]   # from an OpenAPI spec
  mcpforge scan <dir> [options]                               # from your codebase
  mcpforge <dir> [options]                                    # (scan, auto-detected)

Options:
  -o, --out <dir>    Output directory (default: ./<server-name>)
  --base-url <url>   Base URL the generated server calls (scan mode; default http://localhost:3000)
  --stdout           Print the generated src/index.ts to stdout (don't write files)
  --llm              Use Claude for premium tool descriptions (needs ANTHROPIC_API_KEY)
  -h, --help         Show this help

Scan understands: Express/Node, Next.js (app router + pages/api), Fastify, NestJS, FastAPI, Flask.

Examples:
  mcpforge ./openapi.json
  mcpforge https://petstore3.swagger.io/api/v3/openapi.json -o ./petstore-mcp
  mcpforge scan ./my-express-app
  mcpforge scan . --base-url https://api.myapp.com --llm
`;

interface Args {
  mode: "auto" | "scan";
  input?: string;
  out?: string;
  baseUrl?: string;
  stdout: boolean;
  llm: boolean;
  help: boolean;
}

function parseArgs(argv: string[]): Args {
  const a: Args = { mode: "auto", stdout: false, llm: false, help: false };
  if (argv[0] === "scan") {
    a.mode = "scan";
    argv = argv.slice(1);
  }
  for (let i = 0; i < argv.length; i++) {
    const t = argv[i];
    if (t === "-h" || t === "--help") a.help = true;
    else if (t === "--stdout") a.stdout = true;
    else if (t === "--llm") a.llm = true;
    else if (t === "-o" || t === "--out") a.out = argv[++i];
    else if (t === "--base-url") a.baseUrl = argv[++i];
    else if (!t.startsWith("-") && !a.input) a.input = t;
  }
  return a;
}

function isDirectory(p: string): boolean {
  try {
    return statSync(p).isDirectory();
  } catch {
    return false;
  }
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
  if (args.help || !args.input) {
    process.stdout.write(HELP);
    process.exit(args.help ? 0 : 1);
  }
  if (args.llm) process.env.USE_LLM = "1";

  const useScan = args.mode === "scan" || (!/^https?:\/\//.test(args.input!) && isDirectory(args.input!));

  let ir;
  try {
    ir = useScan
      ? scanCodebase(resolve(args.input!), { baseUrl: args.baseUrl })
      : parseOpenApi(await loadSpec(args.input!));
  } catch (e) {
    const msg = e instanceof ParseError || e instanceof ScanError ? e.message : (e as Error).message;
    process.stderr.write(`✗ ${msg}\n`);
    process.exit(1);
  }

  if (useScan) {
    process.stdout.write(`✓ Scanned codebase: discovered ${ir.tools.length} routes -> ${ir.tools.length} MCP tools\n`);
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
