// GENERATED from mcpforge/src/codebase/scan.ts — DO NOT EDIT.
// Single source of truth: mcpforge/src. Regenerate via: node mcpforge/scripts/sync-engine.mjs

// Codebase -> IR (pure core). The second front door into the engine (the first is
// OpenAPI). Both produce the same IR, so the generator, ZIP output, and web layer are
// unchanged (see ir/types.ts — the keystone). This module is dependency-free and
// filesystem-free, so the web app can run it on files unzipped from an upload; the
// CLI's directory entry point (scanCodebase) lives in walk.ts.

import type { IR, IRTool } from "../ir/types";
import type { FileDoc } from "./types";
import { readProjectName } from "./types";
import { detectSecurity, discoverRoutes, routesToTools } from "./discover";

export class ScanError extends Error {}

export interface ScanOptions {
  /** Base URL the generated server calls (codebases rarely declare it). */
  baseUrl?: string;
  title?: string;
}

/** Discover routes in already-loaded files and assemble an IR (pure; no disk access). */
export function scanFilesToIR(files: FileDoc[], opts: ScanOptions = {}): IR {
  const tools: IRTool[] = routesToTools(discoverRoutes(files));
  if (tools.length === 0) {
    throw new ScanError(
      "No HTTP routes found. Supported: Express/Node, Next.js (app router + pages/api), Fastify, NestJS, FastAPI, Flask.",
    );
  }
  return {
    title: opts.title ?? readProjectName(files) ?? "Generated API",
    version: "1.0.0",
    baseUrl: opts.baseUrl ?? "http://localhost:3000",
    security: detectSecurity(files),
    tools,
  };
}
