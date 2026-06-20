# MCP Server Generator — API DESIGN (MVP)

> The exact endpoints to build, with request/response/error examples. Next.js route handlers. Only what the MVP needs. The two free-generator endpoints (`/api/parse`, `/api/generate`) are the must-haves; the rest are the Pro track. Pairs with [ARCHITECTURE.md](./ARCHITECTURE.md), [DATABASE.md](./DATABASE.md).

## Conventions
- JSON in/out; bodies validated with **Zod**.
- Errors: `{ "error": { "code": "...", "message": "..." } }` with the right HTTP status.
- Only `/api/generate` costs money (LLM) → rate-limit + (later) plan-gate it.
- `/api/parse` + `/api/generate` work **anonymously** (IP rate-limited) — this is what makes the first-user experience frictionless.

---

## MUST-HAVE endpoints (the free generator)

### `POST /api/parse`
Parse an OpenAPI spec into the endpoint list (IR).

**Request**
```json
{ "specUrl": "https://petstore3.swagger.io/api/v3/openapi.json" }
```
*(or `{ "spec": "<raw yaml/json string>" }`)*

**Response 200**
```json
{
  "ir": {
    "title": "Swagger Petstore",
    "baseUrl": "https://petstore3.swagger.io/api/v3",
    "security": { "type": "apiKey", "name": "api_key", "in": "header" },
    "tools": [
      { "name": "get_pet_by_id", "method": "GET", "path": "/pet/{petId}",
        "summary": "Find pet by ID", "sideEffecting": false,
        "params": [{ "name": "petId", "in": "path", "required": true, "schema": { "type": "integer" } }] },
      { "name": "add_pet", "method": "POST", "path": "/pet",
        "summary": "Add a new pet", "sideEffecting": true, "params": [/* ... */] }
    ]
  }
}
```

**Errors**
```json
// 400 invalid spec
{ "error": { "code": "invalid_spec", "message": "Could not parse OpenAPI document: ..." } }
// 413 too large
{ "error": { "code": "spec_too_large", "message": "Spec exceeds 2MB limit." } }
// 422 unsupported
{ "error": { "code": "unsupported_spec", "message": "Only OpenAPI 2.0/3.x is supported." } }
// 502 fetch failed (SSRF-guarded)
{ "error": { "code": "fetch_failed", "message": "Could not fetch spec URL." } }
```

### `POST /api/generate`
Generate the server files (with LLM descriptions). Streams progress via SSE, then returns files.

**Request**
```json
{ "ir": { /* from /api/parse, possibly trimmed to selected tools */ },
  "selectedTools": ["get_pet_by_id", "add_pet"],
  "options": { "premiumDescriptions": false } }
```

**Response — SSE stream then final payload**
```
event: progress   data: {"tool":"get_pet_by_id","status":"describing"}
event: progress   data: {"tool":"add_pet","status":"describing"}
event: done        data: {"server_name":"swagger-petstore","tool_count":2}
```
**Final files** (in the `done` event or a follow-up fetch):
```json
{
  "name": "swagger-petstore",
  "files": {
    "src/index.ts": "...generated server...",
    "package.json": "...",
    "tsconfig.json": "...",
    "README.md": "...",
    "mcp.json": "...",
    ".env.example": "API_BASE_URL=...\nAPI_TOKEN=",
    ".gitignore": ".env\nnode_modules"
  },
  "descriptions": { "get_pet_by_id": "Fetch a single pet by id. Use when...", "add_pet": "Create a new pet. Use when... Do NOT use to update..." }
}
```

**Errors**
```json
// 429 rate limited (anon)
{ "error": { "code": "rate_limited", "message": "Too many generations. Try again in a minute or sign in." } }
// 402 free limit (when auth/plan exists)
{ "error": { "code": "endpoint_limit", "message": "Free plan generates up to 8 endpoints. Upgrade for unlimited." } }
// 502 description LLM failed (graceful: returns spec-derived descriptions instead)
```
*Note: an LLM failure must NOT block generation — fall back to spec-derived descriptions and still return files.*

### `GET /api/generations/:id/download`
Returns the project as a ZIP (`application/zip`). For anonymous generations, the files can be zipped client-side or via a signed short-lived token; for saved (Pro) generations, owner-checked.

---

## PRO-TRACK endpoints (Week 3 — skip if monetizing via done-for-you)

### `GET /api/generations`
List the signed-in user's saved generations.
```json
{ "generations": [ { "id": "uuid", "name": "swagger-petstore", "endpoint_count": 2, "created_at": "2026-06-20T..." } ] }
```

### `POST /api/github/push` *(Pro)*
```json
// request
{ "generationId": "uuid", "repoName": "my-mcp-server", "private": true }
// response 201
{ "repoUrl": "https://github.com/user/my-mcp-server" }
```

### `POST /api/stripe/checkout`
```json
// request
{ "plan": "pro_monthly" }
// response
{ "url": "https://checkout.stripe.com/c/pay/..." }
```

### `POST /api/webhooks/stripe`
Stripe events (signature-verified). Updates `users.plan` / `subscriptions.status`. Returns `200`. No body contract (Stripe-defined).

---

## Error model (summary)
| HTTP | code | When |
|------|------|------|
| 400 | `invalid_spec` | spec won't parse |
| 413 | `spec_too_large` | > size cap |
| 422 | `unsupported_spec` | not OpenAPI 2/3 |
| 429 | `rate_limited` | anon over IP limit |
| 402 | `endpoint_limit` | free plan cap (Pro track) |
| 401 | `unauthorized` | Pro endpoint without auth |
| 502 | `fetch_failed` / `llm_failed` | upstream/LLM error (LLM failures degrade gracefully) |

## What's NOT here (future)
Hosting/run endpoints, multi-input parse endpoints, team/org endpoints, usage/billing analytics endpoints, public API + keys. Not MVP.

## Related
[ARCHITECTURE.md](./ARCHITECTURE.md) · [DATABASE.md](./DATABASE.md) · [MCP.md](./MCP.md) · [SECURITY.md](./SECURITY.md)

*MVP-scoped. Last reviewed 2026-06-20.*
