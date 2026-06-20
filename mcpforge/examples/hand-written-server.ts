// BUILD_ORDER.md item #2 — "Hand-write ONE MCP server" (the learn-the-SDK artifact).
// This is the SHAPE the generator targets. It does not run here (it needs the SDK
// installed), but it documents exactly what we generate. Keeping it as a reference
// makes the code-generation step (server-template.ts) obvious.
//
// To actually run this: `npm i @modelcontextprotocol/sdk zod` then build + add to
// Claude Desktop via an mcp.json that points `node` at the compiled file.

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const BASE = process.env.API_BASE_URL ?? "https://petstore3.swagger.io/api/v3";
const TOKEN = process.env.API_TOKEN; // from .env — NEVER hard-coded

const server = new McpServer({ name: "petstore-handwritten", version: "1.0.0" });

server.tool(
  "get_pet_by_id",
  // The description is what the LLM uses to decide whether/how to call the tool.
  "Fetch a single pet by its id. Use when the user asks about one specific pet. " +
    "Do NOT use to list or search pets. Returns the pet's id, name, and status.",
  { petId: z.number().describe("The id of the pet to fetch") },
  async ({ petId }) => {
    const res = await fetch(`${BASE}/pet/${encodeURIComponent(String(petId))}`, {
      headers: TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {},
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) {
      return {
        content: [{ type: "text", text: `Error ${res.status}: ${await res.text()}` }],
        isError: true,
      };
    }
    return { content: [{ type: "text", text: JSON.stringify(await res.json()) }] };
  },
);

await server.connect(new StdioServerTransport());
