# MCP Server Generator — SPRINTS (4 weeks)

> Week-by-week plan with deliverables, tasks, and exit criteria. One developer, nights/weekends. Granular tasks are in [TASKS.md](./TASKS.md); the precise sequence is in [BUILD_ORDER.md](./BUILD_ORDER.md); day-by-day is in [MVP.md §10](./MVP.md). Rule: **each week ends with something real, and the engine (Week 1) is the only true risk.**

---

## Week 1 — The engine (the only hard part)
**Theme:** prove "paste a real OpenAPI spec → download a server that runs in Claude Desktop." Local-only, no UI, no auth, no DB.

**Deliverables**
- Repo + Next.js/TS scaffold.
- One hand-written MCP server, run in Claude Desktop (to learn the SDK).
- OpenAPI parser → IR.
- Code generator: IR → `src/index.ts` (tools + Zod + auth-from-env + errors + timeouts) + project files.
- LLM description generation (Claude Haiku).
- ZIP packaging.

**Tasks:** see [TASKS.md](./TASKS.md) E1–E4.

**Exit criteria (must all be true):**
- [ ] Generate from **3 real public OpenAPI specs** (e.g., Petstore + 2 others).
- [ ] The generated project **builds (`npm i && tsc`) and runs in Claude Desktop** via its `mcp.json`.
- [ ] Tool descriptions read as "what/when/when-not/returns," not raw spec text.
- [ ] No secrets in generated code.

**If Week 1 slips, stop and fix it — nothing else matters until the engine works.**

---

## Week 2 — The web app + free public launch
**Theme:** wrap the engine in a UI strangers can use; deploy; get the first users.

**Deliverables**
- Landing page + pre-filled demo spec.
- Generator UI: input (URL/paste) → parse → endpoint list (checkboxes) → generate → preview descriptions → download ZIP.
- Anonymous use + IP rate limit.
- Deployed to Vercel; analytics funnel events.
- Build-in-public posts + soft launch in 2–3 communities.

**Tasks:** see [TASKS.md](./TASKS.md) E5–E6.

**Exit criteria:**
- [ ] A stranger (not you) generates + downloads a working server from the live site.
- [ ] Funnel events fire (visit→parse→generate→download).
- [ ] First 10 users; ≥1 "it ran" confirmation.

---

## Week 3 — Monetization (auth + Pro + Stripe) — *OR skip for done-for-you*
**Theme:** be able to take self-serve money. **Cuttable:** if Week 1–2 slipped, skip this and monetize via **done-for-you** (no code) — see [MVP_READINESS_REPORT.md](./MVP_READINESS_REPORT.md).

**Deliverables**
- Clerk auth (gate Pro features; free stays anonymous-friendly).
- Postgres (Neon) + Drizzle; `users` + `subscriptions` (+ `generations` if saving history).
- Free/Pro gating (free cap ~8 endpoints; Pro unlimited + premium descriptions).
- Stripe Checkout + webhook; pricing page.
- (Optional) GitHub push for Pro.

**Tasks:** see [TASKS.md](./TASKS.md) E7–E8.

**Exit criteria:**
- [ ] Full paid loop works: sign up → hit free limit → upgrade → unlock (tested end-to-end).
- [ ] A test Stripe payment flips the user to Pro via webhook.

---

## Week 4 — Launch + customers
**Theme:** launch loudly, get the first paying customer, reach ₹10,000.

**Deliverables**
- 2–3 min demo video + launch blog/tutorial + example gallery.
- Product Hunt + Show HN + Reddit/Discord + X/LinkedIn launch.
- 50 personalized DMs/emails ([SALES.md](./SALES.md) templates) + done-for-you offers.
- Iterate on top feedback; collect testimonials.

**Tasks:** see [TASKS.md](./TASKS.md) E9.

**Exit criteria:**
- [ ] Public launch shipped.
- [ ] **First paying customer** (done-for-you or Pro).
- [ ] **₹10,000 in sight** (done-for-you + Pro + one-time).
- [ ] A go/no-go read: are strangers generating working servers, and will anyone pay?

---

## Cadence & rules
- Ship/post something every few days (build-in-public is the distribution).
- Protect the buffer days (Day 7, 21) — they're real, not optional.
- **Never cut "it runs in Claude Desktop" or the LLM descriptions.** Cut auth/Stripe/history/GitHub-push first if time is short.

## Related
[TASKS.md](./TASKS.md) · [BUILD_ORDER.md](./BUILD_ORDER.md) · [MVP.md](./MVP.md) · [MVP_READINESS_REPORT.md](./MVP_READINESS_REPORT.md)

*MVP-scoped. Last reviewed 2026-06-20.*
