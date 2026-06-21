# Database schema — MCP Server Generator

**MVP:** in-memory stores (per-process), so the dev/test path needs no database.

**Production (planned, DECISION_LOG D-004):** PostgreSQL + **pgvector**, tenant-scoped with row-level security (`org_id`).
- Users, subscriptions, generations (Drizzle schema already in web/lib/db).
See the root `DATABASE.md` for the full schema.
