# MCP Server Generator — TASKS (MVP)

> Epic → Feature → Story → Task. Every task is **30 min – 4 hr**. No giant tasks. Check them off in order ([BUILD_ORDER.md](./BUILD_ORDER.md)). Scoped to the 30-day MVP only.

---

## E1 — Project setup (½ day)
**F1.1 Scaffold**
- [ ] `create-next-app` (TS, App Router, Tailwind) (30m)
- [ ] Add shadcn/ui + base layout (1h)
- [ ] Install deps: `@apidevtools/swagger-parser @modelcontextprotocol/sdk @anthropic-ai/sdk zod jszip` (15m)
- [ ] Add `.env.local` (ANTHROPIC_API_KEY) + `lib/llm.ts` wrapper (30m)
- [ ] Git repo + first commit + push (15m)

## E2 — Learn MCP (½ day, do NOT skip)
**F2.1 Hand-write one server**
- [ ] Write a minimal `McpServer` with one hard-coded tool (1h)
- [ ] Run it in Claude Desktop via `mcp.json`; confirm the tool is callable (1h)
- [ ] Note the exact SDK shapes you'll template (30m)

## E3 — OpenAPI → IR (1 day)
**F3.1 Parser**
- [ ] `lib/ir/types.ts` — IR types (Tool/Param/Security) (30m)
- [ ] `lib/openapi/parse.ts` — swagger-parser parse + dereference (1h)
- [ ] Map operations → `IRTool[]` (name from operationId/method+path; params; sideEffecting flag) (3h)
- [ ] Extract `baseUrl` + `security` scheme → IR (1h)
- [ ] Unit-check against Petstore spec (1h)

## E4 — Code generation (1.5 days)
**F4.1 Server template**
- [ ] `server-template.ts` — render `src/index.ts` header + `server.connect(stdio)` (1h)
- [ ] Render one `server.tool(name, desc, zodSchema, handler)` per IRTool (3h)
- [ ] Zod schema from params (path/query/body) (2h)
- [ ] Handler: `fetch` upstream with auth header from env + timeout + structured error (2h)
**F4.2 Project files**
- [ ] `project-files.ts` — `package.json` (pin SDK+zod), `tsconfig.json` (1h)
- [ ] `README.md` (run + add-to-Claude instructions), `mcp.json`, `.env.example`, `.gitignore` (2h)
**F4.3 Descriptions**
- [ ] `descriptions.ts` — prompt (what/when/when-not/returns) → Claude Haiku per tool (2h)
- [ ] Validate output shape; **fallback to spec summary on failure** (1h)
**F4.4 Package**
- [ ] `zip.ts` — file map → zip (jszip) (1h)
- [ ] **End-to-end test: real spec → zip → build → runs in Claude Desktop** (3h) ← Week 1 exit

## E5 — Web generator UI (1.5 days)
**F5.1 Input + parse**
- [ ] Landing page + pre-filled demo spec + "Generate" CTA (2h)
- [ ] `POST /api/parse` route handler (1h)
- [ ] Endpoint list UI with checkboxes (2h)
**F5.2 Generate + preview + download**
- [ ] `POST /api/generate` route handler (SSE progress) (3h)
- [ ] Preview pane: tool names + generated descriptions (2h)
- [ ] Download ZIP button + copy `mcp.json` (1h)
- [ ] Loading/error/empty states (2h)

## E6 — Deploy + free launch (½ day)
- [ ] IP rate limit on `/api/parse` + `/api/generate` (1h)
- [ ] **SSRF guard** on spec-URL fetch (block private IPs/localhost, http(s) only, size + timeout) (1h)
- [ ] PostHog/Plausible funnel events (1h)
- [ ] Deploy to Vercel; smoke-test live (1h)
- [ ] Build-in-public post + soft-launch in 2 communities (1h)

## E7 — Auth + DB (Pro track, 1 day) — *cuttable*
- [ ] Clerk setup + sign-in (1h)
- [ ] Neon Postgres + Drizzle schema (`users`, `subscriptions`, `generations`) + migrate (2h)
- [ ] Upsert `users` on sign-in; save `generations` on generate (2h)
- [ ] `lib/plan.ts` — free cap (≤8 endpoints) vs Pro (unlimited + Sonnet descriptions) (2h)
- [ ] History page (Pro) (2h)

## E8 — Payments (Pro track, 1 day) — *cuttable*
- [ ] `POST /api/stripe/checkout` (1h)
- [ ] `POST /api/webhooks/stripe` (verify sig → set plan/subscription) (2h)
- [ ] Pricing page + upgrade prompts at the free cap (2h)
- [ ] (Optional) `POST /api/github/push` via Octokit (3h)
- [ ] **Test full paid loop end-to-end** (2h) ← Week 3 exit

## E9 — Launch + customers (Week 4)
- [ ] Record 2–3 min demo video (3h)
- [ ] Write launch blog/tutorial (3h)
- [ ] Build example gallery (3–5 servers) (3h)
- [ ] Product Hunt + Show HN + Reddit/Discord + X/LinkedIn (3h)
- [ ] Build the 50-prospect list (2h)
- [ ] Send 10 DMs/day, personalized (ongoing, 1h/day)
- [ ] Make the done-for-you offer; close 1–2 (ongoing)
- [ ] Collect testimonials; iterate on top feedback (ongoing)

---

## Task hygiene
- Anything > 4h → split it.
- Do tasks in [BUILD_ORDER.md](./BUILD_ORDER.md) order; don't jump ahead to UI before the engine works.
- E7/E8 are **cuttable** — if behind, monetize via done-for-you and ship E7/E8 after launch.

## Related
[SPRINTS.md](./SPRINTS.md) · [BUILD_ORDER.md](./BUILD_ORDER.md) · [FEATURES.md](./FEATURES.md) · [MVP.md](./MVP.md)

*MVP-scoped. Last reviewed 2026-06-20.*
