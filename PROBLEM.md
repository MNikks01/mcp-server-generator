# MCP Server Generator — PROBLEM & VALIDATION

> The problem, validated honestly, with assumptions challenged aggressively. The job here is to decide whether this is a *painkiller* worth a solo developer's 30 days — not to cheerlead. Pairs with [MARKET_OPPORTUNITY.md](./MARKET_OPPORTUNITY.md) and [MVP.md](./MVP.md).

## 1. Executive Summary

**The problem:** building a *good* MCP server by hand is slow, repetitive, and easy to do badly — and most quick converters produce insecure toys with vague tool descriptions that LLMs can't actually use. Developers who want to expose their API/database/tools to AI (Claude, Cursor, agents) face a tax of hours-to-days per integration writing transport boilerplate, auth, validation, and — the hard part — tool descriptions good enough that the model calls the right tool with the right arguments. **The validated wedge:** turn an OpenAPI spec into a production-ready, well-described MCP server in minutes. The honest risk: MCP is young, so the *audience is small today* — which is exactly why the "done-for-you + free funnel" go-to-market matters more than a polished SaaS, and why timing (riding MCP's adoption curve) is the whole bet.

---

## 2. The problem, precisely

A developer has an API (their SaaS, an internal service, a public API) and wants an AI agent to use it. To do that via MCP they must:
1. Scaffold an MCP server with the SDK and a transport (stdio/HTTP).
2. Map each operation to a tool with a typed input schema.
3. Write **tool descriptions** the LLM can act on (what it does, when to use it, when *not* to, what it returns) — the single hardest and most-skipped part.
4. Wire auth (API keys/OAuth) without hard-coding secrets.
5. Add input validation, error handling, rate limits, timeouts.
6. Test that the model actually calls the tools correctly.

Done by hand, this is **half a day to several days per API**, redone inconsistently every time, and the result is usually a toy (no auth, vague descriptions) that an agent uses unreliably.

---

## 3. Assumption challenge (the part most founders skip)

**Assumption 1: "Developers will pay to avoid this boilerplate."**
→ *Partly true, with a catch.* They'll pay to avoid the *annoying* parts (descriptions, auth, getting it to actually work), but the generated code is theirs and the act is one-time — so **recurring SaaS revenue for one-time generation is weak.** *Implication:* monetize the *recurring* value (hosting, later) and the *high-friction* value (done-for-you, premium descriptions), not the raw act of generation. The free generator is a funnel, not the product's revenue. (This reframing is baked into [MVP.md §3](./MVP.md) and [MONETIZATION.md](./MONETIZATION.md).)

**Assumption 2: "There's a big audience right now."**
→ *No — the audience is small but fast-growing and high-intent.* MCP went mainstream in 2025–26; the people building MCP servers today are a niche of agent/tool builders. *Implication:* don't expect Product-Hunt-scale volume; expect a small, reachable, high-intent niche where **direct outreach + done-for-you** convert better than broad ads. Timing is a bet that this niche becomes the mainstream.

**Assumption 3: "OpenAPI is the right input."**
→ *Yes, start here.* It's the most structured, most automatable, and most common way an API is described, so it gives the cleanest "paste → working server" wow. DB/GraphQL/codebase inputs are real demand but slower to build and validate — *defer.*

**Assumption 4: "Great descriptions need an LLM."**
→ *Yes, and that's the moat.* You *can* generate tools from raw OpenAPI summaries, but the result is the same mediocre toy competitors ship. LLM-written descriptions (what/when/when-not/returns) are why the generated server actually works in Claude/Cursor. Cost is trivial (cents with Haiku). **Do not cut this.**

**Assumption 5: "I need hosting to have a business."**
→ *Eventually yes, for MVP no.* Hosting is the recurring monetization and the v1 priority — but it's operationally heavy (containers, secrets, runtime) and would blow the 30-day budget. *Validate generation demand first; add hosting once people are downloading and asking "can you just run it for me?"* (That question is itself the validation signal for hosting.)

---

## 4. Why existing tools don't solve it (short — full table in [MARKET_OPPORTUNITY.md](./MARKET_OPPORTUNITY.md))
- **Official SDKs/templates:** authoritative but you still write everything (descriptions, auth, validation).
- **Generic OpenAPI→tool converters:** produce non-MCP-idiomatic tools with weak descriptions, no auth/security, no "it runs" guarantee.
- **Hand-rolled boilerplate:** flexible but slow and inconsistent.
- **MCP registries/directories:** distribute *existing* servers; they don't *generate good new ones*.

The gap: going from "I have an API" → a **secure, well-described, runnable** MCP server is still a manual slog.

---

## 5. Evidence the problem is real (and the honesty about it)
**Real signals:** MCP's steep adoption curve; developers publicly hand-rolling servers and complaining about boilerplate + bad descriptions; registries appearing (proof of distribution demand) with no good *generation* tool; "how do I make an MCP server for X?" questions recurring in Claude/agent communities.
**Honest counter-signal:** much of this demand is from a *technical niche* that could also just write the server themselves. The wedge is for the **80% of the work that's tedious** (descriptions, auth, packaging) and for **non-experts** who want it done — which is why the done-for-you motion is a legitimate first-revenue path, not a cop-out.

---

## 6. Who has this problem (MVP target)
The single sharpest MVP customer: **a developer building an agent/AI feature who needs to expose one specific API via MCP, soon, and doesn't want to write boilerplate or fiddle with descriptions.** Secondary: **agencies/freelancers** doing this repeatedly for clients (the best done-for-you + Pro buyers). Full ICPs in [CUSTOMERS.md](./CUSTOMERS.md).

---

## 7. What "solved" looks like (MVP definition)
A developer pastes an OpenAPI spec, picks endpoints, and in under 3 minutes downloads a server that **runs in Claude Desktop and whose tools the model calls correctly** — with auth scaffolded and no secrets baked in. If a stranger does this and it works for them, the problem is validated.

## 8. The kill condition
If, after launch + outreach + a done-for-you offer, **strangers won't generate servers that work for them, and nobody will pay even for done-for-you**, the problem isn't painful/urgent enough yet — pivot the input (maybe DB→MCP is sharper) or shelve until MCP adoption deepens. The 30-day MVP is explicitly designed to learn this cheaply.

## 9. Related Documents
[MVP.md](./MVP.md) · [MARKET_OPPORTUNITY.md](./MARKET_OPPORTUNITY.md) · [MONETIZATION.md](./MONETIZATION.md) · [CUSTOMERS.md](./CUSTOMERS.md) · MCP_GUIDE.md

*Last reviewed 2026-06-20.*
