# MCP Server Generator — FEATURES (MVP)

> Every feature run through three filters: **(1) Does it help get the first user? (2) Does it help get the first paying customer? (3) Can it be built later?** If it fails 1 and 2, or passes 3, it is cut from the MVP. Scores: **Complexity** 1 (trivial) → 5 (hard); **Business value** 1 (low) → 5 (critical). Pairs with [BUILD_ORDER.md](./BUILD_ORDER.md), [TASKS.md](./TASKS.md).

## The cut test, applied
The single biggest realization: **the free generator alone gets the first user, and done-for-you gets the first ₹10,000 — neither needs auth, Stripe, or Pro.** So auth/payments are *paying-customer-track* features, not *first-user-track* features, and are cut first if time runs short.

---

## MUST HAVE (required for MVP — the free generator that actually works)

| Feature | Why it exists | Cplx | Value | First user? |
|---------|---------------|------|-------|-------------|
| Next.js app + deploy (Vercel) | the container for everything | 1 | 5 | enabling |
| Landing page + **pre-filled demo spec** | zero-friction "aha"; the pitch | 1 | 5 | ✅ |
| Input spec by **URL or paste** | how a server starts | 1 | 5 | ✅ |
| **OpenAPI parse → endpoint list** | the input → IR | 3 | 5 | ✅ |
| Select endpoints (checkboxes) | avoid huge servers; user control | 1 | 3 | ✅ |
| **Generate MCP server** (tools + Zod + auth scaffold + errors + timeouts) | the core product | 4 | 5 | ✅ |
| **LLM tool descriptions** (what/when/when-not/returns) | THE differentiator | 3 | 5 | ✅ |
| **Preview** tool names + descriptions | trust before download; part of the wow | 2 | 4 | ✅ |
| Generate project files (`package.json`, `tsconfig`, `README`, `mcp.json`, `.env.example`, `.gitignore`) | makes it runnable | 2 | 5 | ✅ |
| **ZIP download** | deliver the output | 2 | 5 | ✅ |
| Anonymous use + IP rate limit | frictionless first user + cost control | 2 | 4 | ✅ |
| Basic analytics (funnel events) | know if it's working | 1 | 3 | enabling |

**MUST-HAVE definition of done:** a stranger pastes a real OpenAPI spec, previews good descriptions, downloads a ZIP, and **it runs in Claude Desktop.** That is the whole MVP-must.

---

## NICE TO HAVE (build only if the must-haves finish early, or for the paying-customer track)

| Feature | Why | Cplx | Value | First paying customer? |
|---------|-----|------|-------|------------------------|
| Auth (Clerk) | gate Pro features | 2 | 3 | ✅ (Pro track) |
| Stripe Checkout + webhook | take self-serve money | 3 | 4 | ✅ (Pro track) |
| Free/Pro gating (free cap ~8 endpoints; Pro unlimited + premium model) | the subscription | 2 | 4 | ✅ (Pro track) |
| Save history (Pro) | justify subscription | 2 | 2 | ◐ |
| **GitHub push** (Pro) | nice differentiator | 3 | 3 | ◐ |
| File upload (in addition to URL/paste) | convenience | 1 | 2 | ✗ |
| Example gallery (servers for popular APIs) | SEO + proof | 2 | 3 | ✗ (growth) |
| "Regenerate descriptions" / edit | polish | 2 | 2 | ✗ |
| Dark mode / nicer UI polish | delight | 1 | 1 | ✗ |

**Rule:** do **not** start any Nice-to-Have until every Must-Have is done and the free generator is live and working for strangers. The paying-customer-track Nice-to-Haves (auth/Stripe/Pro) are the Week-3 work; if Week 1–2 slips, **monetize via done-for-you instead** (no code).

---

## NOT MVP (explicitly excluded — future problems, per the brief)

| Excluded | Why excluded |
|----------|--------------|
| **Hosting / runtime** | operationally heavy; kills 30-day timeline; v1 monetization, not MVP |
| Postgres / GraphQL / codebase inputs | one input (OpenAPI) is enough to validate; defer |
| Teams / orgs / RBAC / multi-tenancy | single-user only; meaningless before one user loves it |
| Resources & prompts (MCP) | tools-only validates demand; trivial to add later |
| HTTP/streamable transport | stdio works in Claude Desktop today; HTTP is the hosting on-ramp (later) |
| Marketplace, agent framework, multi-agent | off-scope distractions |
| Vector DB / RAG | this product has no retrieval |
| Observability dashboards, security score, sandbox | post-MVP hardening |
| SOC 2 / SSO / compliance / enterprise | no enterprise customers in 30 days |
| Python output | TS-only for MVP |
| Description quality scoring, injection hardening | v2 polish |

These are listed so they are **consciously not built**, not accidentally forgotten.

---

## Feature count reality check
- **Must-have:** ~12 small features → buildable by one dev in ~2 weeks.
- **Paying-track Nice-to-Have (auth/Stripe/Pro):** ~1 week.
- **Everything else:** later.

If the must-have list feels like more than 2 weeks of nights/weekends, **cut "select endpoints" (generate all, cap at N) and "preview" (download directly)** — but never cut the LLM descriptions or "it runs." (See [MVP_READINESS_REPORT.md](./MVP_READINESS_REPORT.md).)

## Related
[BUILD_ORDER.md](./BUILD_ORDER.md) · [TASKS.md](./TASKS.md) · [SPRINTS.md](./SPRINTS.md) · [MVP.md](./MVP.md)

*MVP-scoped. Last reviewed 2026-06-20.*
