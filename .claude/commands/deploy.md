---
description: Deploy MCP Server Generator
---

Deploy the web app to **Vercel**.

1. Set env vars (see `web/.env.example` / root `.env.example`): LLM/embeddings keys, Stripe + Clerk + DATABASE_URL, etc.
2. `cd web && vercel --prod` (or connect the repo in the Vercel dashboard).
3. Provision Postgres + pgvector; run migrations when the production data layer is enabled.

> Production requires real keys/infra; the dev/test path needs none.
