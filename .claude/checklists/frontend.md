# Frontend Engineering Master Checklist — status

> **Legend:** `[x]` done · `[ ]` not yet · tags: _(partial)_, _(planned — production)_, _(N/A — MVP stage)_, _(N/A — stack: we use X)_.
> **Honest framing:** this repo is an **MVP** — a zero-network, zero-dep TypeScript **engine** wrapped by thin surfaces (CLI / MCP / Next.js). Production concerns (auth, real DB, deploy, scale, compliance) are **specified in the root spec docs but deliberately deferred**. Marks reflect the **actual code today**, not the spec's aspirations.
> Applies to the repo's Next.js app (`web/`). The apps are intentionally lean (a few screens over the engine).

## Level 1 — Frontend Engineer

### 1. Requirements & Planning — 🟡 mostly
- [x] Requirements/criteria/user-journeys understood (spec docs)
- [~] Loading/Error/Empty/Success states identified (most handled; some empty/offline states missing)

### 2. Project Structure — ✅
- [x] Consistent structure; UI vs logic separated; modular; engine accessed via generated `lib/engine`

### 3. Code Quality — ✅
- [x] Meaningful names; small components; DRY; no dead code; consistent conventions

### 4. Type Safety — 🟡→✅
- [x] Typed props/state/API responses/hooks; interfaces defined
- [~] `any` — _(eslint relaxed for the pragmatic engine layer; UI is typed)_
- [ ] Typed global state — _(N/A: no global store)_

### 5. Component Development — ✅
- [x] Props typed/minimal; state localized; proper conditional rendering; list keys
- [~] Avoid unnecessary rerenders — _(small apps; some `useCallback`)_

### 6. State Management — 🟡
- [x] `useState` appropriately; global state minimized; no Redux (not needed)
- [ ] `useReducer` — _(N/A)_; [ ] React Query / cache / revalidation — _(plain `fetch`; fine at this size)_

### 7. API Layer — 🟡
- [ ] API abstraction layer / interceptors / retry — _(inline `fetch` today)_
- [x] Loading + error + success states handled; [~] empty states; [ ] offline states

### 8. Forms — 🟡
- [~] Validation (basic required/shape); [x] disable submit during submission; [x] loading feedback; [~] success feedback

### 9. Security — 🟡→✅
- [x] No secrets/keys in client; no `dangerouslySetInnerHTML`; React XSS-escaping; inputs treated as untrusted
- [ ] CSP; [ ] CSRF tokens — _(planned)_
- [ ] Session/token/refresh/route-guards/logout — _(N/A: auth deferred)_

### 10. Performance — 🟡
- [x] Code splitting + tree-shaking (Next/Turbopack defaults)
- [~] `memo`/`useMemo`/`useCallback` where it matters
- [ ] Lazy loading / image optimization (WebP/AVIF) — _(few/no images)_

### 11. Accessibility — 🔴→🟡 (known weak spot)
- [~] Semantic HTML; [~] labels; [~] keyboard (Enter handlers); [~] contrast (Tailwind defaults)
- [ ] Screen-reader pass; [ ] focus management; [ ] ARIA labels; [ ] alt text — _(not audited; needs a real a11y pass)_

### 12. Responsive Design — 🟡
- [~] Mobile/tablet/desktop via Tailwind breakpoints (some grids responsive)
- [ ] Verified across devices / slow-3G / offline — _(not tested; UI not click-tested headlessly)_

### 13. Error Handling — 🟡
- [x] Graceful + friendly error messages
- [ ] Error boundaries / fallback UI; [ ] retry buttons — _(mostly missing)_

### 14. Testing — 🟡
- [x] Integration of user flows via **web HTTP smoke** (`scripts/smoke-api.mjs`)
- [ ] Component/hook unit tests; [ ] E2E (Playwright) — _(not added; API-level covered)_

### 15. Monitoring & Analytics — 🔴
- [ ] Error/crash/perf monitoring; [ ] analytics/funnels — _(none; planned: Sentry/analytics)_

### 16. SEO — 🟡
- [x] Page titles + meta descriptions (+ keywords; OpenGraph on #3)
- [ ] Structured data / sitemap / robots.txt; [ ] measured Core Web Vitals

### 17. Git & Delivery — ✅
- [x] App builds; lint passes; tests pass; no console logs; no commented code; no secrets

## Level 2 — Frontend Architect
> 🔵 Mostly **not implemented / N/A at MVP** (single-app, few screens).
- [x] Rendering strategy documented (Server Components by default; route handlers) — `.claude/project` + `skills/nextjs.md`
- [ ] Design system (tokens/component systems); [ ] i18n/RTL; [ ] session replay/observability
- [ ] Core Web Vitals budget (LCP/CLS/INP/TTFB); [ ] bundle budgets/audits
- [x] CI checks: lint/typecheck/tests/build verification (CI runs build + tests)
- [ ] Preview/canary deploys, feature flags, kill switches — _(planned)_
- [ ] Lighthouse/a11y/perf > 90 — _(not measured)_

## Verdict
**Level 1: followed for structure, types, code quality, and delivery hygiene; partial on forms/perf/error-boundaries; weak on accessibility, component-level tests, and analytics.** The apps are deliberately minimal surfaces over the engines. **Level 2** (design system, i18n, CWV budgets, Lighthouse gates) is **not in MVP scope.** Biggest honest gap to close next: **accessibility audit + component/E2E tests + error boundaries.**
