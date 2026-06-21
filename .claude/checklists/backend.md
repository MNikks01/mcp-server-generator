# Backend Engineering Master Checklist — status

> **Legend:** `[x]` done · `[ ]` not yet · tags: _(partial)_, _(planned — production)_, _(N/A — MVP stage)_, _(N/A — stack: we use X)_.
> **Honest framing:** this repo is an **MVP** — a zero-network, zero-dep TypeScript **engine** wrapped by thin surfaces (CLI / MCP / Next.js). Production concerns (auth, real DB, deploy, scale, compliance) are **specified in the root spec docs but deliberately deferred**. Marks reflect the **actual code today**, not the spec's aspirations.

## Level 1 — Intermediate

### 1. Requirements & Feature Understanding — 🟡 mostly (spec-first repo)
- [x] Feature/business requirements understood (extensive root spec docs)
- [x] Acceptance criteria / user flows reviewed
- [x] Edge cases & failure scenarios identified (tests cover them)
- [x] Inputs/outputs understood
- [ ] Permissions/access rules — _(partial; full RBAC is planned)_

### 2. API Design — 🟡 partial
- [x] Proper HTTP methods (GET/POST)
- [x] Consistent naming; clear, consistent request/response shapes
- [ ] API versioning (no `/v1` yet) — _(planned)_
- [~] Pagination/filtering/sorting/search — _(search exists in #2; others N/A for the small surfaces)_
- [ ] Idempotency keys — _(planned where cost-incurring)_
- Status codes used: [x] 200, [x] 400, [x] 404, [x] 402 (plan gate, #3), [x] 409 (#7), [x] 413 (uploads), [x] 500 (framework); [ ] 201/204/403/422 — _(we return 200/400 today)_

### 3. Database Design — ⚪ N/A at MVP / 🔵 planned
- [ ] Schema / relationships / indexes / constraints / normalization — _(planned: Postgres + pgvector, D-004; #3 has a Drizzle schema ready)_
- [ ] Transactions / concurrency / optimistic locking — _(planned)_
- [x] Query patterns avoid N+1 by construction (in-memory; no ORM lazy-loading)

### 4. Code Quality — ✅ followed
- [x] Meaningful naming · small functions · SRP · DRY · consistent style · shallow nesting
- [x] Clean structure; **business logic in the engine**, surfaces are thin adapters (controller/service separation analogue); modular

### 5. Validation — 🟡→✅
- [x] Input validation (zod in MCP tools; manual + size/shape caps in web routes; SSRF guard on spec URLs in #3)
- [x] Output: no sensitive data leaked; structured `{ error: { message } }`
- [x] Input sanitization / untrusted-content handling (size limits, no eval, no shelling out)

### 6. Authentication & Authorization — 🔴 not implemented / 🔵 planned
- [ ] Password hashing / JWT / refresh rotation — _(N/A; auth is Clerk in the spec, not built)_
- [~] Resource ownership validation — _(present: #1 workspace, #2 index, #3 generation ownership checks)_
- [ ] RBAC / permission checks / admin-only — _(specified in SECURITY.md, not implemented)_

### 7. Security — 🟡 partial
- [x] SQL/NoSQL injection — _(no DB yet; parameterized access planned)_
- [x] XSS — _(React auto-escapes; no `dangerouslySetInnerHTML`)_
- [ ] CSRF / brute-force protection / rate limiting — _(planned at the gateway)_
- [x] Secrets via env only; no hardcoded secrets; `.env` gitignored (`.env.example` documents vars); CodeQL + Dependabot scanning

### 8. Error Handling — 🟡→✅
- [x] Consistent error responses; custom error class (e.g. `ParseError` in #3)
- [x] Third-party (Anthropic) errors handled; **timeouts** via `AbortSignal`
- [x] **Graceful degradation** — no-key fallbacks everywhere (retrieval-only, spec-derived descriptions, retrieval-only answers)
- [ ] Retry logic / circuit breaking — _(planned)_

### 9. Logging — 🟡 partial
- [x] Never logs passwords/tokens/keys/PII
- [~] Logs failures (MCP servers log status to stderr)
- [ ] Structured logging + request logging — _(planned: OTel/structured logs)_

### 10. Testing — ✅ followed (added this pass)
- [x] Unit tests (services/utilities/business logic) — `engine/test/unit.test.ts` (`node:test`)
- [x] Integration tests (engine end-to-end; routes via web smoke; MCP via stdio contract smoke)
- [x] Type-check (`tsc --noEmit`, strict) as a gate
- [x] Edge cases: invalid/missing input, not-found, gated/blocked, third-party-absent

### 11. Performance — 🟡 partial
- [x] Payloads minimal; async (no blocking ops); Next compression by default
- [ ] Pagination / caching / cache invalidation — _(planned; prompt-caching noted in spec)_

### 12. Monitoring & Observability — 🟡 (health endpoint added)
- [x] Health / readiness / liveness probe — `GET /api/health` (covered by the smoke test)
- [ ] Metrics (latency/error rate/throughput) + alerts — _(planned; note: **#4 builds exactly this for monitored agents**)_

### 13. Documentation — ✅ followed
- [x] Endpoints/requests/responses documented (`API.md` derived from source; `.claude/project/api-contracts.md`)
- [x] Setup guide, env vars (`.env.example`), deploy steps (`.claude/commands/deploy.md`), architecture (`.claude/project/architecture.md`)

### 14. Git & Deployment — 🟡→✅
- [x] Tests passing (CI), no debug/console (stderr only), no secrets committed, code review (PR template + CodeQL)
- [x] CI/CD configured (GitHub Actions)
- [ ] HTTPS / Dockerized service / backup strategy — _(Vercel + infra at deploy time; planned)_

## Level 2 — Architect / Staff

> 🔵 **Specified in the spec docs, NOT implemented at MVP** (correct deferral). Items below are the production target, tracked in the root `ARCHITECTURE.md`, `SECURITY.md`, `OBSERVABILITY.md`, `DEVOPS.md`.

- [ ] **Domain modeling** (DDD bounded contexts/aggregates/events)
- [ ] **System architecture** (monolith vs microservices, service boundaries, ADRs/diagrams) — _ADRs/diagrams partially exist in spec docs_
- [ ] **Scalability** (capacity planning, stateless + autoscaling, read replicas/sharding/partitioning)
- [ ] **Distributed systems** (event contracts, DLQ/retry queues, idempotent consumers, backpressure)
- [ ] **Reliability** (SLA/SLO/error budget, RTO/RPO, circuit breaker/bulkhead/fallback, failover tested)
- [ ] **Infrastructure** (multi-stage Docker, K8s + limits/requests, multi-AZ, DR)
- [ ] **Observability platform** (centralized logs, correlation/trace IDs, distributed tracing)
- [ ] **Security architecture** (OAuth2/JWT/session strategy, secret rotation/Vault, audits)
- [ ] **Data governance** (retention/archival/deletion/backup; GDPR/SOC2/ISO/PCI/HIPAA)
- [ ] **Release engineering** (blue-green/canary, feature flags, kill switches, rollback tested)
- [ ] **Operational excellence** (runbooks, incident/escalation/postmortem)
- [ ] **Cost optimization** (compute/storage/DB cost, cost-per-request/user) — _(#4's product measures cost-per-task)_

## Verdict
**Level 1: substantially followed** for what an MVP should own — clean architecture, validation, graceful-failure error handling, comprehensive tests, and docs. **Known gaps (by design, pre-revenue):** auth/RBAC, rate limiting, caching, health/metrics endpoints, structured logging. **Level 2: not implemented** — it's the documented production roadmap, not MVP scope.
