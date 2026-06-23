// Codebase -> IR. The second front door into the engine (the first is OpenAPI).
// `OpenAPI -> IR` and `codebase -> IR` both produce the same IR, so the generator,
// ZIP output, and web layer are unchanged (see ir/types.ts — the keystone).

import { basename } from "node:path";
import type { IR, IRTool } from "../ir/types.ts";
import { type FileDoc, readProjectName, walkCodebase } from "./walk.ts";
import { discoverRoutes, routesToTools } from "./discover.ts";

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
    // Auth can't be inferred reliably from source; default to none and let users
    // wire a token via env (the generated server already supports that).
    security: { type: "none" },
    tools,
  };
}

/** Walk a repo directory and assemble an IR. */
export function scanCodebase(dir: string, opts: ScanOptions = {}): IR {
  const files = walkCodebase(dir);
  if (files.length === 0) throw new ScanError(`No source files found under ${dir}.`);
  const title = opts.title ?? readProjectName(files) ?? (basename(dir.replace(/\/+$/, "")) || "Generated API");
  return scanFilesToIR(files, { ...opts, title });
}
