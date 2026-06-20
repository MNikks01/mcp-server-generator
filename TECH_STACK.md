# MCP Server Generator — TECH STACK (MVP)

> The exact stack to build the 30-day MVP, with why each was chosen and why the alternatives were rejected. Optimized for **one MERN developer's shipping speed**, free tiers, and "no future infra." Pairs with [ARCHITECTURE.md](./ARCHITECTURE.md), [MVP.md §4](./MVP.md).

## The whole stack in one line
**Next.js 14 (full-stack) + TypeScript + Tailwind/shadcn · swagger-parser · @modelcontextprotocol/sdk · Anthropic SDK · jszip · Zod · Postgres(Neon)+Drizzle · Clerk · Stripe · Vercel.** Runs on free tiers.

---

## Frontend + Backend — **Next.js 14 (App Router) + TypeScript**
- **Why:** one app = UI **and** API (route handlers). No separate server to build/deploy/secure. Founder's strongest ecosystem. Shared types. SSE for streaming description progress.
- **Alternatives rejected:** **Separate Express/Node backend + React SPA** — the MERN reflex; doubles deploys + glue for zero MVP benefit. **Remix/SvelteKit** — off the founder's stack. **Vite SPA only** — loses server routes (we need them for parse/generate/Stripe).

## UI — **Tailwind + shadcn/ui**
- **Why:** fast, good-looking, ownable components; no design system to build.
- **Rejected:** MUI/Chakra (heavier, less ownable); hand-rolled CSS (slow).

## OpenAPI parsing — **`@apidevtools/swagger-parser`**
- **Why:** battle-tested OpenAPI 2/3 parser + `$ref` dereferencing → clean input to our IR. Saves days.
- **Rejected:** hand-writing a parser (huge, buggy); `openapi-types` only (types, no parsing/deref).

## Generated-server SDK — **`@modelcontextprotocol/sdk`** (version-pinned)
- **Why:** the official MCP SDK; generated code must use it to be real, not a toy. Pinning = reproducible output.
- **Rejected:** hand-rolling the MCP protocol in generated code (reinvention, drift risk).

## Code generation — **template literals (strings)**, not an AST codegen lib
- **Why:** for a 30-day MVP, string templates ship far faster than `ts-morph`. The generated file is small and regular.
- **Rejected:** **ts-morph** (powerful, slower to build with — upgrade later if output complexity grows); Handlebars (extra dep for little gain over template literals).

## AI provider — **Anthropic SDK (Claude)**
- **Why:** Claude leads on the kind of structured, instruction-following generation tool descriptions need; **Haiku** is cents-cheap for free-tier descriptions, **Sonnet** for Pro "premium" descriptions. Behind a ~30-line wrapper so it's swappable.
- **Rejected:** **OpenAI/Gemini** — fine, kept as future swap; Claude is the default for quality on this task and aligns with the lab. **No LLM (spec-only descriptions)** — rejected: mediocre descriptions are the exact failure mode we're beating.

## Database — **Postgres (Neon free tier) + Drizzle**
- **Why:** only needed for the *paying* track (user plan + subscription, optional history). Postgres = relational integrity for billing; Neon free tier = $0; Drizzle = type-safe + easy.
- **Rejected:** **MongoDB** (the MERN reflex) — acceptable if the dev is genuinely faster in it (the MVP has trivial data needs), but Postgres is the better call for billing state. **Supabase** — fine alternative to Neon. **No DB / store plan in Clerk metadata** — viable to push the DB out of the *first-user* track entirely (see note).
- **Note:** the **free generator needs NO database** — it's stateless. The DB only enters when adding Pro. Build the DB in Week 3, not Week 1.

## Authentication — **Clerk** (or Auth.js)
- **Why:** fastest secure auth for a solo dev; drop-in. Only needed for the Pro track.
- **Rejected:** **roll-your-own auth** (security risk, slow); **Auth.js** — good free alternative if avoiding a vendor; Clerk wins on speed. **No auth** — correct for the free generator; auth is a Week-3 add.

## Payments — **Stripe Checkout + webhook** (+ a Payment Link for one-time/done-for-you)
- **Why:** standard, trusted, fast; Checkout is hosted (no card handling). Payment Links need zero code → can invoice done-for-you instantly.
- **Rejected:** **Lemon Squeezy/Paddle** (Merchant-of-Record, nicer global tax — reconsider later; Stripe is faster now); building a billing system (never).

## Deployment — **Vercel**
- **Why:** native Next.js, free tier, zero-config, instant previews.
- **Rejected:** self-hosting / VPS / Docker / K8s — pointless ops for a single Next.js app; **Railway/Render** fine alternatives.

## Supporting libs
- **`jszip`** — build the downloadable project in memory (rejected: `archiver` — fine, jszip is simpler for browser/edge).
- **`zod`** — validate our API inputs *and* generated tool schemas.
- **`@octokit/rest`** — GitHub push (Nice-to-Have/Pro only).
- **PostHog or Plausible** (free) — funnel analytics.
- **Resend** — transactional email (Pro track).

## Total cost to run
**~$0–20/month** on free tiers + **cents** of LLM spend. The MVP has no margin problem because it has no hosting/runtime cost (the cut that makes 30 days feasible).

## The one stack rule
**Use what you're fastest in.** These are recommendations; if the dev ships meaningfully faster swapping Drizzle→Prisma or Clerk→Auth.js or Postgres→Mongo, **do it** — for a solo 30-day MVP, shipping speed beats stack ideology. The only non-negotiables: **Next.js (one app), the official MCP SDK in output, Claude for descriptions, Stripe for payments.**

## Related
[ARCHITECTURE.md](./ARCHITECTURE.md) · [MVP.md](./MVP.md) · [DATABASE.md](./DATABASE.md) · [BUILD_ORDER.md](./BUILD_ORDER.md)

*MVP-scoped. Last reviewed 2026-06-20.*
