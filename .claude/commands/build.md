---
description: Build & verify MCP Server Generator
---

Build and verify everything locally.

```bash
npm install          # root dev tooling + Husky
npm test             # typecheck + unit + integration
( cd web && npm install && npm run build )
```
All must pass before pushing (CI runs the same).
