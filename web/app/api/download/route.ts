import type { IR } from "@/lib/engine/ir/types";
import { build } from "@/lib/engine/generator/build";
import { zipFiles } from "@/lib/zip";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: { ir?: IR; selectedTools?: string[] };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Body must be JSON." }), { status: 400 });
  }
  if (!body.ir?.tools?.length) {
    return new Response(JSON.stringify({ error: "Missing IR." }), { status: 400 });
  }

  const ir = body.selectedTools?.length
    ? { ...body.ir, tools: body.ir.tools.filter((t) => body.selectedTools!.includes(t.name)) }
    : body.ir;

  const result = await build(ir);
  const zip = await zipFiles(result.name, result.files);

  return new Response(new Uint8Array(zip), {
    status: 200,
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${result.name}.zip"`,
    },
  });
}
