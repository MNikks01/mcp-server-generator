import { NextResponse } from "next/server";
import { parseOpenApi, ParseError } from "@/lib/engine/openapi/parse";
import { assertSafeSpecUrl } from "@/lib/ssrf";

export const runtime = "nodejs";

const MAX_SPEC_BYTES = 2_000_000; // 2MB cap

export async function POST(req: Request) {
  let body: { specUrl?: string; spec?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: { code: "invalid_request", message: "Body must be JSON." } }, { status: 400 });
  }

  let raw = body.spec ?? "";
  try {
    if (body.specUrl) {
      const url = assertSafeSpecUrl(body.specUrl);
      const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
      if (!res.ok) {
        return NextResponse.json({ error: { code: "fetch_failed", message: `Could not fetch spec (${res.status}).` } }, { status: 502 });
      }
      raw = await res.text();
    }
  } catch (e) {
    return NextResponse.json({ error: { code: "fetch_failed", message: (e as Error).message } }, { status: 502 });
  }

  if (!raw) {
    return NextResponse.json({ error: { code: "invalid_request", message: "Provide a spec URL or paste a spec." } }, { status: 400 });
  }
  if (raw.length > MAX_SPEC_BYTES) {
    return NextResponse.json({ error: { code: "spec_too_large", message: "Spec exceeds 2MB." } }, { status: 413 });
  }

  try {
    const ir = parseOpenApi(raw);
    return NextResponse.json({ ir });
  } catch (e) {
    const msg = e instanceof ParseError ? e.message : "Could not parse the spec.";
    return NextResponse.json({ error: { code: "invalid_spec", message: msg } }, { status: 400 });
  }
}
