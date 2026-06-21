---
description: Cut a release of MCP Server Generator
---

1. Ensure `main` is green (CI) and `npm test` passes.
2. Update the root `CHANGELOG.md` (Keep a Changelog) and bump the version.
3. Commit (`chore(release): vX.Y.Z`) and tag: `git tag vX.Y.Z && git push --tags`.
4. (Optional) create a GitHub Release from the tag with the changelog notes.
