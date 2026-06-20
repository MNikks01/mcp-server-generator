# MCP Server Generator — BUILD ORDER (the most important document)

> The exact order to build, and **why each item comes when it does.** Follow this top-to-bottom. The governing principle: **build the riskiest, highest-value thing first (the generation engine), prove it works in Claude Desktop, and only then add UI and monetization.** Do not build the pretty UI before the engine works. Do not build auth/payments before strangers use the free tool. Pairs with [TASKS.md](./TASKS.md), [SPRINTS.md](./SPRINTS.md).

## The principle in one line
**Front-load risk, defer everything optional.** The only thing that can kill this project technically is "the generated servers don't actually work." So that gets built and proven *first*, before a single hour is spent on UI polish or Stripe.

---

## Phase A — Prove the engine (Week 1) — build in THIS order

1. **Next.js + TypeScript setup**
   *Why first:* you need a place to run code. 30 minutes. Don't gold-plate it.
2. **Hand-write ONE MCP server and run it in Claude Desktop**
   *Why second:* you cannot generate what you don't understand. Manually building one server teaches you the exact SDK shapes you'll template. Skipping this is the #1 way to waste Week 1.
3. **OpenAPI parser → IR**
   *Why third:* the input. Everything downstream consumes the IR. Get the data model right before generating from it. (Use swagger-parser — don't hand-roll.)
4. **Endpoint extraction (operations → IRTool[])**
   *Why fourth:* this is the IR populated — the structured list the generator and UI both need.
5. **Tool/code generation (IR → `src/index.ts`)**
   *Why fifth:* the core value. One `server.tool()` per operation, Zod schema, auth-from-env handler, errors, timeouts. This is the hard, valuable part.
6. **Description generation (LLM)**
   *Why sixth and not earlier:* it's the differentiator, but it sits *on top of* the IR + templates. Build the server skeleton first, then enrich it with great descriptions. (Build with a fallback so an LLM failure never blocks generation.)
7. **Project files (package.json, tsconfig, README, mcp.json, .env.example, .gitignore)**
   *Why seventh:* turns generated code into a *runnable project*. Cheap but essential — without `mcp.json` + README it's not usable.
8. **ZIP generation + download (local)**
   *Why eighth:* the delivery mechanism. Now you have the full pipeline end-to-end.

**🔑 PHASE A GATE (do not proceed until true):** generate from a real public OpenAPI spec → unzip → `npm i && build` → **it runs in Claude Desktop and the model calls the tools correctly.** If this isn't true, fix it before touching the UI. *Nothing else matters until this gate passes.*

---

## Phase B — Make strangers able to use it (Week 2)

9. **Generator UI: input (URL/paste) → call `/api/parse` → endpoint list**
   *Why now:* the engine works locally; now expose it. Input first.
10. **Generate + preview (descriptions stream in)**
    *Why:* the "wow" moment in the browser — seeing good descriptions appear builds trust before download.
11. **Download (ZIP) + copy mcp.json**
    *Why:* deliver the value in-browser.
12. **Landing page + pre-filled demo spec**
    *Why now, not Day 1:* the landing page sells the engine — build it once the engine is real so the demo is honest. Pre-fill a spec so first-value needs zero setup.
13. **Rate limit + SSRF guard + analytics**
    *Why:* the minimum to safely put it on the public internet (untrusted spec URLs) and to *know if it's working* (funnel events).
14. **Deploy to Vercel + soft launch**
    *Why:* first users. Ship it free, anonymous, frictionless.

**🔑 PHASE B GATE:** a stranger generates + downloads a working server from the live URL, and your funnel shows it. **First users achieved.**

---

## Phase C — Take money (Week 3) — *cuttable; see note*

15. **Auth (Clerk)** — gate Pro features (free stays anonymous-friendly).
16. **Postgres + Drizzle** (`users`, `subscriptions`, optional `generations`).
17. **Free/Pro gating** (free cap; Pro = unlimited + premium descriptions).
18. **Stripe Checkout + webhook** — the self-serve money path.
19. **(Optional) GitHub push, history page.**

*Why this order:* auth before DB (DB keys off the user), gating before Stripe (you need something to sell), Stripe last (it's the wrapper around the value). 

**🔑 NOTE — Phase C is cuttable.** The **first paying customer does not require Phase C** — a **done-for-you** gig (manual, no code) gets the first ₹10,000. If Weeks 1–2 slipped, **skip straight to Phase D and monetize via done-for-you**, then build Phase C after launch. (See [MVP_READINESS_REPORT.md](./MVP_READINESS_REPORT.md).)

---

## Phase D — Launch & sell (Week 4)
20. Demo video → 21. Launch post/tutorial + example gallery → 22. Product Hunt + Show HN + communities → 23. 50 personalized DMs + done-for-you offers → 24. Convert + collect testimonials.
*Why last:* you launch loudest when the product is proven and you can convert attention into users/cash.

---

## The dependency spine (what blocks what)
```
Setup → (learn MCP) → Parser/IR → Generator → Descriptions → Project files → ZIP
   → [GATE: runs in Claude Desktop]
   → UI (parse→generate→preview→download) → Deploy → [GATE: strangers use it]
   → Auth → DB → Gating → Stripe   (cuttable)
   → Launch + Sell
```

## The three rules of this build order
1. **The engine before the interface.** (Phase A before B.)
2. **Free users before paying infrastructure.** (Phase B before C; and C is cuttable.)
3. **Proven product before loud launch.** (Phase D last.)

## What to build NEVER (in the MVP)
Hosting, more inputs, teams, marketplace, vector DB, enterprise — see [FEATURES.md "Not MVP"](./FEATURES.md). Building any of these out of order is how 30 days becomes 90.

## Related
[TASKS.md](./TASKS.md) · [SPRINTS.md](./SPRINTS.md) · [MVP.md](./MVP.md) · [MVP_READINESS_REPORT.md](./MVP_READINESS_REPORT.md)

*The single most important doc to follow while coding. Last reviewed 2026-06-20.*
