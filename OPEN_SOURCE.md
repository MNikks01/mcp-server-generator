# MCP Server Generator — OPEN SOURCE

The most OSS-forward project in the lab — open-sourcing the generator core is the primary GTM lever (D-007).

## Open source (Apache-2.0)
| Component | Why open |
|-----------|----------|
| **Generator core** (parsers → IR → templates → server code) | Devs adopt + trust a generator they can read; the single biggest funnel lever |
| **`mcpgen` CLI** | Lives in terminals/CI; viral developer distribution |
| **Server templates** (auth/validation/rate-limit scaffolds) | Community improves them; sets the "good MCP server" standard |
| **IR spec** | Lets others build parsers/targets; ecosystem leverage |
| **Description best-practice prompt/guidelines** | Thought leadership on the hard part |
| **SDKs** | Integration ease |

## Proprietary (commercial)
| Component | Why closed |
|-----------|-----------|
| **Hosting control plane + runtime** | The actual revenue; hard to operate; the COGS we monetize |
| Hosted observability + dashboards | Paid value |
| Teams/RBAC/governance/registry | Enterprise value |
| Marketplace + monetization | Platform value (feeds #7) |
| Security lint/score (hosted) | Differentiated quality signal |
| Description quality at scale + premium models | Quality/cost moat |

## Rationale
The generator core being OSS means **local generation is genuinely free and the code is yours** — this removes all adoption friction and builds trust (you can audit the security claims). We earn on **hosting, collaboration, governance, and the funnel into #2/#1**. The OSS tool is marketing that is also a product.

## Licensing
OSS Apache-2.0; platform commercial; CLA for contributors; generated code carries a permissive license (it's the user's code).

## Community
The OSS repo is the build-in-public + DevRel surface. "Add a parser for X" / "improve template for Y" are great contributor on-ramps that expand input coverage for free. Example gallery is community-extensible.

## Risk: fork
The generator core alone isn't the business — **hosting + governance + the platform funnel** are. Open the tool, keep the service. A fork that doesn't host/govern just feeds more developers into the MCP ecosystem we sit at the center of.
