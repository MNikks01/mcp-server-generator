// Codebase walker — read a repo directory into in-memory source files, then hand off
// to the pure scanner (scan.ts). This is the filesystem entry point (CLI); the web app
// builds FileDoc[] from an uploaded zip instead and calls scanFilesToIR directly.

import { type Dirent, readdirSync, readFileSync, statSync } from "node:fs";
import { basename, join, relative, sep } from "node:path";
import type { IR } from "../ir/types.ts";
import type { FileDoc } from "./types.ts";
import { readProjectName } from "./types.ts";
import { scanFilesToIR, type ScanOptions, ScanError } from "./scan.ts";

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

/** Walk a repo directory and assemble an IR. */
export function scanCodebase(dir: string, opts: ScanOptions = {}): IR {
  const files = walkCodebase(dir);
  if (files.length === 0) throw new ScanError(`No source files found under ${dir}.`);
  const title = opts.title ?? readProjectName(files) ?? (basename(dir.replace(/\/+$/, "")) || "Generated API");
  return scanFilesToIR(files, { ...opts, title });
}
