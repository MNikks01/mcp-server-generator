# MCPForge — generation engine (Phase A) ✅

## Install & CLI

turn an OpenAPI spec OR your codebase into a production-ready MCP server. Requires Node ≥23.6 (runs on Node's native TypeScript).

```bash
npm i -g @mnikks01/mcpforge    # then run `mcpforge …`, or use npx without installing:
npx @mnikks01/mcpforge scan ./my-app                 # codebase -> MCP server
npx @mnikks01/mcpforge scan . --base-url https://api.myapp.com --llm
npx @mnikks01/mcpforge ./openapi.json               # OpenAPI spec -> MCP server
npx @mnikks01/mcpforge https://petstore3.swagger.io/api/v3/openapi.json -o ./out
```


The core of the MCP Server Generator: **OpenAPI spec → production-ready MCP server.** This is the implementation of [BUILD_ORDER.md](../BUILD_ORDER.md) **Phase A** (the engine), built before any UI. Pure TypeScript, runs on **Node 24 native TS**, **zero runtime dependencies**.

## Status: Phase A gate PASSED + hardened
Proven end-to-end on 2026-06-20 across **3 crafted specs (apiKey / bearer / no-auth)** and the **live Swagger Petstore spec (19 tools, full `$ref`s)**:
- ✅ Parses OpenAPI 3 (incl. local `$ref` resolution, security schemes) → IR.
- ✅ Maps operations → tools (correct names, methods, path/query/body params, side-effect flags).
- ✅ Generates LLM-style tool descriptions (what / when / when-not / returns) — works with **zero network** via the spec-derived fallback; upgrades to Claude when `--llm` (+ `ANTHROPIC_API_KEY`).
- ✅ Emits a complete runnable project (`src/index.ts`, `package.json`, `tsconfig.json`, `README.md`, `mcp.json`, `.env.example`, `.gitignore`).
- ✅ Generated servers **typecheck against the real `@modelcontextprotocol/sdk` + `zod`** (`tsc --noEmit`) — including the 19-tool real-world server.
- ✅ Generated servers **boot and speak MCP** — complete `initialize` and advertise tools over stdio JSON-RPC (`scripts/smoke-mcp.ts`).
- ✅ Auth branches verified: apiKey→header, bearer→`Authorization`, none→no token. **No secrets in generated code** (auth from env).
- ✅ **CLI shipped** (`mcpforge <spec|url>`) — the first user-facing surface + OSS funnel asset.

## Run it
```bash
# CLI — generate from a file or a URL
node src/cli.ts examples/petstore.json -o ./pet-mcp
node src/cli.ts https://petstore3.swagger.io/api/v3/openapi.json -o ./petstore
node src/cli.ts <spec> --stdout        # print src/index.ts
node src/cli.ts <spec> --llm           # premium descriptions (needs ANTHROPIC_API_KEY)

# demo (writes to ./generated/<name>/)
node scripts/demo.ts [spec.json]

# tests — generate + validate across all example specs
node scripts/test-specs.ts

# prove a generated server actually runs over MCP
cd generated/pet-store && npm install && npx tsc && cd ../..
node scripts/smoke-mcp.ts generated/pet-store/dist/index.js
```

## Structure (maps to the eventual Next.js `lib/`)
```
src/
  ir/types.ts            # the IR (keystone abstraction)
  openapi/parse.ts       # OpenAPI 3 -> IR (focused; swap to swagger-parser for full coverage)
  generator/
    descriptions.ts      # tool descriptions (spec-derived fallback + optional Claude)
    server-template.ts   # IR -> src/index.ts (the core codegen)
    project-files.ts     # package.json/tsconfig/README/mcp.json/.env/.gitignore
    build.ts             # orchestrator: IR -> file map
  output/write.ts        # file map -> disk (web layer will zip instead)
examples/
  petstore.json          # sample spec (path/query/body params, apiKey, $ref)
  hand-written-server.ts # BUILD_ORDER item 2: the learn-the-SDK reference
scripts/
  demo.ts                # Phase A end-to-end pipeline
  smoke-mcp.ts           # drives a generated server over MCP stdio
```

## What's next (per [BUILD_ORDER.md](../BUILD_ORDER.md))
- **Finish Phase A hardening:** test against 2–3 more real specs (bearer auth, no-auth, larger specs); swap the focused parser for `@apidevtools/swagger-parser` for full OpenAPI/YAML coverage.
- **Phase B:** wrap this engine in the Next.js app (`/api/parse`, `/api/generate` SSE, preview, ZIP download), deploy to Vercel, launch the free generator → first users.
- **Then:** monetization (auth/Stripe/Pro) *or* done-for-you for first ₹10,000.

## Single source of truth
`mcpforge/src` is the **canonical** engine. The web app uses a **generated** copy at `web/lib/engine/` (imports stripped of `.ts` extensions for the bundler). After any change to `src/`, run:
```bash
npm run sync-engine          # regenerate web/lib/engine
npm run sync-engine:check    # CI guard: exit 1 if the copy drifted
```
Edit `src/` only — `web/lib/engine/` files are marked `// GENERATED — DO NOT EDIT`.

> Production notes vs. this Phase-A engine: real build uses `@apidevtools/swagger-parser` (full deref + OpenAPI 2.0 + YAML), pins the SDK version, and pipes descriptions through Claude by default for Pro. The IR contract stays identical, so nothing downstream changes.
