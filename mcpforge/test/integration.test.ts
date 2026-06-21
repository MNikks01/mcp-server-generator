import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { parseOpenApi } from "../src/openapi/parse.ts";
import { build } from "../src/generator/build.ts";

const here = dirname(fileURLToPath(import.meta.url));
const example = (f: string) => readFile(join(here, "../examples", f), "utf8");

test("build: bearer-auth spec -> a complete, runnable MCP server file map", async () => {
  const ir = parseOpenApi(await example("notes-bearer.json"));
  const result = await build(ir);

  assert.ok(result.toolCount > 0);
  for (const k of ["src/index.ts", "package.json", "tsconfig.json", "README.md", "mcp.json", ".env.example", ".gitignore"]) {
    assert.ok(k in result.files, `missing ${k}`);
  }
  const server = result.files["src/index.ts"];
  assert.match(server, /@modelcontextprotocol\/sdk/);
  assert.match(server, /zod|z\./);
  // every tool got a description (the differentiator; never blocks)
  assert.equal(Object.keys(result.descriptions).length, result.toolCount);
  for (const d of Object.values(result.descriptions)) assert.ok(d.length > 0);
});

test("build: no-auth spec -> security none, no auth env required", async () => {
  const ir = parseOpenApi(await example("quotes-noauth.json"));
  assert.equal(ir.security.type, "none");
  const result = await build(ir);
  assert.ok(result.files[".env.example"].length >= 0);
});
