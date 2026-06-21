# API contracts — MCP Server Generator

_Derived from source. See root `API.md` and each subproject README._

## Web HTTP API
- `GET /api/generations/[id]/download`
- `GET /api/generations`
- `GET /api/me`
- `POST /api/dev/set-plan`
- `POST /api/download`
- `POST /api/generate`
- `POST /api/github/push`
- `POST /api/parse`
- `POST /api/stripe/checkout`
- `POST /api/webhooks/stripe`

## CLI
- `mcpforge/src/cli.ts` — see `mcpforge/README.md` for flags.

> Inputs are validated; errors return `{ error: { message } }` with an appropriate status.
