# Template: React hook

```ts
import { useState, useCallback } from "react";

export function useAsync<T>(fn: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const run = useCallback(async () => {
    setBusy(true); setError("");
    try { setData(await fn()); } catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  }, [fn]);
  return { data, busy, error, run };
}
```
