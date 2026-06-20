# MCP Server Generator — MVP (the 30-day, solo-MERN, get-paid plan)

> **Working name: "MCPForge"** (placeholder — validate before committing a brand/domain). This document is the fastest realistic path for **one MERN developer** to go from zero → **first user → first paying customer → first ₹10,000** in **30 days**, building a thing that is also a portfolio asset and a seed for a larger business. Simplicity beats completeness everywhere. Assumptions are challenged, not assumed.

---

## 1. The one-liner & the brutal scoping

> **Paste an OpenAPI spec → download a production-ready, well-described MCP server in TypeScript. In under 3 minutes.**

That sentence is the entire MVP. Everything that is not in that sentence is **cut**.

### What we are aggressively cutting (and why)
| Tempting feature | Cut from MVP? | Why |
|------------------|---------------|-----|
| **Hosting / running the server for you** | ✂️ CUT | Containers + secrets + runtime ops is a multi-week project alone; kills the 30-day timeline. The generated code is the user's and runs anywhere. Hosting is the *v1* monetization, not MVP. |
| Postgres / GraphQL / codebase inputs | ✂️ CUT | One input only (OpenAPI). It's the most automatable and has the cleanest "wow." Add inputs after demand is proven. |
| Teams / RBAC / org accounts | ✂️ CUT | Single-user only. Collaboration is meaningless before one user loves it. |
| Marketplace, observability dashboard, Python output | ✂️ CUT | All v2+. Pure distraction now. |
| A separate Express backend + MongoDB | ✂️ CUT | The MERN reflex. For this MVP, **Next.js route handlers are the backend** — one app, one deploy. (See §4.) |
| Agent runtime / "generate from a prompt" | ✂️ CUT | Off-scope; the value is deterministic generation, not an agent. |

### What we are NOT cutting (the non-negotiables)
1. **Great tool descriptions** (LLM-generated) — this is the entire differentiator. A naive OpenAPI→tool converter produces servers an LLM can't use. We don't.
2. **It actually runs in Claude Desktop / Cursor** — the demo must be airtight: paste → download → it works.
3. **Secure-by-default output** — auth scaffold from the spec's security, Zod validation, no secrets baked in.
4. **A payment path** — we can take money by Day 21.

---

## 2. Exact MVP features

**Free (anonymous → light sign-in):**
- Input an OpenAPI spec by URL or file upload.
- Parse → list operations (endpoints) with method/path/summary; select which to include.
- Generate a TypeScript MCP server: one tool per selected operation, with **LLM-written descriptions** (what/when/when-not/returns + param docs), **Zod** input validation, auth scaffold (env-based API key/bearer from `security`), structured errors, timeouts.
- Output a complete, runnable project: `src/index.ts`, `package.json`, `tsconfig.json`, `README.md`, `mcp.json`, `.env.example`, `.gitignore` — using the official `@modelcontextprotocol/sdk` (version-pinned).
- **Preview** tool names + generated descriptions in the UI before download.
- **Download as ZIP** + copy the `mcp.json` snippet.
- Free limits: ≤ 8 endpoints per server, 1 saved generation, "Generated with MCPForge" footer in the README.

**Pro (₹ via Stripe — the monetized layer):**
- Unlimited endpoints; unlimited saved generations + history.
- **Premium descriptions** (better model, e.g., Sonnet vs. Haiku).
- **Push to GitHub** (create a repo with the generated server).
- Remove the footer.
- Priority "regenerate descriptions" + edit-then-regenerate.

That's it. ~10 features. If a feature isn't in this list, it's not in the MVP.

---

## 3. The fastest path to ₹10,000 (challenge the "SaaS-only" assumption)

₹10,000 ≈ **$120**. This is a **validation milestone, not a business** — treat it accordingly. The fastest path is almost certainly **not** waiting for SaaS MRR to compound. Run three monetization motions in parallel, ranked by speed-to-cash:

1. **Done-for-you service (fastest cash, Day 26+):** "I'll generate, configure, and hand you a working MCP server for your API — $40–100." Offer to 5–10 warm leads from your launch. **One or two of these alone clears ₹10,000.** It also generates the best product feedback and case studies. This is how most indie products fund their first month.
2. **Pro subscription (the scalable path):** $9–15/mo. ~9–14 Pro-months = ₹10,000. Slower to start, but it's the real business.
3. **One-time "Pro Pack / lifetime" (low-friction):** a $19–29 one-time unlock via Stripe Payment Link for early adopters who hate subscriptions. 4–6 sales = ₹10,000.

**Honest stance:** lead with the **free generator** (audience + portfolio + funnel), monetize with **Pro**, and use the **done-for-you service** to hit ₹10,000 fast and learn what people actually pay for. Don't let "build the SaaS properly" delay the first rupee.

---

## 4. Exact tech stack (optimized for a solo MERN dev's *speed*, not stack purity)

> Rule: **your shipping speed > stack ideology.** Use what you're fastest in. Recommendations below assume the lab's TypeScript bias, with pragmatic escape hatches.

| Concern | Choice | Why / challenge |
|---------|--------|-----------------|
| App framework | **Next.js 14 (App Router) + TypeScript** | One app = frontend **and** backend (route handlers). No separate Express server. Deploy once. |
| UI | **Tailwind + shadcn/ui** | Fast, good-looking, ownable components. |
| OpenAPI parsing | **`@apidevtools/swagger-parser`** | Battle-tested OpenAPI/Swagger parser → our IR. |
| Generated-server SDK | **`@modelcontextprotocol/sdk`** (pinned) | The official MCP SDK; generated code depends on it. |
| Code generation | **String/template-literal templates** (not ts-morph) | Simplicity over completeness — string templates ship faster than an AST codegen lib for a 30-day MVP. Upgrade to ts-morph later if needed. |
| LLM (descriptions) | **Anthropic SDK** (Claude Haiku free-tier-cheap; Sonnet for Pro) | Behind a 30-line wrapper. The descriptions are the moat. |
| ZIP packaging | **`jszip`** | Build the downloadable project in memory. |
| Validation (ours + generated) | **Zod** | Generated tools use Zod; so does our API. |
| Auth | **Clerk** (fastest) *or* Auth.js | Clerk is the fastest to integrate for a solo dev in 30 days; Auth.js if you want zero vendor cost. |
| Database | **Postgres (Neon free tier) + Drizzle** | No pgvector needed (no RAG in MVP!). **Challenge to the MERN/Mongo reflex:** billing/subscriptions want relational integrity; Postgres is the better call. *But if you're 2× faster in Mongo, use Mongo — the MVP has no relational-heavy needs and shipping wins.* |
| Payments | **Stripe Checkout + webhook** (+ a Payment Link for the one-time Pro Pack) | Standard, fast, trusted. |
| GitHub push (Pro) | **Octokit** | Create + push the generated repo. |
| Hosting (of our app) | **Vercel** | Free tier; native Next.js. |
| Analytics | **PostHog or Plausible** (free tier) | Instrument the funnel: visit → generate → download → sign-up → pay. |
| Email | **Resend** | Welcome + activation + receipts. |

**Total monthly cost to run this:** ~$0–20 (free tiers) + tiny LLM spend (Haiku descriptions are cents). You can run the whole MVP on free tiers.

---

## 5. Exact folder structure (one Next.js app)

```
mcpforge/
├── app/
│   ├── (marketing)/
│   │   ├── page.tsx                 # landing + live demo CTA
│   │   └── pricing/page.tsx
│   ├── app/                         # authed area
│   │   ├── page.tsx                 # new generation (the generator)
│   │   ├── history/page.tsx         # saved generations (Pro)
│   │   └── layout.tsx
│   ├── api/
│   │   ├── parse/route.ts           # POST: spec URL/file → IR (endpoint list)
│   │   ├── generate/route.ts        # POST: selected ops → files (+ descriptions)
│   │   ├── generations/route.ts     # GET: history (Pro)
│   │   ├── generations/[id]/download/route.ts   # GET: zip
│   │   ├── github/push/route.ts     # POST: push to GitHub (Pro)
│   │   ├── stripe/checkout/route.ts # POST: create Checkout session
│   │   └── webhooks/stripe/route.ts # POST: subscription status
│   └── layout.tsx
├── lib/
│   ├── openapi/parse.ts             # swagger-parser → IR
│   ├── ir/types.ts                  # IR types (Tool, Param, Security)
│   ├── generator/
│   │   ├── descriptions.ts          # Claude tool-description generation
│   │   ├── server-template.ts       # IR → src/index.ts (string templates)
│   │   ├── project-files.ts         # package.json/tsconfig/README/mcp.json/.env
│   │   └── build.ts                 # orchestrates IR → file map
│   ├── zip.ts                       # file map → zip (jszip)
│   ├── llm.ts                       # Anthropic wrapper
│   ├── db/
│   │   ├── schema.ts                # Drizzle schema
│   │   └── client.ts
│   ├── stripe.ts
│   ├── plan.ts                      # free/pro limits + gating
│   └── github.ts                    # Octokit push
├── components/                      # shadcn ui + generator components
├── templates/                       # raw template fragments (if extracted)
├── drizzle/                         # migrations
├── public/
├── .env.example
├── package.json
└── README.md
```

One app. One deploy. A solo dev can hold this entire structure in their head.

---

## 6. Database schema (minimal — 3 tables)

```sql
-- users: mirror of Clerk identity (or your auth)
create table users (
  id text primary key,                 -- Clerk user id
  email text not null,
  plan text not null default 'free',   -- free | pro
  stripe_customer_id text,
  created_at timestamptz default now()
);

-- generations: a saved generated server
create table generations (
  id uuid primary key default gen_random_uuid(),
  user_id text references users(id),
  name text not null,                  -- derived from spec title
  source_kind text default 'openapi',
  source_ref text,                     -- spec url or file hash
  ir jsonb not null,                   -- the intermediate representation
  descriptions jsonb,                  -- tool -> generated description
  endpoint_count int,
  created_at timestamptz default now()
);

-- subscriptions: Stripe state (could fold into users for MVP)
create table subscriptions (
  user_id text primary key references users(id),
  stripe_subscription_id text,
  status text,                         -- active | canceled | past_due
  current_period_end timestamptz
);
```

That's the whole data model. (You could even merge `subscriptions` into `users` for the MVP — fewer tables, faster ship.)

---

## 7. API endpoints (Next.js route handlers)

| Method | Route | Purpose | Auth |
|--------|-------|---------|------|
| POST | `/api/parse` | `{specUrl}` or file → IR + endpoint list | anon (rate-limited) |
| POST | `/api/generate` | `{ir, selectedOps, options}` → `{files, descriptions}` (streams description progress via SSE) | free/pro |
| GET | `/api/generations` | list saved generations | pro |
| GET | `/api/generations/:id/download` | returns the project ZIP | owner |
| POST | `/api/github/push` | `{generationId, repoName, private}` → repo url | pro |
| POST | `/api/stripe/checkout` | create Checkout session → url | signed-in |
| POST | `/api/webhooks/stripe` | set subscription status (signature-verified) | webhook |

Anonymous users can `parse` + `generate` (limited); **download prompts sign-in** (captures the lead at the moment of value). Keep the contract small.

---

## 8. User flows

**Flow A — anonymous "aha" (the funnel):**
land → paste the pre-filled demo spec (e.g., a public weather/Petstore API) → "Generate" → watch tool descriptions stream in → preview → click "Download" → **sign-in prompt** → download ZIP → it runs in Claude Desktop. (First-value in < 3 min, no account required until download.)

**Flow B — free user hits the wall:**
signed-in free user generates a real server → tries to add a 9th endpoint or save a 2nd server → **upgrade prompt** ("Pro: unlimited endpoints, history, GitHub push, premium descriptions — $X/mo").

**Flow C — Pro:**
upgrade via Stripe → unlock unlimited + history + GitHub push → generate, push to GitHub, done.

**Flow D — done-for-you (manual, for fast cash):**
a "Need it done for you? $X" CTA → a form/Calendly → you generate + configure + hand over → invoice via a Stripe Payment Link.

---

## 9. Weekly roadmap

| Week | Theme | Outcome |
|------|-------|---------|
| **1** | **Generation engine (the hard core), local only** | paste a real OpenAPI spec → download a server that **runs in Claude Desktop** |
| **2** | **Web app + public free launch** | live on Vercel; strangers generate servers; build-in-public started |
| **3** | **Auth + DB + Pro + Stripe** | you can **take money**; free/Pro gating works end-to-end |
| **4** | **Launch + customers + iterate** | Product Hunt/HN/Reddit launch; first paying customer; ₹10,000 in sight via Pro + done-for-you |

---

## 10. Daily tasks (Day 1 → Day 30)

> Assumes ~4–6 focused hrs/day. Each day ends with something demoable or shipped. Buffer days are real — protect them.

**Week 1 — Engine**
- **Day 1:** Repo + Next.js/TS/Tailwind/shadcn scaffold; install deps. **Hand-write ONE MCP server manually and run it in Claude Desktop** — learn the SDK end-to-end. (Do not skip; it makes everything else obvious.)
- **Day 2:** `lib/openapi/parse.ts` — swagger-parser → IR (`Tool[]` with name/method/path/params/requestBody/security).
- **Day 3:** `server-template.ts` — IR → `src/index.ts`: one `server.tool(...)` per op, Zod input schema from params, `fetch` to the upstream, structured returns.
- **Day 4:** Auth scaffold from `security` (env var → header), error handling, timeouts; `project-files.ts` (package.json/tsconfig/README/mcp.json/.env.example/.gitignore).
- **Day 5:** `descriptions.ts` — Claude Haiku generates what/when/when-not/returns + param docs from IR; validate output shape.
- **Day 6:** `zip.ts` (jszip) → full runnable project. **Test: generate from a real public API → unzip → `npm i && build` → runs in Claude Desktop.**
- **Day 7 (buffer/hardening):** test against 3 real specs (Petstore + 2 real APIs); fix edge cases (no securitySchemes, path params, arrays). **Milestone: the engine works.**

**Week 2 — Web app + free launch**
- **Day 8:** Landing page (headline = the one-liner; a "Try the demo" button with a pre-filled spec).
- **Day 9:** Generator UI: input (URL/upload) → `/api/parse` → endpoint list with checkboxes.
- **Day 10:** Generate flow: select → `/api/generate` (SSE description progress) → preview tool names + descriptions.
- **Day 11:** Download (zip) + copy `mcp.json`; "view files" preview pane.
- **Day 12:** Polish: loading/error/empty states, shadcn pass, mobile-OK, the demo spec pre-loaded.
- **Day 13:** Deploy to Vercel; add PostHog funnel events (visit→parse→generate→download); add email capture.
- **Day 14:** **Soft launch (free):** build-in-public post on X/LinkedIn + 2 communities (r/mcp, an MCP/Claude Discord). **Milestone: first external users.**

**Week 3 — Auth, DB, Pro, payments**
- **Day 15:** Add Clerk; gate download behind sign-in (allow 1 anon generation).
- **Day 16:** Neon Postgres + Drizzle; schema + migrations; save generations on generate.
- **Day 17:** `plan.ts` limits (free: ≤8 endpoints, 1 saved; pro: unlimited); history page.
- **Day 18:** Stripe Checkout + customer portal + webhook → subscription status; pricing page.
- **Day 19:** Pro features: GitHub push (Octokit); premium descriptions (Sonnet); remove footer.
- **Day 20:** Upgrade prompts at limits; end-to-end plan-gating polish.
- **Day 21 (buffer):** Test the full paid loop: sign up → hit limit → upgrade → unlock. **Milestone: you can take money.**

**Week 4 — Launch + customers**
- **Day 22:** Record a 2–3 min demo video ("API → MCP server in 3 minutes").
- **Day 23:** Write the launch blog/tutorial ("Turn any API into an MCP server in minutes") — SEO + credibility.
- **Day 24:** Example gallery (servers for 3–5 popular public APIs) for SEO + instant proof; prep Product Hunt assets.
- **Day 25:** **Launch:** Product Hunt + Show HN + r/mcp, r/ClaudeAI, r/LocalLLaMA, r/SideProject + X/LinkedIn.
- **Day 26:** Direct outreach: DM 30–50 people building agents/MCP; share the tool + offer **done-for-you**.
- **Day 27:** Close 1–2 **done-for-you** gigs ($40–100 each) → **fastest route to ₹10,000**; collect a testimonial.
- **Day 28:** Iterate on the top feedback; ship the single most-requested small fix.
- **Day 29:** Convert trials → Pro; ask happy users for testimonials + a Product Hunt review.
- **Day 30:** Review the funnel metrics; decide the next bet (hosting? Postgres input? more distribution?). **Milestone: first paying customer + line of sight to ₹10,000.**

---

## 11. Success metrics (what "working" means by Day 30)
- **First user:** by Day 14 (free launch).
- **First paying customer:** by Day 27 (done-for-you) or Day 29 (Pro).
- **₹10,000:** by Day 30 via a blend of 1–2 done-for-you gigs + early Pro/one-time sales.
- **Leading indicators:** generations created, download rate, sign-up rate, free→Pro conversion, "it ran in Claude Desktop" confirmations.
- **The single number that matters:** *did strangers generate servers that actually worked for them?* If yes, demand is real and the rest is distribution.

---

## 12. Biggest risks for THIS MVP (and the honest mitigations)
1. **Generated servers don't "just work."** → Mitigation: Week 1 is entirely about this; test on real specs; the demo must be airtight before any launch.
2. **People download for free and never pay.** → Mitigation: that's *expected* — monetize via Pro + done-for-you, not by gating the core "aha." Free generation is marketing.
3. **MCP adoption is still early → small audience.** → Mitigation: ride the wave (best timing in the lab), target the active MCP/agent-building niche, and the done-for-you motion converts even a small audience to cash.
4. **Scope creep (hosting, more inputs).** → Mitigation: the cut-list in §1 is law for 30 days.
5. **30 days is tight for a solo dev.** → Mitigation: the cuts make it feasible; if a week slips, cut polish, never cut "it runs."

---

## 13. What this seeds (the path beyond the MVP — do NOT build yet)
The MVP is the wedge for the full product ([VISION.md](./VISION.md), [FEATURES.md](./FEATURES.md)): **hosting** (the real recurring monetization, v1), **more inputs** (Postgres/GraphQL/codebase), **observability**, **teams**, **marketplace** — and, per the lab strategy, it is the **top-of-funnel for Codebase Intelligence (#2) and ContextOS (#1)**. But none of that is touched until the 30-day MVP proves strangers will generate (and some will pay for) MCP servers.

## 14. Related Documents
[PROBLEM.md](./PROBLEM.md) · [MARKET_OPPORTUNITY.md](./MARKET_OPPORTUNITY.md) · [ARCHITECTURE.md](./ARCHITECTURE.md) · [MCP.md](./MCP.md) · [SECURITY.md](./SECURITY.md) · [MONETIZATION.md](./MONETIZATION.md) · [GTM.md](./GTM.md) · [FIRST_CUSTOMERS.md](./FIRST_CUSTOMERS.md)

*The goal is not the final company. The goal is the fastest path to first user, first paying customer, first ₹10,000. Last reviewed 2026-06-20.*
