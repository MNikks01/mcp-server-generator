// Identity for the MVP. A cookie-based anonymous user id is enough to attach a
// session's saved generations (history). MCPForge is free & open source — there
// is no plan or billing identity to track.
//
// PRODUCTION SWAP: replace getUserId() with Clerk's `auth()` (per TECH_STACK.md).
// Everything downstream (the store) is identity-source-agnostic.

import { cookies } from "next/headers";

export const UID_COOKIE = "mcpforge_uid";

export async function getUserId(): Promise<string | null> {
  const jar = await cookies(); // Next 16: cookies() is async
  return jar.get(UID_COOKIE)?.value ?? null;
}
