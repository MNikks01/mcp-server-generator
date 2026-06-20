# MCP Server Generator — VISION

## North Star
> Make **everything** callable by AI — safely and instantly. If it has an API, a schema, or a function, it should be one command away from being an MCP server an agent can use.

## 10-year picture
As agents become the primary way software is operated, the bottleneck is **connectivity**: every system needs a safe, well-described interface for AI to use. MCP is the emerging standard for that interface. The Generator's vision is to be the **default way MCP servers get built** — the `create-react-app` / `vercel deploy` of the agent-connectivity era — and to host the long tail of servers that result.

## Why it's more than a code generator
1. **Quality of tool descriptions is a moat:** LLMs call tools based on descriptions; generating *great* ones (with LLM assistance + best practices) is hard and valuable.
2. **Production-readiness is the differentiator:** auth, validation, rate limits, observability, deployment — the unglamorous 80% everyone skips.
3. **Hosting + registry → platform:** generate → host → discover → monetize. The Generator naturally grows into a hub.
4. **Strategic distribution:** it's the top-of-funnel for the entire lab (#1, #2) and the founder's fastest path to learning MCP deeply.

## Strategic phases
| Horizon | What it is |
|---------|-----------|
| Now | Free, beloved generator (OpenAPI→MCP) + CLI + OSS core |
| Year 1 | Multi-input (DB/GraphQL/codebase) + hosted servers + teams |
| Year 2 | Observability + marketplace publishing + enterprise; the standard build tool |
| Year 3 | Registry/hub + governance; part of ContextOS's integration layer |

## Principles
1. **Production-ready by default** — generated servers are safe to ship, not demos.
2. **Great tool descriptions** — the thing LLMs need most, done best.
3. **Open core** — the generator core is OSS (trust + adoption); hosting/registry/governance proprietary (D-007).
4. **Standard-native** — track and shape MCP; never fork the protocol.
5. **Fast to first value** — a working server in minutes or we failed.

## What we won't do
- Generate insecure toy servers (the opposite of our value).
- Lock generated code to our platform — output is yours, runnable anywhere (trust → adoption).
- Reinvent MCP — embrace the spec.

## The bet
That MCP becomes the connectivity standard for the agent era, that *building good servers stays non-trivial*, and that being the default, production-grade build-and-host tool is both a real business and the perfect wedge into the broader platform (#1/#2). Ride the standard's adoption wave early.
