# MCP Server Generator — API reference

_Generated from the source; see each subproject's README for usage._

## Web HTTP API

Next.js route handlers under `web/app/api`.

| Endpoint | Methods |
|----------|---------|
| `/api/dev/set-plan` | POST |
| `/api/download` | POST |
| `/api/generate` | POST |
| `/api/generations` | GET |
| `/api/generations/[id]/download` | GET |
| `/api/github/push` | POST |
| `/api/me` | GET |
| `/api/parse` | POST |
| `/api/stripe/checkout` | POST |
| `/api/webhooks/stripe` | POST |

> All inputs are validated; errors return a JSON `{ error: { message } }` with an appropriate status. No secrets are logged. See `.github/SECURITY.md`.