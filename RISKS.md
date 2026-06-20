# MCP Server Generator — RISKS

L×I + mitigation.

## Technical
| Risk | L×I | Mitigation |
|------|-----|------------|
| Generated descriptions don't make LLMs call tools correctly | M×H | Functional eval in CI (does an LLM use it right?); best-practice prompt; manual edit; this is the core quality bet |
| Generated insecure servers (reputational + real harm) | M×H | Secure-by-default templates + security lint/score; no embedded secrets ([SECURITY.md](./SECURITY.md)) |
| Malicious input spec/codebase compromises us | M×H | Generation sandbox isolation |
| Hosted-server tenant breakout | L×H | Container isolation + scoped vault secrets |
| Hosting cost > margin | M×M | Autoscale-to-zero idle, right-size, usage pricing |
| Generated code quality (compiles? idiomatic?) | M×M | Generated-server test suite + typecheck gate |

## Business
| Risk | L×I | Mitigation |
|------|-----|------------|
| Hard to monetize a free generator | H×M | Monetize hosting + team/governance, not generation; primary value is the funnel into #2/#1 |
| Commodity / many converters appear | M×M | Win on description quality + security + hosting; OSS for trust; speed |
| Stays a small tool, never grows to platform | M×M | It's explicitly the wedge — feed users to #2/#1; don't expect it to be the whole company |
| Solo-founder focus | M×M | It's first + fastest; ship in 6 wks then move to #2 |

## Market
| Risk | L×I | Mitigation |
|------|-----|------------|
| **MCP adoption stalls or standard shifts** | M×H | Output uses official SDK; track spec; customers own code; pivot generator to next standard if needed |
| Anthropic/official tooling ships a great generator | M×H | Go deeper (security, hosting, multi-input, descriptions); be the production-grade + hosted option |
| Registries/incumbents bundle generation | M×M | Quality + hosting + funnel-into-platform differentiation |

## AI-specific
| Risk | L×I | Mitigation |
|------|-----|------------|
| Description gen cost/latency | L×M | Cheap models (Sonnet), cache, only regenerate on change |
| Model drift changes description quality | M×M | Functional evals in CI, pinned+tested models |
| Injection via generated servers' tool outputs | M×H | Injection-aware descriptions + output sanitization scaffolds |

## Top 3 to watch
1. **MCP adoption trajectory** — the whole timing bet; hedge via code ownership + standard-tracking.
2. **Description/functional quality** — the differentiator; eval it relentlessly.
3. **Monetization expectations** — treat as wedge/funnel, not the main business.

## Kill criteria
If MCP adoption stalls badly, the generator's *audience + funnel* value drops — pivot the engine toward whatever connectivity standard wins, or fold it into ContextOS as the integration builder (its destined role anyway). The skill (MCP, codegen) and audience are retained regardless.
