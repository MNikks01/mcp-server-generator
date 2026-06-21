# Tech stack — MCP Server Generator

- **Language/runtime:** TypeScript on **Node ≥ 24** (engines use native type-stripping; no build).
- **Engine:** zero runtime deps (stdlib only).
- **Web:** Next.js 16 (App Router) + React 19 + Tailwind.
- **Tests:** `node:test` + `tsc --noEmit` (strict). **Hooks:** Husky + commitlint.
- **CI:** GitHub Actions (typecheck/unit/integration + web build) + CodeQL + Dependabot.
- **Planned production:** Postgres + pgvector, Clerk (auth), Stripe (billing), OTel, Vercel (web). Not MERN — no MongoDB/Express/Firebase (see `.claude/skills`).
