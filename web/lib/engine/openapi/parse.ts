// GENERATED from mcpforge/src/openapi/parse.ts — DO NOT EDIT.
// Single source of truth: mcpforge/src. Regenerate via: node mcpforge/scripts/sync-engine.mjs

// OpenAPI 3 -> IR (BUILD_ORDER items 3-4).
// MVP scope: a focused, dependency-free parser for OpenAPI 3.x JSON with a minimal
// local ($ref) resolver. Production hardening swaps this for @apidevtools/swagger-parser
// (full deref, OpenAPI 2.0, YAML) per TECH_STACK.md — same IR output, so nothing
// downstream changes.

import type { IR, IRParam, IRSchemaType, IRSecurity, IRTool } from "../ir/types";

const HTTP_METHODS = ["get", "post", "put", "patch", "delete"];
const SIDE_EFFECTING = new Set(["post", "put", "patch", "delete"]);

type AnyObj = Record<string, any>;

export class ParseError extends Error {}

// Minimal local $ref resolver: resolves "#/components/..." against the root doc.
function resolveRef(doc: AnyObj, node: any, seen = new Set<string>()): any {
  if (!node || typeof node !== "object") return node;
  if (typeof node.$ref === "string" && node.$ref.startsWith("#/")) {
    if (seen.has(node.$ref)) return {}; // cycle guard
    seen.add(node.$ref);
    const target = node.$ref
      .slice(2)
      .split("/")
      .reduce((acc: any, key: string) => (acc ? acc[decodeURIComponent(key)] : undefined), doc);
    return resolveRef(doc, target, seen);
  }
  return node;
}

function mapSchemaType(schema: AnyObj | undefined): IRSchemaType {
  const t = schema?.type;
  if (t === "string") return "string";
  if (t === "number") return "number";
  if (t === "integer") return "integer";
  if (t === "boolean") return "boolean";
  if (t === "array") return "array";
  if (t === "object") return "object";
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

function parseSecurity(doc: AnyObj): IRSecurity {
  const schemes = doc.components?.securitySchemes;
  if (!schemes || typeof schemes !== "object") return { type: "none" };
  const first = resolveRef(doc, Object.values(schemes)[0]) as AnyObj | undefined;
  if (!first) return { type: "none" };
  if (first.type === "http" && String(first.scheme).toLowerCase() === "bearer") {
    return { type: "bearer" };
  }
  if (first.type === "apiKey" && (first.in === "header" || first.in === "query")) {
    return { type: "apiKey", name: first.name ?? "api_key", in: first.in };
  }
  if (first.type === "oauth2") return { type: "oauth2" };
  return { type: "none" };
}

export function parseOpenApi(raw: string | AnyObj): IR {
  let doc: AnyObj;
  try {
    doc = typeof raw === "string" ? JSON.parse(raw) : raw;
  } catch (e) {
    throw new ParseError("Could not parse OpenAPI document: invalid JSON.");
  }
  if (!doc || typeof doc !== "object") throw new ParseError("Empty or invalid document.");
  if (!doc.openapi || !String(doc.openapi).startsWith("3")) {
    throw new ParseError("Only OpenAPI 3.x is supported in the MVP engine.");
  }
  if (!doc.paths || typeof doc.paths !== "object") {
    throw new ParseError("Document has no `paths`.");
  }

  const baseUrl: string = doc.servers?.[0]?.url ?? "https://api.example.com";
  const security = parseSecurity(doc);
  const tools: IRTool[] = [];
  const usedNames = new Set<string>();

  for (const [path, pathItemRaw] of Object.entries(doc.paths)) {
    const pathItem = resolveRef(doc, pathItemRaw) as AnyObj;
    for (const method of HTTP_METHODS) {
      const op = pathItem?.[method];
      if (!op) continue;

      // Tool name: operationId (preferred) or method_path, sanitized + de-duped.
      let name = op.operationId ? toSnakeCase(op.operationId) : toSnakeCase(`${method}_${path}`);
      if (!name) name = toSnakeCase(`${method}_op_${tools.length}`);
      while (usedNames.has(name)) name = `${name}_${tools.length}`;
      usedNames.add(name);

      const params: IRParam[] = [];

      // path/query/header parameters
      const rawParams = [...(pathItem.parameters ?? []), ...(op.parameters ?? [])];
      for (const pRaw of rawParams) {
        const p = resolveRef(doc, pRaw) as AnyObj;
        if (!p?.name || !p?.in) continue;
        if (p.in !== "path" && p.in !== "query" && p.in !== "header") continue;
        params.push({
          name: p.name,
          in: p.in,
          required: Boolean(p.required) || p.in === "path",
          schemaType: mapSchemaType(resolveRef(doc, p.schema)),
          description: p.description,
        });
      }

      // requestBody -> a single "body" param
      const body = resolveRef(doc, op.requestBody) as AnyObj | undefined;
      if (body?.content) {
        const json = body.content["application/json"] ?? Object.values(body.content)[0];
        const schema = resolveRef(doc, (json as AnyObj)?.schema);
        params.push({
          name: "body",
          in: "body",
          required: Boolean(body.required),
          schemaType: mapSchemaType(schema) === "unknown" ? "object" : mapSchemaType(schema),
          description: body.description ?? "Request body (JSON).",
        });
      }

      tools.push({
        name,
        method: method.toUpperCase(),
        path,
        summary: op.summary ?? op.description,
        params,
        sideEffecting: SIDE_EFFECTING.has(method),
      });
    }
  }

  if (tools.length === 0) throw new ParseError("No operations found in the spec.");

  return {
    title: doc.info?.title ?? "Generated API",
    version: doc.info?.version ?? "1.0.0",
    baseUrl,
    security,
    tools,
  };
}
