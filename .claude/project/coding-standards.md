# Coding standards — MCP Server Generator

- **TypeScript strict**; `import type` for types; `.ts` import extensions in engine code.
- Small modules, clear names, match surrounding style. No secrets in code (env only).
- Validate all inputs; return structured errors; treat retrieved/uploaded content as untrusted.
- **Tests required** for behavior changes (`npm test` must pass; Husky enforces pre-commit).
- **Conventional Commits** (enforced by commitlint on `commit-msg`).
- If you edit the engine, re-run its sync script so generated copies stay in sync.
See `CONTRIBUTING.md`.
