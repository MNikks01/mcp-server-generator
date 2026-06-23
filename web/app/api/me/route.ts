import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { randomUUID } from "node:crypto";
import { UID_COOKIE } from "@/lib/identity";

export const runtime = "nodejs";

// Establishes a session (sets an anonymous uid cookie if absent). The client calls this
// on load so saved history can be attached to the session. MCPForge is free & open
// source — there are no plans or limits to report. Production: back this with Clerk.
export async function GET() {
  const jar = await cookies();
  let uid = jar.get(UID_COOKIE)?.value;
  let setCookie = false;
  if (!uid) {
    uid = randomUUID();
    setCookie = true;
  }
  const res = NextResponse.json({ userId: uid });
  if (setCookie) res.cookies.set(UID_COOKIE, uid, { httpOnly: true, sameSite: "lax", path: "/" });
  return res;
}
