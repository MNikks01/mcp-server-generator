# Decisions — MCP Server Generator

Key, durable decisions (the "why"). Add new ones here as they're made.

- **Engine is the single source of truth**; surfaces are thin adapters. Generated copies are synced, never hand-edited.
- **Node native TypeScript, no build step** for engines; `.ts` import extensions required (Turbopack rejects them → canonical-source + generated-copy pattern).
- **Zero-dep, zero-network engines**; real services (LLM/embeddings/Stripe/Postgres/pgvector) behind interfaces + env.
- **Tests:** `node:test` + strict `tsc --noEmit`; **Husky** pre-commit runs `npm test`; **Conventional Commits** via commitlint.
- **Postgres + pgvector** for production data (not MongoDB); **Next.js/NestJS** (not Express); **Clerk/Stripe/Vercel** (not Firebase).
- **License:** Apache-2.0.

See the root `DECISION_LOG.md` / `DECISIONS.md` for portfolio-wide decisions.
