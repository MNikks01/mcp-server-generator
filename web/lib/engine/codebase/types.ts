// GENERATED from mcpforge/src/codebase/types.ts — DO NOT EDIT.
// Single source of truth: mcpforge/src. Regenerate via: node mcpforge/scripts/sync-engine.mjs

// Shared, dependency-free types for the codebase scanner. Kept separate from walk.ts
// (which imports node:fs) so the pure discovery + scan path can be bundled by the web
// app without pulling the filesystem walker into the browser-facing build graph.

export interface FileDoc {
  /** Repo-relative path, always using forward slashes (stable across OSes). */
  path: string;
  content: string;
}

/** Best-effort project name: the `name` field of the nearest root package.json. */
export function readProjectName(files: FileDoc[]): string | undefined {
  const pkg = files.find((f) => f.path === "package.json" || f.path.endsWith("/package.json"));
  if (!pkg) return undefined;
  try {
    const name = (JSON.parse(pkg.content) as { name?: unknown }).name;
    return typeof name === "string" && name.trim() ? name : undefined;
  } catch {
    return undefined;
  }
}
