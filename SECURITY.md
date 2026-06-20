# MCP Server Generator — SECURITY MODEL

> Two security surfaces: **(A) our app** (modest — we mostly generate code, store little) and **(B) the servers we generate** (the real promise — "secure by default, not toys"). For a 30-day MVP, keep A boring-and-correct and make B a genuine selling point. Pairs with [MCP.md](./MCP.md), [GUARDRAILS.md](./GUARDRAILS.md).

## 1. Executive Summary

The MVP's security story is intentionally lean: our app holds **almost no sensitive data** (we generate code and store a JSON IR + descriptions; we do *not* run users' servers or hold their API secrets), and the generated servers are **secure by default** (auth scaffolded from the spec, inputs validated, structured errors, and — the cardinal rule — **secrets are never embedded in generated code**, only referenced via `.env`). The one genuinely sensitive operation is **parsing untrusted OpenAPI specs**, which we treat as untrusted input (size limits, validation, no code execution). Everything heavier — sandboxed execution, full prompt-injection hardening, SOC 2 — is **out of scope for the MVP** and belongs to the hosted/enterprise future. Keeping our attack surface tiny is a deliberate 30-day decision.

---

## 2. Surface A — Our application

- **We store little:** the OpenAPI IR (structure, not secrets), generated descriptions, and Stripe/subscription state. We do **not** store the user's API tokens or run their servers.
- **Auth:** Clerk (or Auth.js) — don't roll your own. Sessions/JWT handled by the provider.
- **Secrets (ours):** the Anthropic key + Stripe keys live in Vercel env vars, never in the repo. `.env` is gitignored.
- **Untrusted input (the real risk):** users paste arbitrary OpenAPI specs (and URLs). Treat as untrusted: validate with swagger-parser, **cap size** (reject huge specs), time-out remote spec fetches, and **never execute** anything from a spec. Parsing is data-processing, not code-running.
- **SSRF caution:** `/api/parse` fetching a user-supplied URL can be abused to hit internal endpoints. *Mitigation:* fetch with a timeout, block private IP ranges/localhost, allow only http/https, and cap response size. (Cheap, important, often missed.)
- **Rate limiting:** anon `parse`/`generate` rate-limited by IP to prevent abuse + control LLM cost.
- **Payments:** Stripe handles card data (we never touch it); webhook signatures verified.
- **Billing integrity:** plan checks server-side (never trust the client for "is Pro").

## 3. Surface B — The servers we generate (the promise)

Every generated server ships with these **by default** — this is the product, not an add-on:
1. **Auth scaffolded from the spec** — API key/bearer read from `process.env`, injected as the right header; **never hard-coded**.
2. **No secrets in code** — `.env.example` shows variable *names*; real values are the user's; `.env` is gitignored. (We physically never see the user's API token — it goes in *their* env.)
3. **Input validation** — Zod schema per tool; bad arguments are rejected before the upstream call.
4. **Structured, non-leaky errors** — return status + message; don't echo secrets or full internals.
5. **Timeouts** — every upstream `fetch` has an `AbortSignal.timeout` so an agent can't hang.
6. **Side-effect flagging** — `POST/PUT/PATCH/DELETE` tools are flagged in code/comments (HITL-gateable in the hosted future).
7. **Pinned SDK + deps** — reproducible, no surprise supply-chain drift; `.gitignore` covers `.env`/`node_modules`.

**MVP-honest exclusions (do later, say so now):** prompt-injection-hardened descriptions, output sanitization, sandboxed execution, and a generated security-lint/score are **post-MVP**. The MVP delivers "secure scaffold," not "hardened against adversarial tool outputs" — and we don't claim otherwise.

## 4. Data handling / privacy
- OpenAPI specs are processed to generate code; the IR is saved for the user's history and is deletable.
- **We don't train models on user specs**, and we use a no-retention LLM tier for description generation where available (aligns with the lab's D-010).
- Account deletion purges the user's generations.

## 5. Threat model (MVP, top items)
1. **Malicious/huge spec** → size limits, validation, no execution, timeouts.
2. **SSRF via spec URL** → block private ranges/localhost, http(s) only, timeout, size cap.
3. **Secret leakage in generated code** → references-only, `.env` gitignored, never echo the token; scan generated output for accidental secret-looking strings.
4. **LLM-cost abuse (anon)** → rate limits + plan gating; cheap model for free tier.
5. **Billing bypass** → server-side plan checks; verified Stripe webhooks.

## 6. Compliance posture (MVP)
A privacy policy + a short security note on the site is enough for the MVP. SOC 2, DPAs, on-prem, and a formal security review belong to the **hosted/enterprise** future, pulled by real enterprise demand — not built speculatively in 30 days.

## 7. Why "secure by default" is a selling point
Competitors generate insecure toys (no auth, secrets in code, no validation). "Your generated server is secure by default — auth from env, validated inputs, no secrets in code" is a **differentiator and a trust signal**, especially for the agency/done-for-you buyers. Lead with it.

## 8. Related Documents
[MCP.md](./MCP.md) · [GUARDRAILS.md](./GUARDRAILS.md) · [ARCHITECTURE.md](./ARCHITECTURE.md) · [MVP.md](./MVP.md)

*Last reviewed 2026-06-20.*
