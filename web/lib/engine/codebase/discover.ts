// GENERATED from mcpforge/src/codebase/discover.ts — DO NOT EDIT.
// Single source of truth: mcpforge/src. Regenerate via: node mcpforge/scripts/sync-engine.mjs

// Route discovery — find HTTP endpoints defined in source code and normalize them
// into IR tools. Heuristic, dependency-free, zero-network. Pure functions over
// FileDoc[], so the whole thing is unit-testable without a real repo.
//
// Supported: Express / Node (REST, incl. app.use('/api', router) mount prefixes),
// Next.js API routes (app router + pages/api), Fastify, NestJS, FastAPI, Flask.
// Auth is inferred from common middleware/usage (detectSecurity).

import type { IRParam, IRSecurity, IRTool } from "../ir/types";
import type { FileDoc } from "./types";

const SIDE_EFFECTING = new Set(["POST", "PUT", "PATCH", "DELETE"]);
const HTTP = "get|post|put|patch|delete|all|options|head";

export interface RawRoute {
  method: string; // upper-case HTTP method (ALL -> GET)
  rawPath: string; // framework-native path, e.g. "/users/:id" or "[id]"
  framework: string;
}

const isNode = (f: FileDoc): boolean => /\.(ts|tsx|js|jsx|mjs|cjs)$/.test(f.path);
const isPython = (f: FileDoc): boolean => f.path.endsWith(".py");

function normMethod(m: string): string {
  const up = m.toUpperCase();
  return up === "ALL" ? "GET" : up;
}

// ---------------------------------------------------------------------------
// Path normalization: every framework's param syntax -> IR's `{param}` form.
// ---------------------------------------------------------------------------
export function normalizePath(raw: string): string {
  let p = raw.trim().split("?")[0].split("#")[0];
  p = p.replace(/<(?:[^:>]+:)?([A-Za-z0-9_]+)>/g, "{$1}"); // flask <int:id> / <id> (before :id, which would match inside it)
  p = p.replace(/:([A-Za-z0-9_]+)(\([^)]*\))?/g, "{$1}"); // express/fastify :id, :id(\d+)
  p = p.replace(/\[\[?\.\.\.([A-Za-z0-9_]+)\]?\]/g, "{$1}"); // next [...slug] / [[...slug]]
  p = p.replace(/\[([A-Za-z0-9_]+)\]/g, "{$1}"); // next [id]
  const segs = p.split("/").filter((s) => s.length > 0 && !/^\(.*\)$/.test(s)); // drop next (route groups)
  let out = "/" + segs.join("/");
  if (out.length > 1 && out.endsWith("/")) out = out.slice(0, -1);
  return out || "/";
}

function joinPaths(base: string, sub: string): string {
  const a = base.replace(/\/+$/, "");
  const b = sub.replace(/^\/+/, "");
  if (!b) return a || "/";
  return `${a}/${b}`;
}

function snake(input: string): string {
  return input
    .replace(/[{}]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "")
    .toLowerCase();
}

// ---------------------------------------------------------------------------
// Express / Fastify (method calls + route chains + app.use mount prefixes)
// ---------------------------------------------------------------------------

interface ExprCall {
  ident: string; // the receiver, e.g. `router` in router.get(...)
  method: string;
  rawPath: string;
}
interface Mount {
  parent: string;
  prefix: string;
  child: string;
}

// `app.get('/x')`, `router.post('/y')`, `fastify.delete('/z')` — capture the receiver
// identifier so we can later apply its mount prefix.
function collectMethodCalls(content: string): ExprCall[] {
  const re = new RegExp(`\\b([A-Za-z_$][\\w$]*)\\s*\\.\\s*(${HTTP})\\s*\\(\\s*(['"\`])(\\/[^'"\`]*)\\3`, "g");
  const out: ExprCall[] = [];
  for (const m of content.matchAll(re)) {
    if (m[2] === "options" || m[2] === "head" || m[1] === "use") continue;
    out.push({ ident: m[1], method: normMethod(m[2]), rawPath: m[4] });
  }
  return out;
}

// `app.route('/x').get(...).post(...)` — express chained form.
function collectRouteChains(content: string): ExprCall[] {
  const re = new RegExp(
    `\\b([A-Za-z_$][\\w$]*)\\s*\\.\\s*route\\s*\\(\\s*(['"\`])(\\/[^'"\`]*)\\2\\s*\\)((?:\\s*\\.\\s*(?:${HTTP})\\s*\\([^)]*\\))+)`,
    "g",
  );
  const out: ExprCall[] = [];
  for (const m of content.matchAll(re)) {
    const ident = m[1];
    const path = m[3];
    for (const mm of m[4].matchAll(new RegExp(`\\.\\s*(${HTTP})\\s*\\(`, "g"))) {
      if (mm[1] === "options" || mm[1] === "head") continue;
      out.push({ ident, method: normMethod(mm[1]), rawPath: path });
    }
  }
  return out;
}

// `app.use('/api', router)` — record parent, prefix, mounted child router.
function collectMounts(content: string): Mount[] {
  const re = /\b([A-Za-z_$][\w$]*)\s*\.\s*use\s*\(\s*(['"`])(\/[^'"`]*)\2\s*,\s*([A-Za-z_$][\w$]*)/g;
  const out: Mount[] = [];
  for (const m of content.matchAll(re)) out.push({ parent: m[1], prefix: m[3], child: m[4] });
  return out;
}

function joinPrefix(a: string, b: string): string {
  const combined = (a + "/" + b).replace(/\/+/g, "/");
  return combined === "/" ? "" : combined.replace(/\/$/, "");
}

// Resolve the set of effective prefixes for a router identifier by walking the mount
// graph back to a root (an identifier never mounted as a child). Cycle-guarded.
function resolvePrefixes(ident: string, byChild: Map<string, Mount[]>, visiting = new Set<string>()): string[] {
  const mounts = byChild.get(ident);
  if (!mounts || mounts.length === 0) return [""]; // root-level
  if (visiting.has(ident)) return [""]; // cycle guard
  visiting.add(ident);
  const prefixes: string[] = [];
  for (const m of mounts) {
    for (const pp of resolvePrefixes(m.parent, byChild, visiting)) prefixes.push(joinPrefix(pp, m.prefix));
  }
  visiting.delete(ident);
  return prefixes.length ? [...new Set(prefixes)] : [""];
}

function discoverExpress(nodeFiles: FileDoc[]): RawRoute[] {
  const calls: ExprCall[] = [];
  const mounts: Mount[] = [];
  for (const f of nodeFiles) {
    calls.push(...collectMethodCalls(f.content), ...collectRouteChains(f.content));
    mounts.push(...collectMounts(f.content));
  }
  const byChild = new Map<string, Mount[]>();
  for (const m of mounts) {
    const list = byChild.get(m.child) ?? [];
    list.push(m);
    byChild.set(m.child, list);
  }
  const out: RawRoute[] = [];
  for (const c of calls) {
    for (const prefix of resolvePrefixes(c.ident, byChild)) {
      out.push({ method: c.method, rawPath: prefix ? joinPrefix(prefix, c.rawPath) : c.rawPath, framework: "express" });
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// Other Node frameworks
// ---------------------------------------------------------------------------

function discoverFastifyObjectRoutes(content: string): RawRoute[] {
  const out: RawRoute[] = [];
  for (const m of content.matchAll(/\.\s*route\s*\(\s*\{([\s\S]*?)\}\s*\)/g)) {
    const body = m[1];
    const urlM = body.match(/\burl\s*:\s*(['"`])(\/[^'"`]*)\1/);
    if (!urlM) continue;
    const path = urlM[2];
    const arr = body.match(/\bmethod\s*:\s*\[([^\]]*)\]/);
    const single = body.match(/\bmethod\s*:\s*(['"`])(\w+)\1/);
    const methods = arr ? [...arr[1].matchAll(/['"`](\w+)['"`]/g)].map((x) => x[1]) : single ? [single[2]] : [];
    for (const method of methods) out.push({ method: normMethod(method), rawPath: path, framework: "fastify" });
  }
  return out;
}

function discoverNest(content: string): RawRoute[] {
  if (!/@Controller\s*\(/.test(content)) return [];
  const controllers: { index: number; base: string }[] = [];
  for (const m of content.matchAll(/@Controller\s*\(\s*(?:(['"`])([^'"`]*)\1)?[^)]*\)/g)) {
    controllers.push({ index: m.index ?? 0, base: m[2] ?? "" });
  }
  const out: RawRoute[] = [];
  for (const m of content.matchAll(/@(Get|Post|Put|Patch|Delete)\s*\(\s*(?:(['"`])([^'"`]*)\2)?[^)]*\)/g)) {
    const idx = m.index ?? 0;
    const base = [...controllers].reverse().find((c) => c.index < idx)?.base ?? "";
    out.push({ method: normMethod(m[1]), rawPath: joinPaths("/" + base, m[3] ?? ""), framework: "nestjs" });
  }
  return out;
}

function discoverNextAppRoute(file: FileDoc): RawRoute[] {
  if (!/(?:^|\/)(?:src\/)?app\/.*route\.(?:ts|tsx|js|jsx|mjs)$/.test(file.path)) return [];
  const segs = file.path.split("/");
  const appIdx = segs.lastIndexOf("app");
  if (appIdx === -1) return [];
  const between = segs.slice(appIdx + 1, segs.length - 1); // drop the route.* filename
  const routePath = normalizePath("/" + between.join("/"));
  const methods = new Set<string>();
  for (const m of file.content.matchAll(/export\s+(?:async\s+)?function\s+(GET|POST|PUT|PATCH|DELETE)\b/g)) methods.add(m[1]);
  for (const m of file.content.matchAll(/export\s+const\s+(GET|POST|PUT|PATCH|DELETE)\s*=/g)) methods.add(m[1]);
  return [...methods].map((method) => ({ method, rawPath: routePath, framework: "nextjs" }));
}

function discoverNextPagesApi(file: FileDoc): RawRoute[] {
  const m = file.path.match(/(?:^|\/)(?:src\/)?pages\/api\/(.*)\.(?:ts|tsx|js|jsx|mjs)$/);
  if (!m) return [];
  const rel = m[1].replace(/\/index$/, "").replace(/^index$/, "");
  return [{ method: "GET", rawPath: normalizePath("/api/" + rel), framework: "nextjs" }];
}

// ---------------------------------------------------------------------------
// Python frameworks
// ---------------------------------------------------------------------------

function discoverFastApi(content: string): RawRoute[] {
  const out: RawRoute[] = [];
  for (const m of content.matchAll(/@\s*[A-Za-z_]\w*\.(get|post|put|patch|delete)\s*\(\s*(['"])(\/[^'"]*)\2/g)) {
    out.push({ method: normMethod(m[1]), rawPath: m[3], framework: "fastapi" });
  }
  return out;
}

function discoverFlask(content: string): RawRoute[] {
  const out: RawRoute[] = [];
  for (const m of content.matchAll(/@\s*[A-Za-z_]\w*\.route\s*\(\s*(['"])([^'"]+)\1([^)]*)\)/g)) {
    const path = m[2];
    const methodsM = m[3].match(/methods\s*=\s*\[([^\]]*)\]/);
    const methods = methodsM ? [...methodsM[1].matchAll(/['"](\w+)['"]/g)].map((x) => x[1]) : ["GET"];
    for (const method of methods) out.push({ method: normMethod(method), rawPath: path, framework: "flask" });
  }
  return out;
}

// ---------------------------------------------------------------------------
// Auth detection — infer a single IRSecurity for the generated server.
// ---------------------------------------------------------------------------
export function detectSecurity(files: FileDoc[]): IRSecurity {
  let apiKeyHeader: string | undefined;
  let oauth2 = false;
  let bearer = false;

  const API_KEY_RE = /['"]([Xx]-[Aa]pi-?[Kk]ey|[Aa]pi[-_]?[Kk]ey)['"]/;
  const OAUTH_RE = /OAuth2PasswordBearer|OAuth2AuthorizationCodeBearer|\boauth2\b/;
  const BEARER_RE =
    /jsonwebtoken|jwt\.verify|express-jwt|passport|next-auth|getServerSession|@clerk|clerkMiddleware|getAuth\s*\(|HTTPBearer|flask[-_]?jwt|@login_required|requireAuth|authenticate\s*\(|verifyToken|Bearer\s|Authorization/;

  for (const f of files) {
    if (f.path.endsWith("package.json")) continue; // deps aren't usage
    const c = f.content;
    if (!apiKeyHeader) {
      const m = c.match(API_KEY_RE);
      if (m) apiKeyHeader = /x-/i.test(m[1]) ? "x-api-key" : m[1].toLowerCase();
    }
    if (OAUTH_RE.test(c)) oauth2 = true;
    if (BEARER_RE.test(c)) bearer = true;
  }

  if (apiKeyHeader) return { type: "apiKey", name: apiKeyHeader, in: "header" };
  if (oauth2) return { type: "oauth2" };
  if (bearer) return { type: "bearer" };
  return { type: "none" };
}

// ---------------------------------------------------------------------------
// Orchestration
// ---------------------------------------------------------------------------

export function discoverRoutes(files: FileDoc[]): RawRoute[] {
  const nodeFiles = files.filter(isNode);
  const routes: RawRoute[] = [];

  // Express/Fastify-method-call routes need a cross-file pass (mount prefixes).
  routes.push(...discoverExpress(nodeFiles));

  for (const file of nodeFiles) {
    routes.push(...discoverNextAppRoute(file));
    routes.push(...discoverNextPagesApi(file));
    routes.push(...discoverNest(file.content));
    routes.push(...discoverFastifyObjectRoutes(file.content));
  }
  for (const file of files) {
    if (!isPython(file)) continue;
    routes.push(...discoverFastApi(file.content));
    routes.push(...discoverFlask(file.content));
  }
  return routes;
}

/** Normalize + dedupe RawRoute[] into IR tools (path params + a body param for writes). */
export function routesToTools(routes: RawRoute[]): IRTool[] {
  const tools: IRTool[] = [];
  const seenRoutes = new Set<string>();
  const usedNames = new Set<string>();

  for (const route of routes) {
    const path = normalizePath(route.rawPath);
    const method = route.method.toUpperCase();
    const routeKey = `${method} ${path}`;
    if (seenRoutes.has(routeKey)) continue;
    seenRoutes.add(routeKey);

    const params: IRParam[] = [];
    for (const pm of path.matchAll(/\{([A-Za-z0-9_]+)\}/g)) {
      params.push({ name: pm[1], in: "path", required: true, schemaType: "string" });
    }
    const sideEffecting = SIDE_EFFECTING.has(method);
    if (sideEffecting) {
      params.push({ name: "body", in: "body", required: false, schemaType: "object", description: "Request body (JSON)." });
    }

    let name = snake(`${method}_${path}`) || snake(`${route.framework}_${method}`) || `tool_${tools.length}`;
    while (usedNames.has(name)) name = `${name}_${tools.length}`;
    usedNames.add(name);

    tools.push({
      name,
      method,
      path,
      summary: `${method} ${path} (discovered in ${route.framework} source)`,
      params,
      sideEffecting,
    });
  }

  return tools;
}
