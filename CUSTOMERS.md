# MCP Server Generator — CUSTOMERS (MVP)

> Who we build for in the first 30 days. Scoped to the MVP — no enterprise, no teams. The job of this doc: know exactly whose DM to send and what to say. Pairs with [SALES.md](./SALES.md), [GTM.md](./GTM.md), [FIRST_CUSTOMERS.md](./FIRST_CUSTOMERS.md).

## 1. Ideal Customer Profile (MVP)
A **developer or small dev shop that is actively building with MCP/AI agents right now** and needs to expose an API to an LLM, soon, without writing boilerplate or hand-tuning tool descriptions. Technical, English-speaking, hangs out in Claude/MCP/agent communities, already pays for AI tools, values shipping speed over building from scratch.

## 2. The four profiles that matter in 30 days

### First USER profile (gets value free; the funnel)
- **Who:** an indie hacker / agent builder experimenting with MCP, building a side project or a demo.
- **Why they show up:** curiosity + a real "I need a server for this API" moment.
- **What they do:** generate a server, download it, run it in Claude Desktop. May never pay — *that's fine, they're the funnel + word-of-mouth.*

### First PAYING customer profile (the ₹10,000)
- **Who:** a **freelancer or agency dev** building an AI feature for a client, OR a **small SaaS founder** who wants "use our product from Claude/Cursor."
- **Why they pay:** their time is billable / their roadmap is full; "$50 to have a working MCP server handed to me" or "$X/mo for unlimited + premium descriptions" is trivially worth it.
- **How they buy:** **done-for-you** (fastest) or **Pro** subscription.

### Early adopter profile (the evangelists)
- **Who:** active members of MCP/Claude/agent communities who try new tools early and post about them.
- **Why they matter:** they give feedback, testimonials, and amplification. Treat them like gold — onboard them personally.

## 3. Pain points (ranked by sharpness)
1. **Writing good tool descriptions** is hard and tedious (the #1 pain — and our moat).
2. **Boilerplate** (transport, auth, validation, packaging) is a half-day-to-days per API.
3. **"It doesn't work reliably"** — hand-rolled servers the LLM calls wrong.
4. **Inconsistency** across servers (no standard).

## 4. Buying triggers (when they'll act)
- They just decided to add an MCP server to an agent/product **this week**.
- A client asked for "AI integration" and they need to ship.
- They tried writing one by hand and hit the description/auth tedium.
- They saw your demo and thought "that's exactly the half-day I didn't want to spend."

## 5. Objections (and the one-line answer)
| Objection | Answer |
|-----------|--------|
| "I can write it myself." | You can — this saves the half-day and writes *better* descriptions. Try the free demo. |
| "Generated code is junk." | Read it — it's clean, secure (auth from env, validated), uses the official SDK. The code is yours. |
| "Why pay if generation is free?" | Free covers a basic server. Pay for unlimited + premium descriptions, or have me set it up for you. |
| "MCP might not last." | Output uses the official SDK; you own the code regardless of the tool. |
| "I don't trust a new tool with my API." | We never see your API token — it goes in *your* `.env`. We only read the public spec. |

## 6. Where they spend time online (where to reach them)
- **Reddit:** r/mcp, r/ClaudeAI, r/LocalLLaMA, r/SideProject, r/LLMDevs.
- **Discord:** MCP / Claude / agent-builder servers; Anthropic community spaces.
- **X/Twitter:** the "building with Claude/MCP/agents" + indie-hacker scene.
- **GitHub:** people starring/forking MCP repos, opening MCP-related issues.
- **LinkedIn:** AI-engineering + agency dev audience (better for the done-for-you pitch).
- **MCP directories/registries:** where people look for servers.

## 7. How to reach them (MVP, no ads)
1. **Show the 3-minute demo** in the communities above (show, don't tell).
2. **DM 50 specific people** who recently posted about building MCP/agents (see [SALES.md](./SALES.md) templates).
3. **Build in public** so they discover you over the 30 days.
4. **Offer done-for-you** to anyone who has an API but no time.

## 8. Out of scope (MVP)
Enterprises, platform teams, security-questionnaire buyers, multi-team orgs. They exist; they are not the first ₹10,000. Ignore them for 30 days.

## 9. Related
[SALES.md](./SALES.md) · [GTM.md](./GTM.md) · [FIRST_CUSTOMERS.md](./FIRST_CUSTOMERS.md) · [MONETIZATION.md](./MONETIZATION.md)

*MVP-scoped. Last reviewed 2026-06-20.*
