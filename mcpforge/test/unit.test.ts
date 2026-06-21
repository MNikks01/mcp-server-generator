import { test } from "node:test";
import assert from "node:assert/strict";
import { parseOpenApi } from "../src/openapi/parse.ts";
import { packageJson, mcpJson } from "../src/generator/project-files.ts";
import { SpecDerivedDescriptions } from "../src/generator/descriptions.ts";

const SPEC = {
  openapi: "3.0.0",
  info: { title: "Notes API", version: "1.0.0" },
  servers: [{ url: "https://api.notes.com" }],
  components: { securitySchemes: { bearerAuth: { type: "http", scheme: "bearer" } } },
  security: [{ bearerAuth: [] }],
  paths: {
    "/notes": {
      get: { operationId: "listNotes", summary: "List notes" },
      post: { operationId: "createNote", summary: "Create a note", requestBody: { content: { "application/json": { schema: { type: "object", properties: { text: { type: "string" } } } } } } },
    },
    "/notes/{id}": {
      get: { operationId: "getNote", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }] },
    },
  },
};

test("parse: OpenAPI -> IR (tools, snake_case names, bearer auth)", () => {
  const ir = parseOpenApi(SPEC);
  assert.equal(ir.tools.length, 3);
  assert.equal(ir.security.type, "bearer");
  assert.ok(ir.tools.some((t) => t.name === "create_note" && t.sideEffecting));
  assert.ok(ir.tools.some((t) => t.name === "list_notes" && !t.sideEffecting));
  const get = ir.tools.find((t) => t.name === "get_note");
  assert.ok(get?.params.some((p) => p.in === "path" && p.name === "id"));
});

test("project-files: package.json + mcp.json are coherent", () => {
  const ir = parseOpenApi(SPEC);
  const pkg = JSON.parse(packageJson("notes-api"));
  assert.ok(pkg.dependencies["@modelcontextprotocol/sdk"]);
  const mcp = JSON.parse(mcpJson("notes-api", ir));
  assert.ok(mcp.mcpServers);
});

test("descriptions: spec-derived describe() returns a non-empty string (zero-network floor)", async () => {
  const ir = parseOpenApi(SPEC);
  const gen = new SpecDerivedDescriptions();
  const desc = await gen.describe(ir.tools[0], ir);
  assert.ok(typeof desc === "string" && desc.length > 10);
});
