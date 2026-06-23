import { NextResponse } from "next/server";
import { getUserId } from "@/lib/identity";
import { getStore } from "@/lib/db/store";

export const runtime = "nodejs";

// List the current session's saved generations. Free & open source — available to everyone.
export async function GET() {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ generations: [] });
  const store = getStore();
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
