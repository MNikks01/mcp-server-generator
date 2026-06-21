# Skill: Docker

Used for **local infra + deploy targets** (and production parity). Engines/MCP run on a Node 24 base image; the web app builds with `next build`.
- Keep images slim (`node:24-slim`), copy lockfiles first for cache, never bake secrets in.
