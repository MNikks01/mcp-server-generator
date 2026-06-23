import { NextResponse } from "next/server";
import { scanFilesToIR, ScanError } from "@/lib/engine/codebase/scan";
import { unzipToFileDocs } from "@/lib/unzip";

export const runtime = "nodejs";

const MAX_ZIP_BYTES = 20_000_000; // 20MB

// Scan an uploaded codebase (.zip) -> IR. Same IR shape as /api/parse, so the rest of
// the UI (select endpoints -> generate -> download) is unchanged.
export async function POST(req: Request) {
  const form = await req.formData().catch(() => null);
  if (!form) {
    return NextResponse.json({ error: { code: "invalid_request", message: "Expected multipart form-data." } }, { status: 400 });
  }
  const file = form.get("file");
  const baseUrl = (form.get("baseUrl") as string) || undefined;
  if (!(file instanceof File)) {
    return NextResponse.json({ error: { code: "invalid_request", message: "Upload a .zip of your codebase." } }, { status: 400 });
  }
  if (file.size > MAX_ZIP_BYTES) {
    return NextResponse.json({ error: { code: "zip_too_large", message: "Zip exceeds 20MB." } }, { status: 413 });
  }

  try {
    const files = await unzipToFileDocs(Buffer.from(await file.arrayBuffer()));
    if (files.length === 0) {
      return NextResponse.json({ error: { code: "empty_zip", message: "No source files found in the zip." } }, { status: 400 });
    }
    const ir = scanFilesToIR(files, { baseUrl });
    return NextResponse.json({ ir, fileCount: files.length });
  } catch (e) {
    const msg = e instanceof ScanError ? e.message : "Could not scan the codebase.";
    return NextResponse.json({ error: { code: "scan_failed", message: msg } }, { status: 400 });
  }
}
