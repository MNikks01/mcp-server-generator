import { NextResponse } from "next/server";

export const runtime = "nodejs";

const startedAt = Date.now();

// Liveness/readiness probe. Returns 200 when the app can serve requests.
export async function GET() {
  return NextResponse.json({ status: "ok", service: "mcp-server-generator-web", uptimeMs: Date.now() - startedAt, timestamp: new Date().toISOString() });
}
