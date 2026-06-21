# Lessons learned — MCP Server Generator

- **Node native TS vs bundlers:** Node requires `.ts` import extensions; Turbopack rejects them and won't resolve outside its root → keep a canonical engine + a generated copy (sync script + CI drift check).
- **Type-check the engine:** engines run via type-stripping (no typecheck at runtime); `tsc --noEmit` in CI caught a latent `unknown`-typed `res.json()` cast. Always typecheck.
- **Keep engines zero-dep/zero-network:** makes them portable, auditable, and trivially testable; push side effects (LLM/db) to the edges behind interfaces.
