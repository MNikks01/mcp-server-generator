# MCP Server Generator — OBSERVABILITY

Two scopes: **our platform** + **hosted generated servers** (observability of customers' servers is a paid feature). Shared pillars with [../contextos/OBSERVABILITY.md](../contextos/OBSERVABILITY.md).

## Platform metrics
- Generation: count, success rate, time-to-generate, by input type; description-gen LLM latency/cost.
- Hosting: servers deployed, deploy success rate, cold-start time, running count.
- Product: signups, generations/user, free→paid, hosting conversion, WAU/MAU.
- Business: MRR (Pro + hosting usage), churn, COGS (hosting + LLM).

## Hosted-server observability (the paid feature)
For each customer's hosted server, capture:
- **Tool-call logs:** tool, args (redacted), result (redacted), latency, error, caller.
- **Metrics:** calls/min, error rate, latency p50/95, top tools, usage by client.
- **Traces:** each tool call as an OTel span (upstream API call nested).
- **Alerts:** error spike, latency breach, upstream-down, quota near.
- **Dashboard:** per-server health + usage; "is my server being used correctly?"

This overlaps with Agent Monitoring (#4) — the hosted-server observability is a seed of that product.

## Logs
Structured (org/server/generation id, latency, cost). Generation logs (parse errors, LLM cost). Hosted tool-call logs (redacted I/O). No secrets/PII. Correlated to traces.

## Traces
Generation pipeline spans (parse → describe(LLM) → template → output). Hosted tool-call spans. Tail-sample errors + slow.

## Dashboards
| Dashboard | Shows |
|-----------|-------|
| Platform health | generation success, deploy success, latency, errors |
| Generation cost | description-gen LLM cost, per generation |
| Hosting | running servers, cold starts, resource use, margin |
| Customer server (per hosted) | tool-call volume, errors, latency, top tools |
| Business | funnel + MRR + hosting revenue |

## Alerts
Generation failure spike; deploy failures; hosted-server error/latency breaches; cost anomalies (hosting/LLM); security (sandbox escape attempt, cross-tenant). PagerDuty/Slack.

## Quality observability
Description quality eval scores tracked (CI + sampled); functional eval ("does an LLM use the generated server correctly?") trended. The product's quality = generated-server quality.

## SLOs
Generate (OpenAPI) < 10s; hosted cold-start < 2s; hosted uptime SLA (V3); description functional-eval pass-rate above threshold; margin > 70% (hosting is the cost center → autoscale-to-zero idle).

## Rule
Every generation + hosted tool call is traced + costed. Hosting cost is metered per server (it's the COGS).
