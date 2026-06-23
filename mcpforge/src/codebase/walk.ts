// Codebase walker — read a repo directory into in-memory source files.
// Zero-network, dependency-free. The discoverers (discover.ts) operate on the
// returned FileDoc[], so they stay pure and unit-testable without touching disk.

import { type Dirent, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

export interface FileDoc {
  /** Repo-relative path, always using forward slashes (stable across OSes). */
  path: string;
  content: string;
}

// Directories that never contain the user's own API definitions.
const SKIP_DIRS = new Set([
  "node_modules",
  ".git",
  ".next",
  ".nuxt",
  "dist",
  "build",
  "out",
  "coverage",
  "vendor",
  ".venv",
  "venv",
  "__pycache__",
  ".turbo",
  ".cache",
  "tmp",
]);

// Source extensions we know how to scan for routes.
const KEEP_EXT = /\.(ts|tsx|js|jsx|mjs|cjs|py)$/;

export interface WalkOptions {
  maxFiles?: number; // safety cap on file count
  maxFileBytes?: number; // skip very large files (likely generated/bundled)
}

const DEFAULTS: Required<WalkOptions> = { maxFiles: 5000, maxFileBytes: 512 * 1024 };

/** Recursively read source files under `root` into FileDoc[]. */
export function walkCodebase(root: string, options: WalkOptions = {}): FileDoc[] {
  const opts = { ...DEFAULTS, ...options };
  const files: FileDoc[] = [];

  const visit = (dir: string): void => {
    if (files.length >= opts.maxFiles) return;
    let entries: Dirent[];
    try {
      entries = readdirSync(dir, { withFileTypes: true });
    } catch {
      return; // unreadable dir — skip rather than crash
    }
    for (const entry of entries) {
      if (files.length >= opts.maxFiles) return;
      const full = join(dir, entry.name);
      if (entry.isDirectory()) {
        if (SKIP_DIRS.has(entry.name) || entry.name.startsWith(".")) continue;
        visit(full);
      } else if (entry.isFile() && (KEEP_EXT.test(entry.name) || entry.name === "package.json")) {
        let size = 0;
        try {
          size = statSync(full).size;
        } catch {
          continue;
        }
        if (size > opts.maxFileBytes) continue;
        let content: string;
        try {
          content = readFileSync(full, "utf8");
        } catch {
          continue;
        }
        files.push({ path: relative(root, full).split(sep).join("/"), content });
      }
    }
  };

  visit(root);
  return files;
}

/** Best-effort project name: the `name` field of the nearest root package.json. */
export function readProjectName(files: FileDoc[]): string | undefined {
  const pkg = files.find((f) => f.path === "package.json");
  if (!pkg) return undefined;
  try {
    const name = (JSON.parse(pkg.content) as { name?: unknown }).name;
    return typeof name === "string" && name.trim() ? name : undefined;
  } catch {
    return undefined;
  }
}
