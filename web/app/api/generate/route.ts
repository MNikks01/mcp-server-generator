import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import type { IR } from "@/lib/engine/ir/types";
import { build } from "@/lib/engine/generator/build";
import { ClaudeDescriptions } from "@/lib/engine/generator/descriptions";
import { getUserId } from "@/lib/identity";
import { getStore } from "@/lib/db/store";

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

  const userId = await getUserId();
  const store = getStore();

  // Free & open source: unlimited endpoints for everyone. Premium descriptions are
  // used whenever an LLM key is configured; otherwise the (excellent) spec-derived
  // descriptions are used.
  const key = process.env.ANTHROPIC_API_KEY;
  const descriptionGenerator = key ? new ClaudeDescriptions(key, "claude-sonnet-4-6") : undefined;

  const ir = selectTools(body.ir, body.selectedTools);
  const result = await build(ir, { descriptionGenerator });

  // Persist to history for the current session (so it can be listed/re-downloaded).
  let generationId: string | undefined;
  if (userId) {
    generationId = randomUUID();
    await store.saveGeneration({
      id: generationId,
      userId,
      name: result.name,
      ir,
      descriptions: result.descriptions,
      endpointCount: result.toolCount,
      createdAt: new Date().toISOString(),
    });
  }

  return NextResponse.json({
    generationId,
    name: result.name,
    files: result.files,
    descriptions: result.descriptions,
    toolCount: result.toolCount,
  });
}
