# CLAUDE.md — MCP Server Generator

Guidance for Claude Code and other AI agents. Spec-first (D-011). **This is the wedge — build it first.**

## What this is
A tool that generates production-ready MCP servers from OpenAPI/Postgres/GraphQL/codebase inputs, with great tool descriptions, security, observability, and hosting. Project #3 of the AI Startup Lab; the integration-builder layer of ContextOS (#1).

## Golden rules
1. **Respect [../DECISION_LOG.md](../DECISION_LOG.md):** no model training (D-001); Claude default + abstraction (D-003); Postgres (D-004); TS/NestJS (D-005); monorepo (D-006); open-core (D-007).
2. **Generated servers must be production-ready, not toys** — auth, Zod validation, rate limits, timeouts, structured errors, observability, secrets-never-embedded. This is the product.
3. **Tool descriptions are the moat** — generate what/when/when-not/returns + params + example; validate with functional evals (does an LLM call it correctly?).
4. **Generation runs sandboxed** — untrusted specs/code never execute against us.
5. **Use the official `@modelcontextprotocol/sdk`** (pinned) in generated code.
6. **The IR is the leverage point** — all inputs → one IR → generation. Add inputs via new parsers.
7. **Trace + cost** LLM calls; **update the spec** when behavior changes.

## Context to load
[README](./README.md) → [MCP](./MCP.md) (deepest MCP spec) → [ARCHITECTURE](./ARCHITECTURE.md) (IR + pipeline) → [AI_ARCHITECTURE](./AI_ARCHITECTURE.md) (descriptions) → [TECH_STACK](./TECH_STACK.md) → [DATABASE](./DATABASE.md) → [API_DESIGN](./API_DESIGN.md) → [TASKS](./TASKS.md) → [SPRINTS](./SPRINTS.md) → [SECURITY](./SECURITY.md) → [GUARDRAILS](./GUARDRAILS.md).

## Stack
Next.js+TS+Tailwind+shadcn · NestJS · swagger-parser / pg introspection / graphql / tree-sitter · ts-morph + templates · `@modelcontextprotocol/sdk` · Postgres · Redis+BullMQ · container hosting (Fly/Railway→K8s) · vault · OTel · Stripe · Turborepo+pnpm · CLI (commander/oclif).

## Commands (once code exists)
`pnpm dev` · `pnpm test` · `pnpm test:eval` (functional: do generated servers work?) · `mcpgen openapi ./spec.yaml` · `docker compose up`.

## Definition of Done
Typed · unit + functional-eval tested (generated server compiles + tools used correctly) · sandboxed · secrets-free output · traced + costed · RLS-safe · spec updated.

## Don'ts
- Don't generate servers without auth/validation/secret-hygiene (defeats the product).
- Don't embed secrets in generated code — env/vault references only.
- Don't execute untrusted input outside the sandbox.
- Don't call vendor SDKs directly — use `packages/llm` (D-003).
- Don't over-build — this is the fast wedge; ship MVP in ~6 weeks.
