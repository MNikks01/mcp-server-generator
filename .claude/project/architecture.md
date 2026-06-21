# Architecture — MCP Server Generator

Parse OpenAPI -> IR -> generate a runnable MCP server (env auth, zod validation, good tool descriptions) as a file map. CLI + web (free + paid).

**Shape:** a pure-TypeScript **engine** (`mcpforge/src`, zero-network, zero-dep) wrapped by thin adapters: mcpforge/ (engine), mcpforge/src/cli.ts (CLI), web/ (Next.js app).

- **Engine = single source of truth.** Surfaces never duplicate logic; they call the engine.
- Generated copies (e.g. `web/lib/engine`) are produced by a sync script and kept in lock-step (drift-checked in CI).
- Real external services (LLM, embeddings, Stripe, Postgres/pgvector, OTel) are swapped in behind interfaces/env; nothing is required to run the dev/test path.

Key modules: `ir/types`, `openapi/parse`, `generator/descriptions`, `generator/server-template`, `generator/project-files`, `generator/build`, `output/write`, `cli`.

See the root `ARCHITECTURE.md` for the full product/scale design.
