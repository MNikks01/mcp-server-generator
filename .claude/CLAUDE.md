# .claude — MCP Server Generator workspace

Project #3 of the AI Startup Lab. OpenAPI -> production-ready MCP server.

**What it does:** Parse OpenAPI -> IR -> generate a runnable MCP server (env auth, zod validation, good tool descriptions) as a file map. CLI + web (free + paid).

**Surfaces:** mcpforge/ (engine), mcpforge/src/cli.ts (CLI), web/ (Next.js app)

This `.claude/` folder helps humans and AI agents work in this repo consistently:
- `agents/` — role-based subagents (architect, backend, frontend, tester, reviewer, devops, docs, ui).
- `skills/` — stack reference notes (what we use, and what we deliberately don't).
- `project/` — the living source of truth: architecture, standards, structure, API contracts, schema, stack, roadmap.
- `prompts/` — reusable task prompts (feature, bugfix, refactor, review, tests, docs).
- `memory/` — decisions, changelog, known issues, lessons learned.
- `commands/` — operational runbooks (build, deploy, release, publish). Also usable as slash commands.
- `templates/` — code scaffolds (component, api-route, hook, test, PR).

> Ground truth lives in code + the root spec docs. **Engines run on Node 24 native TypeScript (zero build step); never add a build for them.** The engine is the single source of truth — generated copies (`web/lib/engine`) are synced, never hand-edited.
