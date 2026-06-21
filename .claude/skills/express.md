# Skill: Express

**Not used.** Per DECISION_LOG (D-005) the stack is TypeScript on Node; HTTP is served by **Next.js route handlers** (web) and **MCP stdio** (servers), not Express. The production API plane in the spec is **NestJS**, not Express. If a standalone service is ever added, prefer NestJS; document the decision in `.claude/memory/decisions.md`.
