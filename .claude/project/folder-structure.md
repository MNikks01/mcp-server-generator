# Folder structure — MCP Server Generator

```
mcpforge/
  src/        # the engine (modules: ir/types, openapi/parse, generator/descriptions, generator/server-template, generator/project-files, generator/build, output/write, cli)
  test/       # node:test unit + integration
  scripts/    # demo + dev scripts
web/
  app/        # Next.js App Router (pages + api routes)
  lib/engine/ # GENERATED copy of the engine (do not edit)
  lib/        # web-only helpers
  scripts/smoke-api.mjs
.claude/      # this workspace
.github/      # CI, CodeQL, dependabot, templates
API.md  CHANGELOG.md  CONTRIBUTING.md  SECURITY (.github)
```
