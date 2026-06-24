# MCP Server Generator — "MCPForge" (working name)

[![License: Apache 2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](./LICENSE)
[![Free & Open Source](https://img.shields.io/badge/Free%20%26%20Open%20Source-%E2%9C%93-brightgreen.svg)](#-free--open-source)
[![Sponsor](https://img.shields.io/badge/Sponsor-%E2%99%A5-ff69b4.svg)](https://github.com/sponsors/MNikks01)

> 💚 **Free & open source, forever.** Every feature is available to everyone — no paywalls, no tiers, no sign-up. Clone and self-host it, or use the hosted app. Licensed under Apache-2.0. If it helps you, [sponsoring](https://github.com/sponsors/MNikks01) is welcome but always optional.

**▶ Try it / deploy your own:** [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FMNikks01%2Fmcp-server-generator&root-directory=web&project-name=mcp-server-generator) · see [DEPLOY.md](./DEPLOY.md) for CLI & self-hosting.

**🖥️ CLI:** turn an OpenAPI spec OR your codebase into a production-ready MCP server — published on npm (needs Node ≥23.6):
```bash
npm i -g @mnikks01/mcpforge    # installs the `mcpforge` command — or use npx (no install) below
npx @mnikks01/mcpforge scan ./my-app                 # codebase -> MCP server
npx @mnikks01/mcpforge scan . --base-url https://api.myapp.com --llm
npx @mnikks01/mcpforge ./openapi.json               # OpenAPI spec -> MCP server
npx @mnikks01/mcpforge https://petstore3.swagger.io/api/v3/openapi.json -o ./out
```
From a clone instead: `node mcpforge/src/cli.ts <args>`.


> **Turn any API into a production-ready, well-described MCP server in minutes.** Paste an OpenAPI spec → download a runnable TypeScript MCP server with great tool descriptions, auth scaffolding, and validation. No toys.

**Status: 🟢 ACTIVE — free & open source.** Built and shipped (engine + CLI + web app). Every feature is free for everyone; there are no paid tiers. Sponsoring development is optional. *(Historical note: this began as a "monetizable MVP" wedge experiment; it has since been made fully free & open source.)*

---

## About this repository

This is **MCPForge — the MCP Server Generator**, extracted from a larger "AI Startup Lab" that planned a family of AI developer-tooling products. Doc references to sibling pieces (e.g., `DECISION_LOG`, `ContextOS`, `Codebase Intelligence`, the various `*_GUIDE` files) point to that broader context and are **not** part of this standalone repo — everything you need to build and run **this** product is here.

**Code lives in two folders** (docs are at the repo root):
- [`mcpforge/`](./mcpforge) — the generation engine + CLI (zero-dependency TypeScript; `node mcpforge/scripts/demo.ts`).
- [`web/`](./web) — the Next.js app: the free, open-source generator (`cd web && npm install && npm run dev`).

Licensed under **Apache-2.0** — see [LICENSE](./LICENSE).

---

## ⭐ Start here

1. **[MVP.md](./MVP.md)** — the 30-day, solo-dev, get-paid build plan (features, tech stack, schema, API, folder structure, user flows, weekly roadmap, **daily tasks Day 1–30**). **Read this first.**
2. [PROBLEM.md](./PROBLEM.md) — problem + honest validation (assumptions challenged).
3. [MARKET_OPPORTUNITY.md](./MARKET_OPPORTUNITY.md) — market sizing + competitors.
4. [MONETIZATION.md](./MONETIZATION.md) · [GTM.md](./GTM.md) · [FIRST_CUSTOMERS.md](./FIRST_CUSTOMERS.md) — how it makes money + how to get the first customers.
5. [ARCHITECTURE.md](./ARCHITECTURE.md) · [MCP.md](./MCP.md) · [SECURITY.md](./SECURITY.md) — how it's built + what it generates + the security model.

---

## The product in one paragraph

A developer with an API wants an AI agent (Claude, Cursor) to use it via MCP. Doing that by hand is a half-day-to-days of boilerplate — transport, auth, validation, and the hard part, **tool descriptions good enough that the model calls tools correctly.** MCPForge automates it: paste an OpenAPI spec, pick endpoints, and download a **secure-by-default, well-described, runnable** MCP server in under 3 minutes. **Everything is free** — unlimited endpoints, GitHub push, and saved history, plus premium LLM descriptions when you add your own (optional) API key. No tiers, no sign-up.

## Why this is the project to build first

Phase 2.1 of ContextOS confirmed the wedge order: **#3 (this) → #2 (Codebase Intelligence) → #1 (ContextOS).** This is the **cheapest to ship, fastest to value, most shareable** product in the lab, it **teaches the MCP layer** the whole lab depends on, and every generated server is a **lead** for #2 and #1. It's also a strong **portfolio/brand asset** for a MERN→AI founder. See START_HERE.md, DECISION_LOG.md D-002, and contextos/PHASE_2_1_REPORT.md.

## MVP scope (ruthlessly small)

**In:** OpenAPI → TS MCP server, LLM tool descriptions, auth scaffold, Zod validation, README + mcp.json, preview + ZIP download, saved history, GitHub push — **all free**.
**Out (deferred):** hosting/runtime, Postgres/GraphQL/codebase inputs, teams, marketplace, observability, sandboxes, Python output. (Full cut-list + rationale: [MVP.md §1](./MVP.md).)

## Tech stack (solo-dev speed-optimized)

Next.js 16 (full-stack, no separate backend) + TypeScript + Tailwind · `@apidevtools/swagger-parser` · `@modelcontextprotocol/sdk` (pinned) · Anthropic SDK (optional, for premium descriptions) · `jszip` · Zod · in-memory store by default (optional Postgres + Drizzle) · optional Clerk auth · Octokit · Vercel. Runs entirely on free tiers, with no required keys. (Details: [MVP.md §4](./MVP.md), [TECH_STACK.md](./TECH_STACK.md).)

## Status

Built and shipped, and now **free & open source**:

- ✅ Engine: paste a real spec → download → **runs in Claude Desktop**
- ✅ CLI (`mcpforge <spec>`) and free web generator
- ✅ **Generate from your codebase** — reads your source, finds the APIs, and decides the MCP tools itself (Express/Node incl. `app.use()` mount prefixes, Next.js, Fastify, NestJS, FastAPI, Flask), and infers auth (JWT/Bearer, API key, OAuth2). Use the CLI (`mcpforge scan ./my-app`) **or the web app** (upload a `.zip`)
- ✅ Unlimited endpoints, GitHub push, saved history — all free, no sign-up
- ▶ Deploy your own in one click (see [DEPLOY.md](./DEPLOY.md)) or use the hosted app

### CLI usage

```bash
# From an OpenAPI spec (file or URL)
mcpforge ./openapi.json
mcpforge https://petstore3.swagger.io/api/v3/openapi.json -o ./petstore-mcp

# From your own codebase — no spec required. Scans the source, discovers HTTP
# routes, and generates a runnable MCP server with one tool per endpoint.
mcpforge scan ./my-express-app
mcpforge scan . --base-url https://api.myapp.com --llm   # --llm: Claude writes premium tool descriptions
```

`scan` works with zero API keys (deterministic route discovery); add `--llm` (and `ANTHROPIC_API_KEY`) to have Claude refine the tool descriptions. Supported today: Express/Node REST, Next.js (app-router `route.ts` + `pages/api`), Fastify, NestJS controllers, FastAPI, and Flask.

## Document map

**MVP-first:** [MVP](./MVP.md) · [PROBLEM](./PROBLEM.md) · [MARKET_OPPORTUNITY](./MARKET_OPPORTUNITY.md) · [ARCHITECTURE](./ARCHITECTURE.md) · [MCP](./MCP.md) · [SECURITY](./SECURITY.md) · [MONETIZATION](./MONETIZATION.md) · [GTM](./GTM.md) · [FIRST_CUSTOMERS](./FIRST_CUSTOMERS.md)
**Fuller product vision (from the earlier comprehensive pass):** [VISION](./VISION.md) · [CUSTOMERS](./CUSTOMERS.md) · [FEATURES](./FEATURES.md) · [USER_STORIES](./USER_STORIES.md) · [TECH_STACK](./TECH_STACK.md) · [DATABASE](./DATABASE.md) · [API_DESIGN](./API_DESIGN.md) · [PRICING](./PRICING.md) · [SALES](./SALES.md) · [RISKS](./RISKS.md) · [DEVOPS](./DEVOPS.md) · [OPEN_SOURCE](./OPEN_SOURCE.md) · [RESUME_VALUE](./RESUME_VALUE.md)
**For AI agents:** [CLAUDE.md](./CLAUDE.md) · [AGENTS.md](./AGENTS.md) · [llms.txt](./llms.txt) · [mcp.json](./mcp.json)

## One-liner
> The fastest way to make any API callable by AI — production-ready MCP servers, generated.

*Active, shipped, and free & open source (Apache-2.0). Use it, self-host it, or [sponsor](https://github.com/sponsors/MNikks01) — always optional.*
