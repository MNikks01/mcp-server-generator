# Prompt: Refactor

Target: $ARGUMENTS

- Behavior-preserving only; tests must stay green throughout (`npm test`).
- Keep modules small; improve names/types; no new deps in the engine.
- If public shapes change, update tests, `API.md`, and `.claude/project/*`.
- Commit in small, reviewable steps (Conventional Commits).
