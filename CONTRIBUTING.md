# Contributing to MCP Server Generator

Thanks for your interest! This repo is part of an open portfolio of AI dev-tools.

## Prerequisites
- **Node.js ≥ 24** (engines run on native TypeScript — no build step). See `.nvmrc`.
- npm.

## Project layout

- `mcpforge/` — the engine (pure TS, zero-network). Tests: `cd mcpforge && node scripts/test-specs.ts`.
- `web/` — Next.js app. `cd web && npm install && npm run build` (+ `node scripts/smoke-api.mjs` against a running server).

## Workflow
1. Branch from `main`: `feat/<short-name>`, `fix/<short-name>`, or `docs/<short-name>`.
2. Keep changes typed and small; match the surrounding style.
3. The engine is the source of truth — if you change `mcpforge/src`, regenerate the copies the web app uses (`node mcpforge/scripts/sync-engine.mjs`) and ensure the drift check passes.
4. **Add/adjust tests** for behavior changes; all CI jobs must pass.
5. Never commit secrets. Use `.env` (gitignored).

## Commit messages
Use [Conventional Commits](https://www.conventionalcommits.org): `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`.

## Pull requests
Fill in the PR template, link any issue, and confirm the checklist. CI (build + tests + CodeQL) must be green before review.

## Code of Conduct
By participating you agree to the [Code of Conduct](./CODE_OF_CONDUCT.md).
