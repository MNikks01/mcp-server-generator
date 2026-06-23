import JSZip from "jszip";
import type { FileDoc } from "@/lib/engine/codebase/types";

// Read an uploaded codebase .zip into in-memory source files for the scanner.
// Mirrors the CLI walker's filters (skip junk dirs, keep source + package.json),
// so web scan results match `mcpforge scan` on the same project.

const KEEP_EXT = /\.(ts|tsx|js|jsx|mjs|cjs|py)$/;
const SKIP_DIR = /(?:^|\/)(?:node_modules|\.git|\.next|\.nuxt|dist|build|out|coverage|vendor|\.venv|venv|__pycache__|\.turbo|\.cache|tmp)\//;
const MAX_FILES = 4000;
const MAX_FILE_BYTES = 512 * 1024;

export async function unzipToFileDocs(data: ArrayBuffer | Buffer): Promise<FileDoc[]> {
  const zip = await JSZip.loadAsync(data);
  const files: FileDoc[] = [];
  for (const entry of Object.values(zip.files)) {
    if (files.length >= MAX_FILES) break;
    if (entry.dir) continue;
    const path = entry.name;
    if (SKIP_DIR.test(path)) continue;
    const base = path.split("/").pop() ?? "";
    if (!(KEEP_EXT.test(base) || base === "package.json")) continue;
    const content = await entry.async("string");
    if (content.length > MAX_FILE_BYTES) continue;
    files.push({ path, content });
  }
  return files;
}
