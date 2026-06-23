// Route discovery — find HTTP endpoints defined in source code and normalize them
// into IR tools. Heuristic, dependency-free, zero-network. Each discoverer is a pure
// function over FileDoc[], so the whole thing is unit-testable without a real repo.
//
// Supported: Express / Node (REST), Next.js API routes (app router + pages/api),
// Fastify, NestJS controllers, FastAPI, Flask. Adding a framework = one more
// discoverer that emits RawRoute[]. Everything funnels through routesToTools().

import type { IRParam, IRTool } from "../ir/types.ts";
import type { FileDoc } from "./walk.ts";

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
// Discoverers (Node)
// ---------------------------------------------------------------------------

// `app.get('/x')`, `router.post('/y')`, `fastify.delete('/z')` — any identifier
// calling an HTTP method with a string path that starts with '/'.
function discoverMethodCalls(content: string, framework: string): RawRoute[] {
  const re = new RegExp(`\\b[A-Za-z_$][\\w$]*\\s*\\.\\s*(${HTTP})\\s*\\(\\s*(['"\`])(\\/[^'"\`]*)\\2`, "g");
  const out: RawRoute[] = [];
  for (const m of content.matchAll(re)) {
    const method = m[1];
    if (method === "options" || method === "head") continue;
    out.push({ method: normMethod(method), rawPath: m[3], framework });
  }
  return out;
}

// `app.route('/x').get(...).post(...)` — express chained form.
function discoverExpressRouteChains(content: string): RawRoute[] {
  const re = new RegExp(
    `\\.\\s*route\\s*\\(\\s*(['"\`])(\\/[^'"\`]*)\\1\\s*\\)((?:\\s*\\.\\s*(?:${HTTP})\\s*\\([^)]*\\))+)`,
    "g",
  );
  const out: RawRoute[] = [];
  for (const m of content.matchAll(re)) {
    const path = m[2];
    for (const mm of m[3].matchAll(new RegExp(`\\.\\s*(${HTTP})\\s*\\(`, "g"))) {
      const method = mm[1];
      if (method === "options" || method === "head") continue;
      out.push({ method: normMethod(method), rawPath: path, framework: "express" });
    }
  }
  return out;
}

// Fastify object form: `fastify.route({ method: 'GET', url: '/x' })` (method may be an array).
function discoverFastifyObjectRoutes(content: string): RawRoute[] {
  const out: RawRoute[] = [];
  for (const m of content.matchAll(/\.\s*route\s*\(\s*\{([\s\S]*?)\}\s*\)/g)) {
    const body = m[1];
    const urlM = body.match(/\burl\s*:\s*(['"`])(\/[^'"`]*)\1/);
    if (!urlM) continue;
    const path = urlM[2];
    const arr = body.match(/\bmethod\s*:\s*\[([^\]]*)\]/);
    const single = body.match(/\bmethod\s*:\s*(['"`])(\w+)\1/);
    const methods = arr
      ? [...arr[1].matchAll(/['"`](\w+)['"`]/g)].map((x) => x[1])
      : single
        ? [single[2]]
        : [];
    for (const method of methods) out.push({ method: normMethod(method), rawPath: path, framework: "fastify" });
  }
  return out;
}

// NestJS: combine each `@Get('sub')`/`@Post()` with the nearest preceding `@Controller('base')`.
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

// Next.js app router: a `route.ts` file's directory between `app/` and `route` is the path;
// exported GET/POST/... functions are the methods.
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

// Next.js pages/api: file path is the route; the default handler is method-agnostic, so emit GET.
function discoverNextPagesApi(file: FileDoc): RawRoute[] {
  const m = file.path.match(/(?:^|\/)(?:src\/)?pages\/api\/(.*)\.(?:ts|tsx|js|jsx|mjs)$/);
  if (!m) return [];
  let rel = m[1].replace(/\/index$/, "").replace(/^index$/, "");
  return [{ method: "GET", rawPath: normalizePath("/api/" + rel), framework: "nextjs" }];
}

// ---------------------------------------------------------------------------
// Discoverers (Python)
// ---------------------------------------------------------------------------

// FastAPI: `@app.get("/x")`, `@router.post("/x")`.
function discoverFastApi(content: string): RawRoute[] {
  const out: RawRoute[] = [];
  for (const m of content.matchAll(/@\s*[A-Za-z_]\w*\.(get|post|put|patch|delete)\s*\(\s*(['"])(\/[^'"]*)\2/g)) {
    out.push({ method: normMethod(m[1]), rawPath: m[3], framework: "fastapi" });
  }
  return out;
}

// Flask: `@app.route("/x", methods=["GET","POST"])` (defaults to GET).
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
// Orchestration
// ---------------------------------------------------------------------------

export function discoverRoutes(files: FileDoc[]): RawRoute[] {
  const routes: RawRoute[] = [];
  for (const file of files) {
    if (isNode(file)) {
      routes.push(...discoverNextAppRoute(file));
      routes.push(...discoverNextPagesApi(file));
      routes.push(...discoverNest(file.content));
      routes.push(...discoverFastifyObjectRoutes(file.content));
      routes.push(...discoverExpressRouteChains(file.content));
      routes.push(...discoverMethodCalls(file.content, "express"));
    } else if (isPython(file)) {
      routes.push(...discoverFastApi(file.content));
      routes.push(...discoverFlask(file.content));
    }
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
