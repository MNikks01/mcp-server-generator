# MCP Server Generator — MCP ARCHITECTURE (the output contract)

> MCP is the entire product. This document specifies **what we generate** and **how the generated servers conform to MCP** — the contract that makes the output "production-ready, not a toy." Protocol fundamentals: MCP_GUIDE.md. Build plan: [MVP.md](./MVP.md).

## 1. Executive Summary

The MVP generates **MCP servers in TypeScript using the official `@modelcontextprotocol/sdk` (version-pinned)** from an OpenAPI spec. Each API operation becomes a **tool** with an LLM-written description and a Zod input schema; the server scaffolds auth from the spec's `security`, validates inputs, returns structured errors, and ships with a `README.md` and a ready-to-use `mcp.json`. The defining quality bar — the thing that separates us from generic converters — is **tool-description quality**: the descriptions tell the model *what the tool does, when to use it, when not to, and what it returns*, because that text (not the code) is what the LLM uses to call tools correctly. The MVP supports **stdio transport** (local; works immediately in Claude Desktop/Cursor); HTTP/streamable transport is a fast-follow for remote use. We generate **tools** in the MVP; **resources** and **prompts** are simple post-MVP additions.

---

## 2. What a generated server contains

```
my-server/
├── src/index.ts        # McpServer + one server.tool() per selected operation
├── package.json        # pins @modelcontextprotocol/sdk + zod
├── tsconfig.json
├── README.md           # how to run + how to add to Claude Desktop
├── mcp.json            # ready-to-paste client config
├── .env.example        # API_BASE_URL, AUTH token var(s) — never real secrets
└── .gitignore          # ignores .env
```

## 3. Operation → tool mapping

| OpenAPI | → MCP | Side-effect flag |
|---------|-------|------------------|
| `GET /orders/{id}` | tool `get_order` (query) | no |
| `POST /orders` | tool `create_order` | **yes** (flagged; HITL-gateable later) |
| `PUT/PATCH/DELETE …` | tool | **yes** |
| Path/query/body params | Zod input schema fields | — |
| `securitySchemes` | env-based auth header injection | — |

Tool names derive from `operationId` (or `method_path`), sanitized. Inputs become a Zod object validated before the upstream call.

## 4. The tool-description contract (the moat)

For every tool, the LLM generates a description following a fixed structure, e.g.:

> `search_orders` — *"Search a customer's orders by status and date range. Use when the user asks about order history or status. Do NOT use to create or modify orders (use create_order). Returns up to 50 orders with id, status, total, and date."*

Plus per-parameter docs. The generation prompt encodes the MCP best-practice from MCP_GUIDE.md §3: **what / when / when-not / returns + examples.** Output is shape-validated; on LLM failure we fall back to spec-derived text (never block generation). Pro tier uses a stronger model for higher-quality descriptions.

## 5. Generated `src/index.ts` (shape)

```ts
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const BASE = process.env.API_BASE_URL!;
const TOKEN = process.env.API_TOKEN; // from .env, never hard-coded

const server = new McpServer({ name: "acme-api", version: "1.0.0" });

server.tool(
  "get_order",
  "Fetch a single order by id. Use when the user asks about one specific order. Returns the order's status, total, and items.",
  { id: z.string().describe("The order id") },
  async ({ id }) => {
    const res = await fetch(`${BASE}/orders/${encodeURIComponent(id)}`, {
      headers: TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {},
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return { content: [{ type: "text", text: `Error ${res.status}: ${await res.text()}` }], isError: true };
    return { content: [{ type: "text", text: JSON.stringify(await res.json()) }] };
  }
);

await server.connect(new StdioServerTransport());
```
Generated code: typed, validated, auth-from-env, timeouts, structured errors. No secrets. Runs in Claude Desktop via the generated `mcp.json`.

## 6. Generated `mcp.json`
```json
{ "mcpServers": { "acme-api": {
  "command": "node",
  "args": ["./my-server/dist/index.js"],
  "env": { "API_BASE_URL": "https://api.acme.com", "API_TOKEN": "${API_TOKEN}" }
}}}
```

## 7. Transports
- **MVP: stdio** — local subprocess; works immediately in Claude Desktop / Cursor; zero infra. This is enough to validate demand.
- **Fast-follow: HTTP / streamable HTTP** — for remote/multi-user use; the on-ramp to the *hosting* monetization (v1).

## 8. MVP scope vs. later
- **MVP:** tools only, stdio, OpenAPI input, secure-by-default scaffold, LLM descriptions.
- **Later:** resources (`GET` → readable resource) + prompts; HTTP transport + hosting; more inputs (Postgres/GraphQL/codebase); description quality score; injection-hardened descriptions. (See [FEATURES.md](./FEATURES.md).)

## 9. Why this is "production-ready, not a toy"
Auth scaffolded from the spec, inputs validated, errors structured, secrets externalized, the official SDK pinned, and — crucially — **descriptions good enough that the model uses the tools correctly**. A generic converter skips most of this; that gap is the product.

## 10. Related Documents
[MVP.md](./MVP.md) · [ARCHITECTURE.md](./ARCHITECTURE.md) · [SECURITY.md](./SECURITY.md) · MCP_GUIDE.md

*Last reviewed 2026-06-20.*
