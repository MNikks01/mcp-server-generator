// Identity for the MVP. A cookie-based anonymous user id is enough to attach a plan
// and a Stripe customer for the gating + upgrade flow.
//
// PRODUCTION SWAP: replace getUserId() with Clerk's `auth()` (per TECH_STACK.md). The
// rest of the money mechanic (plan/store/Stripe) is identity-source-agnostic.

import { cookies } from "next/headers";

export const UID_COOKIE = "mcpforge_uid";

export async function getUserId(): Promise<string | null> {
  const jar = await cookies(); // Next 16: cookies() is async
  return jar.get(UID_COOKIE)?.value ?? null;
}
