# AGENTS.md — MCP Server Generator

Standard agent-instructions file. Claude-specific: [CLAUDE.md](./CLAUDE.md). Agent *architecture*: [AGENT_DESIGN.md](./AGENT_DESIGN.md).

## Project
MCP Server Generator — generate production-ready MCP servers from OpenAPI/Postgres/GraphQL/codebase. The wedge (build first). Spec-first (D-011).

## Setup
```bash
pnpm install
docker compose up -d     # Postgres, Redis, otel
pnpm db:migrate
pnpm dev                 # web + api + generation workers
# CLI:
pnpm --filter cli build && node apps/cli/dist/index.js openapi ./spec.yaml
```

## Conventions
- TypeScript everywhere (D-005); generated servers are TS (Python later).
- Turborepo + pnpm; engine in `packages/generator` + `packages/templates`; shared `packages/{llm,mcp,db}`.
- All inputs normalize to the **IR** (`packages/generator/ir`). Add an input type = add a parser → IR.
- Generated code uses official `@modelcontextprotocol/sdk` (pinned).
- LLM calls only via `packages/llm` (D-003). Inputs validated (Zod). Errors problem+json.

## Build & test
- `pnpm test` (unit) · `pnpm test:eval` (**functional: generated servers compile + an LLM calls tools correctly — the quality gate**) · `pnpm lint && pnpm typecheck`.

## Rules of engagement
1. Production-ready output only: auth, validation, rate limits, timeouts, structured errors, observability.
2. Secrets never embedded — env/vault references.
3. Generation runs sandboxed (untrusted input).
4. Tool descriptions: what/when/when-not/returns + params + example; injection-aware.
5. Trace + cost LLM calls.
6. Don't regress the functional eval.
7. Update the relevant `.md` when behavior changes.

## Where things live
MCP (deepest): [MCP.md](./MCP.md) · Pipeline/IR: [ARCHITECTURE.md](./ARCHITECTURE.md) · Descriptions: [AI_ARCHITECTURE.md](./AI_ARCHITECTURE.md) · Data: [DATABASE.md](./DATABASE.md) · API/CLI: [API_DESIGN.md](./API_DESIGN.md) · Work: [TASKS.md](./TASKS.md), [SPRINTS.md](./SPRINTS.md) · Safety: [SECURITY.md](./SECURITY.md), [GUARDRAILS.md](./GUARDRAILS.md), [OBSERVABILITY.md](./OBSERVABILITY.md), [DEVOPS.md](./DEVOPS.md).

## Definition of Done
Typed · unit + functional-eval tested · sandboxed · secrets-free output · traced + costed · documented.

## MCP
The product generates MCP servers; can itself be exposed as an MCP server (`generate_mcp_server`). See [mcp.json](./mcp.json), [MCP.md](./MCP.md).
