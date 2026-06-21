# Template: React component (Next.js)

```tsx
"use client"; // only if interactive
import { useState } from "react";

type Props = { title: string };

export function Example({ title }: Props) {
  const [open, setOpen] = useState(false);
  return (
    <section className="rounded-md border border-zinc-200 p-4 dark:border-zinc-800">
      <h2 className="font-semibold">{title}</h2>
      <button onClick={() => setOpen((v) => !v)} className="mt-2 text-sm underline">
        {open ? "Hide" : "Show"}
      </button>
    </section>
  );
}
```
Small, typed, accessible. Server Component unless it needs state/effects.
