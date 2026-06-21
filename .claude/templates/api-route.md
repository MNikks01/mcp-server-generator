# Template: Next.js route handler

```ts
import { NextResponse } from "next/server";
// import { something } from "@/lib/engine/index"; // generated engine copy

export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  if (!body?.field) {
    return NextResponse.json({ error: { message: "field is required" } }, { status: 400 });
  }
  // ...call the engine...
  return NextResponse.json({ ok: true });
}
```
Validate inputs; `{ error: { message } }` on failure; never log secrets.
