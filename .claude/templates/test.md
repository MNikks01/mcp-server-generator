# Template: node:test (unit/integration)

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { thing } from "../src/index.ts";

test("does the expected thing", () => {
  assert.equal(thing(2), 4);
});

test("handles the failure mode", () => {
  assert.throws(() => thing(-1));
});
```
Run: `node --test mcpforge/test/*.test.ts` (or `npm test`). Deterministic only.
