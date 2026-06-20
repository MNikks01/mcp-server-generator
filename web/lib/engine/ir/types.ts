// The Intermediate Representation (IR) — the keystone abstraction (ARCHITECTURE.md §4).
// All inputs normalize to IR; the generator only knows IR. Adding new inputs later
// (Postgres/GraphQL) = a new parser -> IR, with zero generator changes.

export type IRSecurity =
  | { type: "none" }
  | { type: "apiKey"; name: string; in: "header" | "query" }
  | { type: "bearer" }
  | { type: "oauth2" };

export type IRSchemaType =
  | "string"
  | "number"
  | "integer"
  | "boolean"
  | "object"
  | "array"
  | "unknown";

export interface IRParam {
  name: string;
  in: "path" | "query" | "header" | "body";
  required: boolean;
  schemaType: IRSchemaType;
  description?: string;
}

export interface IRTool {
  name: string; // snake_case tool name (LLM-friendly)
  method: string; // GET | POST | PUT | PATCH | DELETE
  path: string; // /pets/{petId}
  summary?: string;
  params: IRParam[];
  sideEffecting: boolean; // POST/PUT/PATCH/DELETE -> flagged
  description?: string; // filled by the description-generation step
}

export interface IR {
  title: string;
  version: string;
  baseUrl: string;
  security: IRSecurity;
  tools: IRTool[];
}
