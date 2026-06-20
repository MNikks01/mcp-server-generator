# Security Policy

## Reporting a vulnerability
Please report security issues **privately** — do not open a public issue.

Email **mnikks01@gmail.com** with:
- a description of the issue and its impact,
- steps to reproduce (PoC if possible),
- affected component (engine / mcp-server / web) and version/commit.

You'll get an acknowledgement within **72 hours** and a remediation timeline after triage. Please give us a reasonable window to fix before public disclosure. We credit reporters unless you prefer otherwise.

## Supported versions
This project is pre-1.0; only the latest `main` is supported.

## Scope & hardening notes (MCP Server Generator)
- **No secrets in the repo.** Credentials come from environment variables only; `.env` is gitignored (`.env.example` documents required vars).
- **Engines are zero-network by default** and make no outbound calls without an explicitly configured key.
- **Untrusted input** (uploaded specs/zips, repo contents, free text) is treated as untrusted: size/shape limits, no `eval`, no shelling out to untrusted commands.
- Dependencies are monitored via Dependabot and code is scanned via CodeQL (see `.github/workflows`).
