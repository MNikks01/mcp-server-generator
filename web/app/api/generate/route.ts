import { NextResponse } from "next/server";
import type { IR } from "@/lib/engine/ir/types";
import { build } from "@/lib/engine/generator/build";
import { ClaudeDescriptions } from "@/lib/engine/generator/descriptions";
import { getUserId } from "@/lib/identity";
import { getStore } from "@/lib/db/store";
import { checkEndpointLimit, planLimits, type Plan } from "@/lib/plan";

export const runtime = "nodejs";

function selectTools(ir: IR, selected?: string[]): IR {
  if (!selected || selected.length === 0) return ir;
  const set = new Set(selected);
  return { ...ir, tools: ir.tools.filter((t) => set.has(t.name)) };
}

export async function POST(req: Request) {
  let body: { ir?: IR; selectedTools?: string[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: { code: "invalid_request", message: "Body must be JSON." } }, { status: 400 });
  }
  if (!body.ir?.tools?.length) {
    return NextResponse.json({ error: { code: "invalid_request", message: "Missing IR. Parse a spec first." } }, { status: 400 });
  }

  // Resolve plan (anonymous = free) and enforce the free endpoint cap.
  const userId = await getUserId();
  const plan: Plan = userId ? (await getStore().getUser(userId)).plan : "free";
  const count = body.selectedTools?.length ?? body.ir.tools.length;
  const limit = checkEndpointLimit(plan, count);
  if (!limit.ok) {
    return NextResponse.json({ error: { code: "endpoint_limit", message: limit.message } }, { status: 402 });
  }

  // Pro gets premium descriptions when an LLM key is configured; otherwise both fall
  // back to the (excellent) spec-derived descriptions.
  const key = process.env.ANTHROPIC_API_KEY;
  const descriptionGenerator =
    planLimits(plan).premiumDescriptions && key ? new ClaudeDescriptions(key, "claude-sonnet-4-6") : undefined;

  const ir = selectTools(body.ir, body.selectedTools);
  const result = await build(ir, { descriptionGenerator });
  return NextResponse.json({
    name: result.name,
    files: result.files,
    descriptions: result.descriptions,
    toolCount: result.toolCount,
    plan,
  });
}
