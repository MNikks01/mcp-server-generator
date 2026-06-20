import { NextResponse } from "next/server";
import { getUserId } from "@/lib/identity";
import { getStore } from "@/lib/db/store";

export const runtime = "nodejs";

// DEV ONLY — lets us verify the gating mechanic without a live Stripe account.
// Enabled only when ALLOW_DEV_PLAN=1. Never enable in production.
export async function POST(req: Request) {
  if (process.env.ALLOW_DEV_PLAN !== "1") {
    return NextResponse.json({ error: "disabled" }, { status: 403 });
  }
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "no session (call /api/me first)" }, { status: 401 });
  const { plan } = await req.json().catch(() => ({ plan: "free" }));
  await getStore().setPlan(userId, plan === "pro" ? "pro" : "free");
  return NextResponse.json({ ok: true, plan: plan === "pro" ? "pro" : "free" });
}
