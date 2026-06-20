# MCP Server Generator — "MCPForge" (working name)

> **Turn any API into a production-ready, well-described MCP server in minutes.** Paste an OpenAPI spec → download a runnable TypeScript MCP server with great tool descriptions, auth scaffolding, and validation. No toys.

**Status: 🟢 ACTIVE PROJECT** (promoted ahead of ContextOS per the Phase 2.1 wedge finding — build #3 first). **Primary goal:** a single MERN developer ships a monetizable MVP in **30 days** → first user → first paying customer → first **₹10,000**.

---

## About this repository

This is **MCPForge — the MCP Server Generator**, extracted from a larger "AI Startup Lab" that planned a family of AI developer-tooling products. Doc references to sibling pieces (e.g., `DECISION_LOG`, `ContextOS`, `Codebase Intelligence`, the various `*_GUIDE` files) point to that broader context and are **not** part of this standalone repo — everything you need to build and run **this** product is here.

**Code lives in two folders** (docs are at the repo root):
- [`mcpforge/`](./mcpforge) — the generation engine + CLI (zero-dependency TypeScript; `node mcpforge/scripts/demo.ts`).
- [`web/`](./web) — the Next.js app: free generator + plan gating + Stripe wiring (`cd web && npm install && npm run dev`).

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

A developer with an API wants an AI agent (Claude, Cursor) to use it via MCP. Doing that by hand is a half-day-to-days of boilerplate — transport, auth, validation, and the hard part, **tool descriptions good enough that the model calls tools correctly.** MCPForge automates it: paste an OpenAPI spec, pick endpoints, and download a **secure-by-default, well-described, runnable** MCP server in under 3 minutes. Free to generate; **Pro** unlocks unlimited endpoints + premium descriptions + GitHub push + history; **done-for-you** setup is the fastest path to first cash.

## Why this is the project to build first

Phase 2.1 of ContextOS confirmed the wedge order: **#3 (this) → #2 (Codebase Intelligence) → #1 (ContextOS).** This is the **cheapest to ship, fastest to value, most shareable** product in the lab, it **teaches the MCP layer** the whole lab depends on, and every generated server is a **lead** for #2 and #1. It's also a strong **portfolio/brand asset** for a MERN→AI founder. See START_HERE.md, DECISION_LOG.md D-002, and contextos/PHASE_2_1_REPORT.md.

## MVP scope (ruthlessly small)

**In:** OpenAPI → TS MCP server, LLM tool descriptions, auth scaffold, Zod validation, README + mcp.json, preview + ZIP download, Free/Pro, Stripe, GitHub push (Pro).
**Out (deferred):** hosting/runtime, Postgres/GraphQL/codebase inputs, teams, marketplace, observability, sandboxes, Python output. (Full cut-list + rationale: [MVP.md §1](./MVP.md).)

## Tech stack (solo-dev speed-optimized)

Next.js 14 (full-stack, no separate backend) + TypeScript + Tailwind + shadcn/ui · `@apidevtools/swagger-parser` · `@modelcontextprotocol/sdk` (pinned) · Anthropic SDK (Haiku/Sonnet) · `jszip` · Zod · Postgres (Neon) + Drizzle · Clerk auth · Stripe · Octokit · Vercel. Runs on free tiers. (Details + rationale: [MVP.md §4](./MVP.md), [TECH_STACK.md](./TECH_STACK.md).)

## The 30-day milestones

| Day | Milestone |
|-----|-----------|
| 6–7 | Engine works: paste real spec → download → **runs in Claude Desktop** |
| 14 | Free generator live on Vercel → **first users** |
| 21 | Auth + Pro + Stripe → **can take money** |
| 27 | **First paying customer** (done-for-you) |
| 30 | **₹10,000 in sight** (done-for-you + Pro + one-time) |

## Document map

**MVP-first:** [MVP](./MVP.md) · [PROBLEM](./PROBLEM.md) · [MARKET_OPPORTUNITY](./MARKET_OPPORTUNITY.md) · [ARCHITECTURE](./ARCHITECTURE.md) · [MCP](./MCP.md) · [SECURITY](./SECURITY.md) · [MONETIZATION](./MONETIZATION.md) · [GTM](./GTM.md) · [FIRST_CUSTOMERS](./FIRST_CUSTOMERS.md)
**Fuller product vision (from the earlier comprehensive pass):** [VISION](./VISION.md) · [CUSTOMERS](./CUSTOMERS.md) · [FEATURES](./FEATURES.md) · [USER_STORIES](./USER_STORIES.md) · [TECH_STACK](./TECH_STACK.md) · [DATABASE](./DATABASE.md) · [API_DESIGN](./API_DESIGN.md) · [PRICING](./PRICING.md) · [SALES](./SALES.md) · [RISKS](./RISKS.md) · [DEVOPS](./DEVOPS.md) · [OPEN_SOURCE](./OPEN_SOURCE.md) · [RESUME_VALUE](./RESUME_VALUE.md)
**For AI agents:** [CLAUDE.md](./CLAUDE.md) · [AGENTS.md](./AGENTS.md) · [llms.txt](./llms.txt) · [mcp.json](./mcp.json)

## One-liner
> The fastest way to make any API callable by AI — production-ready MCP servers, generated.

*Active project. Build the MVP, get paid, then expand. The goal is the fastest path to first user / first paying customer / first ₹10,000 — not the final company. Last reviewed 2026-06-20.*
