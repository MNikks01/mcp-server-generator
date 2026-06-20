import type { IR } from "@/lib/engine/ir/types";
import { build } from "@/lib/engine/generator/build";
import { zipFiles } from "@/lib/zip";
import { getUserId } from "@/lib/identity";
import { getStore } from "@/lib/db/store";

export const runtime = "nodejs";

// Re-download a saved generation as a zip (owner only). Next 16: params is async.
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const userId = await getUserId();
  const rec = await getStore().getGeneration(id);
  if (!rec || !userId || rec.userId !== userId) {
    return new Response(JSON.stringify({ error: "not found" }), { status: 404 });
  }
  const result = await build(rec.ir as IR);
  const zip = await zipFiles(result.name, result.files);
  return new Response(new Uint8Array(zip), {
    status: 200,
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${result.name}.zip"`,
    },
  });
}
