# Checklist assessment — MCP Server Generator (project #3)

Honest status of this repo against the backend + frontend master checklists. See `backend.md` and `frontend.md` for the item-by-item marks.

## This repo specifically
Closest to the auth/billing items: real-but-stubbed Stripe checkout/webhooks + plan gating (402), cookie identity (Clerk-ready), generation ownership checks, SSRF guard on spec-URL fetch, GitHub token used per-request (never stored).

## Summary
| Area | Level 1 | Level 2 (architect) |
|------|---------|---------------------|
| Backend | 🟡→✅ strong on code quality, validation, error/graceful-degradation, **tests**, docs | 🔵 specified in spec docs, not implemented (MVP) |
| Frontend | 🟡 structure/types/delivery good; a11y + component tests weak | 🔵 not in MVP scope |

**Followed well:** clean engine-centric architecture, input validation, structured errors + graceful no-key fallbacks, **full test layer** (unit + integration + typecheck + contract/e2e smokes), security hygiene (env-only secrets, CodeQL, Dependabot), and docs.

**Deferred by design (pre-revenue MVP):** auth/RBAC, real DB (Postgres + pgvector), rate limiting, caching, health/metrics endpoints + structured logging/tracing, deploy (Vercel), and all Level-2 scale/reliability/compliance items.

**Top gaps worth closing next:** (1) accessibility audit of the web UI; (2) component/E2E tests; (3) a health endpoint + structured logging when services are deployed; (4) wire the planned auth/DB so the auth/authorization items become real.

> These are tracked in the root spec docs (`ARCHITECTURE.md`, `SECURITY.md`, `OBSERVABILITY.md`, `DEVOPS.md`) and `.claude/project/roadmap.md`.
