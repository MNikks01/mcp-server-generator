# Deploy MCPForge (MCP Server Generator)

MCPForge (MCP Server Generator) is **free & open source**. The web app lives in [`web/`](./web) (Next.js) and runs with **zero required environment variables** — every feature works out of the box on a free Vercel account.

## One-click deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FMNikks01%2Fmcp-server-generator&root-directory=web&project-name=mcp-server-generator)

This clones the repo to your own GitHub and deploys it, with the **Root Directory** preset to `web`.

## Deploy from the CLI

```bash
npm i -g vercel          # one-time
cd web
vercel                   # preview deploy (follow the prompts)
vercel --prod            # production deploy
```

> When Vercel asks for the **Root Directory**, choose `web` (the Next.js app). If you run `vercel` from inside `web/`, it is already correct.

## Deploy from the Vercel dashboard

1. **New Project → Import** this GitHub repo.
2. Set **Root Directory** to `web`.
3. Framework preset: **Next.js** (auto-detected). Build/output settings need no changes.
4. **Deploy**.

## Optional environment variables

The app is fully functional with none of these. Add them only to enable optional upgrades — see [`web/.env.example`](./web/.env.example) for the full list (e.g. `ANTHROPIC_API_KEY` for premium LLM output, `DATABASE_URL` for durable storage). No paid keys are ever required.

## Self-hosting (any Node host)

```bash
cd web
npm install
npm run build
npm start            # serves on $PORT (default 3000)
```

Runs anywhere Node 24+ is available (a VPS, Docker, Render, Railway, Fly, etc.).
