import { NextResponse } from "next/server";
import { getUserId } from "@/lib/identity";
import { getStore } from "@/lib/db/store";

export const runtime = "nodejs";

// List the signed-in user's saved generations (Pro feature).
export async function GET() {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ generations: [] });
  const store = getStore();
  const plan = (await store.getUser(userId)).plan;
  if (plan !== "pro") {
    return NextResponse.json({ error: { code: "pro_required", message: "Saved history is a Pro feature." } }, { status: 402 });
  }
  const list = await store.listGenerations(userId);
  return NextResponse.json({
    generations: list.map((g) => ({
      id: g.id,
      name: g.name,
      endpointCount: g.endpointCount,
      createdAt: g.createdAt,
    })),
  });
}
