---
description: Publish MCP Server Generator artifacts
---

This repo ships a CLI (`mcpforge/src/cli.ts`).
- To publish to npm: set a public `name`/`version` + `bin` in the package, remove `"private": true`, then `npm publish --access public`.

> Only publish what's intended to be public; never publish secrets or `.env`.
