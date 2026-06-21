# Go-live checklist — MCP Server Generator

> **Nothing here is needed for the dev/test path** — `npm test`, the demos, and the smoke tests all run **offline with no keys**. This is only for shipping to production.

## 1. Environment variables
| Variable | When | Unlocks |
|----------|------|---------|
| `ANTHROPIC_API_KEY` | optional | premium (LLM) tool descriptions for Pro; else spec-derived |
| `STRIPE_SECRET_KEY / STRIPE_WEBHOOK_SECRET / STRIPE_PRICE_ID` | for billing | Pro checkout + webhooks (returns 501 until set) |
| `CLERK_SECRET_KEY / NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | for real auth | swap the dev cookie identity for Clerk |
| `DATABASE_URL` | production | persist users/subscriptions/generations (Drizzle schema in lib/db is ready) |
| `GITHUB_TOKEN` | optional | server-side GitHub push (or wire GitHub OAuth) |
| `ALLOW_DEV_PLAN` | must be UNSET in prod | dev-only plan override |

_web/.env.example documents every var._

Set these in the host's settings (Vercel project env), never in committed files. `.env` is gitignored.

## 2. Deploy
- **Web app** → Vercel: `cd web && vercel --prod` (or connect the repo in the Vercel dashboard, root = `web/`). Add the env vars above.
- **CLI** → `mcpforge <spec|url> -o <dir>` — publish to npm (set a public name + remove `private`, then `npm publish`).
- Provision Postgres + pgvector when enabling the production data layer.

## 3. Production swaps (flip dev → prod behind existing interfaces)
- in-memory plan/generation store → Postgres (Drizzle)
- cookie identity → Clerk
- Stripe 501 → real Stripe
- spec-derived descriptions → Claude (Pro)

## 4. Verify after deploy
- `curl https://<your-deploy>/api/health` → `{"status":"ok"}`
- Run the smoke against the live URL: `BASE=https://<your-deploy> node web/scripts/smoke-api.mjs`
- Re-run `npm test` on the deploy commit (CI does this automatically).

## 5. Enforce CI on GitHub (branch protection)
> Adopt a **feature-branch → PR** flow first. Branch protection requires checks to pass *before merge*, which conflicts with pushing straight to `main`. Run this **after CI has run once** on `main` (so the checks exist). Solo-friendly: requires green CI, no second reviewer, owner not locked out.

```bash
gh api -X PUT repos/MNikks01/mcp-server-generator/branches/main/protection --input - <<'JSON'
{
  "required_status_checks": { "strict": true, "contexts": ["typecheck + unit + integration","web build","e2e (playwright)"] },
  "enforce_admins": false,
  "required_pull_request_reviews": null,
  "restrictions": null,
  "required_linear_history": true,
  "allow_force_pushes": false,
  "allow_deletions": false
}
JSON
```
(Add the `CodeQL` check too once it appears in the branch-protection check list.)
