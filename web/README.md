# MCPForge — web app (Phase B + Phase C)

The OpenAPI → MCP server generator. Next.js 16 (App Router) + Tailwind, wrapping the [`../mcpforge`](../mcpforge) engine (ported into `lib/engine/`). **Phase B** = the free anonymous generator; **Phase C** = the paid track (plan gating + Stripe).

## Status: Phase B + C PASSED (verified headlessly 2026-06-20)
**Phase B (free generator):**
- ✅ `next build` compiles + typechecks (engine ported into `lib/engine/`).
- ✅ `POST /api/parse` — spec URL (SSRF-guarded, 2MB cap) or pasted JSON → IR.
- ✅ `POST /api/generate` — IR (+ selected tools) → file map + descriptions.
- ✅ `POST /api/download` — returns a real `.zip`.
- ✅ End-to-end on the **live Swagger Petstore** (19 tools); SSRF blocks metadata hosts; bad specs → 400.

**Phase C (paid track):**
- ✅ Cookie identity (`/api/me`) — production swaps to Clerk (`lib/identity.ts`).
- ✅ **Plan gating** — Free capped at 8 endpoints (→ 402 + upgrade prompt), Pro unlimited + premium descriptions.
- ✅ **Stripe** checkout + webhook (`/api/stripe/checkout`, `/api/webhooks/stripe`) — real + drop-in; returns 501 gracefully until keys are set.
- ✅ In-memory plan store (dev) with the Postgres/Drizzle schema ready (`lib/db/schema.ts`) for production.
- ✅ Full mechanic proven via `scripts/smoke-phase-c.mjs` (free→402, upgrade→pro, pro→unlimited).
- 🔲 Visual UI renders + wired — **verify locally** (`npm run dev`); Clerk/Stripe/Postgres need real keys (see `.env.example`).

## Run it
```bash
npm install
npm run dev          # http://localhost:3000 — paste a spec, generate, download
# headless API proofs:
npm run build
PORT=3939 npx next start &                         # Phase B
BASE=http://localhost:3939 node scripts/smoke-api.mjs
ALLOW_DEV_PLAN=1 PORT=3940 npx next start &         # Phase C (dev plan route)
BASE=http://localhost:3940 node scripts/smoke-phase-c.mjs
```

## Structure
```
app/
  page.tsx                 # generator UI (+ plan badge, upgrade prompt)
  pricing/page.tsx         # Free/Pro + "Upgrade to Pro" (Stripe checkout)
  api/parse|generate|download/route.ts
  api/me/route.ts          # session + plan
  api/stripe/checkout/route.ts · api/webhooks/stripe/route.ts
  api/dev/set-plan/route.ts # DEV ONLY (ALLOW_DEV_PLAN=1) — stands in for the webhook in tests
lib/
  engine/                  # ported MCPForge engine
  plan.ts                  # free/pro limits + gating (pure)
  identity.ts              # cookie uid (swap for Clerk)
  db/{schema.ts,store.ts}  # Drizzle schema (prod) + in-memory store (dev)
  stripe.ts · zip.ts · ssrf.ts
scripts/smoke-api.mjs · scripts/smoke-phase-c.mjs
```

## To go live (add keys — `.env.example`)
- `ANTHROPIC_API_KEY` → premium Pro descriptions.
- `STRIPE_SECRET_KEY` + `STRIPE_PRICE_ID` + `STRIPE_WEBHOOK_SECRET` → real payments.
- `DATABASE_URL` → swap the in-memory store for Postgres (schema provided).
- Clerk keys → swap cookie identity for real auth.

## Next (per ../BUILD_ORDER.md)
Deploy to Vercel → **first users**; add Stripe keys → **first self-serve payment**; or run done-for-you for the **first ₹10,000**.

> The engine's source of truth is [`../mcpforge`](../mcpforge); `lib/engine/` is a port (imports stripped of `.ts` extensions for the bundler). Keep them in sync, or extract a shared workspace package later.
