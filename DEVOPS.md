# MCP Server Generator — DEVOPS

Shared approach with [../contextos/DEVOPS.md](../contextos/DEVOPS.md). Project-specific: the **hosted-server runtime** is the operational heart.

## Environments
Local (Docker Compose: Postgres, Redis, app, generation workers, otel) · Preview (per-PR) · Staging · Production. A **sandbox cluster** for generation/tool-testing isolation.

## Generation pipeline ops
- Generation is mostly synchronous + cheap (OpenAPI < 10s); codebase input is async (workers).
- **Sandboxed generation:** parsing/testing untrusted input in isolated, ephemeral containers (security — [GUARDRAILS.md](./GUARDRAILS.md)).
- Templates versioned; generated-code tests run as part of generation quality checks.

## Hosted-server runtime (the cost center)
- Each hosted server = isolated container, scoped vault secrets, streamable-HTTP transport.
- Start on Fly.io/Railway (fast, cheap, global) → **K8s** when server count/enterprise demands (D-009).
- **Autoscale-to-zero** idle servers (cost control); warm-pool for low cold-start on popular servers.
- Per-server resource limits; network egress allowlists; health checks.
- Redeploy on spec change (V2); rollback on failure.

## CI/CD
lint → typecheck → unit → **description/functional eval gate** (do generated servers work?) → e2e → build → preview → staging → canary prod. Generated-code templates have their own test suite (the output must compile + pass tests).

## Deployments
Canary + auto-rollback; feature flags; zero-downtime for the platform. Hosted servers deployed via the control plane (provision → run → expose URL+key).

## Data ops
Managed Postgres + PITR + tested restores. Generated code in object storage/git (ref in DB). Secrets in vault only. Tool-call logs partitioned monthly at scale.

## Cost ops
Hosting is the COGS → meter per server, autoscale-to-zero, right-size containers. Description-gen LLM cost is small but tracked. Gross margin > 70% (hosting priced by usage).

## Observability & secrets
OTel → Prometheus/Grafana; Sentry; vault. See [OBSERVABILITY.md](./OBSERVABILITY.md), [SECURITY.md](./SECURITY.md).

## Runbooks
Hosted-server crash/restart · sandbox escape incident · deploy failure · secret rotation · upstream-API-change regeneration · template upgrade (regenerate-all) · cost spike (idle servers) · provider LLM outage (description gen degrades gracefully — allow manual descriptions).
