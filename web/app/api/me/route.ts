import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { randomUUID } from "node:crypto";
import { UID_COOKIE } from "@/lib/identity";
import { getStore } from "@/lib/db/store";
import { FREE_ENDPOINT_CAP } from "@/lib/plan";

export const runtime = "nodejs";

// Establishes a session (sets an anonymous uid cookie if absent) and returns the plan.
// The client calls this on load. Production: back this with Clerk.
export async function GET() {
  const jar = await cookies();
  let uid = jar.get(UID_COOKIE)?.value;
  let setCookie = false;
  if (!uid) {
    uid = randomUUID();
    setCookie = true;
  }
  const user = await getStore().getUser(uid);
  const res = NextResponse.json({ userId: uid, plan: user.plan, freeEndpointCap: FREE_ENDPOINT_CAP });
  if (setCookie) res.cookies.set(UID_COOKIE, uid, { httpOnly: true, sameSite: "lax", path: "/" });
  return res;
}
