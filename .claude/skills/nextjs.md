# Skill: Next.js

**Used** for the web app (`web/`). Next.js 16, App Router, Turbopack, React 19.
- **Read `node_modules/next/dist/docs` first** — this version differs from training data.
- Server Components by default; route handlers in `app/api/**/route.ts` (Node runtime). Dynamic route params are async (`await ctx.params`).
- The engine is imported via a generated copy in `web/lib/engine` (synced; do not edit).
