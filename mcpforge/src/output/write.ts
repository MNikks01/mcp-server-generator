// File-map output. The web layer (Phase B) will zip this map in-memory (jszip);
// the CLI/demo writes it to disk. Same file map, two sinks.

import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

export async function writeFiles(targetDir: string, files: Record<string, string>): Promise<void> {
  for (const [relPath, content] of Object.entries(files)) {
    const full = join(targetDir, relPath);
    await mkdir(dirname(full), { recursive: true });
    await writeFile(full, content, "utf8");
  }
}
