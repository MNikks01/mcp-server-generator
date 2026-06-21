# Skill: TypeScript

**Used heavily.** Engines are pure TypeScript run on **Node 24 native type-stripping** (no build).
- Use **`.ts` import extensions** in engine code (Node requires them); bundled/web code omits them (Turbopack rejects them) — that's why generated copies are produced by a sync script.
- Strict mode is enforced via `tsc --noEmit` (`npm run typecheck`). Use `import type` for type-only imports (verbatimModuleSyntax).
- Prefer precise types; avoid `any` except at untyped boundaries (cast `unknown` from `res.json()`).
