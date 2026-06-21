# Skill: Node.js

**Used.** Target **Node ≥ 24** (see `.nvmrc`). Engines use only the standard library (`node:fs`, `node:crypto`, `fetch`, `node:test`) — **zero runtime deps**.
- Tests use the built-in runner: `node --test test/*.test.ts`.
- Don't add dependencies to an engine without a strong reason (keep it portable + auditable).
