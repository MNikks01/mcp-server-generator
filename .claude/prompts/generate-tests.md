# Prompt: Generate tests

For: $ARGUMENTS

- Use `node:test` + `node:assert/strict` in `mcpforge/test/` (`unit.test.ts` / `integration.test.ts`).
- Deterministic only (no network/time). Cover happy path, edges, and failures.
- See `.claude/templates/test.md`. Run `npm test`.
