# Skill: Testing

**Used.** Layers: unit + integration (`node:test`), type-check (`tsc`), contract (MCP stdio smoke), e2e (web HTTP smoke).
- `npm test` = typecheck + unit + integration. Husky **pre-commit** runs it.
- Deterministic only — no network, no time-based flakiness. See `.claude/prompts/generate-tests.md` and `.claude/templates/test.md`.
