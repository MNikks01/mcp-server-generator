// GENERATED from mcpforge/src/openapi/parse.ts — DO NOT EDIT.
// Single source of truth: mcpforge/src. Regenerate via: node mcpforge/scripts/sync-engine.mjs

// OpenAPI 3 -> IR (BUILD_ORDER items 3-4).
// MVP scope: a focused, dependency-free parser for OpenAPI 3.x JSON with a minimal
// local ($ref) resolver. Production hardening swaps this for @apidevtools/swagger-parser
// (full deref, OpenAPI 2.0, YAML) per TECH_STACK.md — same IR output, so nothing
// downstream changes.

import type { IR, IRParam, IRSchemaType, IRSecurity, IRTool } from "../ir/types";

const HTTP_METHODS = ["get", "post", "put", "patch", "delete"] as const;
const SIDE_EFFECTING = new Set<string>(["post", "put", "patch", "delete"]);

// The spec is untrusted JSON, so we model it as `unknown` and narrow with helpers
// rather than asserting `any`.
type JsonObject = Record<string, unknown>;
const isObject = (v: unknown): v is JsonObject => typeof v === "object" && v !== null && !Array.isArray(v);
const asObject = (v: unknown): JsonObject | undefined => (isObject(v) ? v : undefined);
const asString = (v: unknown): string | undefined => (typeof v === "string" ? v : undefined);
const asArray = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);

export class ParseError extends Error {}

// Minimal local $ref resolver: resolves "#/components/..." against the root doc.
function resolveRef(doc: JsonObject, node: unknown, seen = new Set<string>()): unknown {
  if (!isObject(node)) return node;
  const ref = node.$ref;
  if (typeof ref === "string" && ref.startsWith("#/")) {
    if (seen.has(ref)) return {}; // cycle guard
    seen.add(ref);
    const target = ref
      .slice(2)
      .split("/")
      .reduce<unknown>((acc, key) => (isObject(acc) ? acc[decodeURIComponent(key)] : undefined), doc);
    return resolveRef(doc, target, seen);
  }
  return node;
}

function mapSchemaType(schema: unknown): IRSchemaType {
  const t = asObject(schema)?.type;
  if (t === "string" || t === "number" || t === "integer" || t === "boolean" || t === "array" || t === "object") return t;
  return "unknown";
}

function toSnakeCase(input: string): string {
  return input
    .replace(/[{}]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "")
    .toLowerCase();
}

function parseSecurity(doc: JsonObject): IRSecurity {
  const schemes = asObject(asObject(doc.components)?.securitySchemes);
  if (!schemes) return { type: "none" };
  const first = asObject(resolveRef(doc, Object.values(schemes)[0]));
  if (!first) return { type: "none" };
  if (first.type === "http" && String(first.scheme).toLowerCase() === "bearer") {
    return { type: "bearer" };
  }
  if (first.type === "apiKey" && (first.in === "header" || first.in === "query")) {
    return { type: "apiKey", name: asString(first.name) ?? "api_key", in: first.in };
  }
  if (first.type === "oauth2") return { type: "oauth2" };
  return { type: "none" };
}

export function parseOpenApi(raw: string | JsonObject): IR {
  let parsed: unknown;
  try {
    parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
  } catch {
    throw new ParseError("Could not parse OpenAPI document: invalid JSON.");
  }
  const doc = asObject(parsed);
  if (!doc) throw new ParseError("Empty or invalid document.");
  if (!asString(doc.openapi)?.startsWith("3")) {
    throw new ParseError("Only OpenAPI 3.x is supported in the MVP engine.");
  }
  const paths = asObject(doc.paths);
  if (!paths) throw new ParseError("Document has no `paths`.");

  const firstServer = asObject(asArray(doc.servers)[0]);
  const baseUrl = asString(firstServer?.url) ?? "https://api.example.com";
  const security = parseSecurity(doc);
  const tools: IRTool[] = [];
  const usedNames = new Set<string>();

  for (const [path, pathItemRaw] of Object.entries(paths)) {
    const pathItem = asObject(resolveRef(doc, pathItemRaw));
    if (!pathItem) continue;
    for (const method of HTTP_METHODS) {
      const op = asObject(pathItem[method]);
      if (!op) continue;

      // Tool name: operationId (preferred) or method_path, sanitized + de-duped.
      const opId = asString(op.operationId);
      let name = opId ? toSnakeCase(opId) : toSnakeCase(`${method}_${path}`);
      if (!name) name = toSnakeCase(`${method}_op_${tools.length}`);
      while (usedNames.has(name)) name = `${name}_${tools.length}`;
      usedNames.add(name);

      const params: IRParam[] = [];

      // path/query/header parameters
      for (const pRaw of [...asArray(pathItem.parameters), ...asArray(op.parameters)]) {
        const p = asObject(resolveRef(doc, pRaw));
        const pName = asString(p?.name);
        const pIn = asString(p?.in);
        if (!p || !pName || !pIn) continue;
        if (pIn !== "path" && pIn !== "query" && pIn !== "header") continue;
        params.push({
          name: pName,
          in: pIn,
          required: Boolean(p.required) || pIn === "path",
          schemaType: mapSchemaType(resolveRef(doc, p.schema)),
          description: asString(p.description),
        });
      }

      // requestBody -> a single "body" param
      const body = asObject(resolveRef(doc, op.requestBody));
      const content = asObject(body?.content);
      if (body && content) {
        const media = asObject(content["application/json"]) ?? asObject(Object.values(content)[0]);
        const schemaType = mapSchemaType(resolveRef(doc, media?.schema));
        params.push({
          name: "body",
          in: "body",
          required: Boolean(body.required),
          schemaType: schemaType === "unknown" ? "object" : schemaType,
          description: asString(body.description) ?? "Request body (JSON).",
        });
      }

      tools.push({
        name,
        method: method.toUpperCase(),
        path,
        summary: asString(op.summary) ?? asString(op.description),
        params,
        sideEffecting: SIDE_EFFECTING.has(method),
      });
    }
  }

  if (tools.length === 0) throw new ParseError("No operations found in the spec.");

  const info = asObject(doc.info);
  return {
    title: asString(info?.title) ?? "Generated API",
    version: asString(info?.version) ?? "1.0.0",
    baseUrl,
    security,
    tools,
  };
}
