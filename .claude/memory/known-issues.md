# Known issues — MCP Server Generator

- **Production not wired:** real keys/infra (LLM, embeddings, auth, billing, Postgres + pgvector) are interface-ready but not connected; dev/test runs without them.
- **Web UI not click-tested headlessly** — verify in a browser (`npm run dev`); API paths are covered by smoke tests.
- No deploy yet (Vercel for web). Track new issues here.
