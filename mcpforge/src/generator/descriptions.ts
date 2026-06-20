// Tool-description generation (BUILD_ORDER item 6) — THE differentiator (MCP.md §4).
// Descriptions follow the contract: what / when / when-NOT / returns.
//
// Two implementations behind one interface:
//   - SpecDerived (default): deterministic, zero-network, always works. Per our own
//     spec, "an LLM failure must NOT block generation" — so this is the guaranteed floor.
//   - Claude (optional): set ANTHROPIC_API_KEY + USE_LLM=1 to upgrade quality (Pro tier).

import type { IR, IRTool } from "../ir/types.ts";

export interface DescriptionGenerator {
  describe(tool: IRTool, ir: IR): Promise<string>;
}

function siblingHint(tool: IRTool, ir: IR): string {
  // Find a counterpart tool to steer "when NOT to use this".
  const others = ir.tools.filter((t) => t.name !== tool.name);
  if (tool.sideEffecting) {
    const reader = others.find((t) => !t.sideEffecting && t.path.split("/")[1] === tool.path.split("/")[1]);
    if (reader) return ` Do NOT use to read or list (use ${reader.name}).`;
  } else {
    const writer = others.find((t) => t.sideEffecting && t.path.split("/")[1] === tool.path.split("/")[1]);
    if (writer) return ` Do NOT use to create or modify (use ${writer.name}).`;
  }
  return "";
}

export class SpecDerivedDescriptions implements DescriptionGenerator {
  async describe(tool: IRTool, ir: IR): Promise<string> {
    const what = tool.summary?.trim()
      ? tool.summary.trim().replace(/\.$/, "")
      : `${tool.method} ${tool.path}`;
    const required = tool.params.filter((p) => p.required).map((p) => p.name);
    const when = tool.sideEffecting
      ? `Use when the user wants to ${tool.method === "DELETE" ? "delete" : "create or update"} via ${tool.path}.`
      : `Use when the user asks for data from ${tool.path}.`;
    const whenNot = siblingHint(tool, ir);
    const returns = tool.sideEffecting
      ? " Returns the API's response for the operation."
      : " Returns the JSON response from the endpoint.";
    const args = required.length ? ` Requires: ${required.join(", ")}.` : "";
    return `${capitalize(what)}. ${when}${whenNot}${args}${returns}`.replace(/\s+/g, " ").trim();
  }
}

export class ClaudeDescriptions implements DescriptionGenerator {
  private apiKey: string;
  private model: string;
  private fallback: DescriptionGenerator;

  constructor(
    apiKey: string,
    model = "claude-haiku-4-5-20251001",
    fallback: DescriptionGenerator = new SpecDerivedDescriptions(),
  ) {
    this.apiKey = apiKey;
    this.model = model;
    this.fallback = fallback;
  }

  async describe(tool: IRTool, ir: IR): Promise<string> {
    const prompt =
      `Write a single-paragraph MCP tool description for an LLM that will call it.\n` +
      `State: what it does, WHEN to use it, when NOT to use it, and what it returns.\n` +
      `Be concise (<= 3 sentences). No markdown.\n\n` +
      `API: ${ir.title}\nTool: ${tool.name}\nHTTP: ${tool.method} ${tool.path}\n` +
      `Summary: ${tool.summary ?? "(none)"}\n` +
      `Params: ${tool.params.map((p) => `${p.name} (${p.in}${p.required ? ", required" : ""})`).join(", ") || "none"}\n` +
      `Side-effecting: ${tool.sideEffecting}`;
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": this.apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: this.model,
          max_tokens: 220,
          messages: [{ role: "user", content: prompt }],
        }),
        signal: AbortSignal.timeout(20000),
      });
      if (!res.ok) throw new Error(`Anthropic ${res.status}`);
      const data: any = await res.json();
      const text = data?.content?.[0]?.text?.trim();
      if (!text) throw new Error("empty");
      return text;
    } catch {
      // Never block generation on an LLM failure.
      return this.fallback.describe(tool, ir);
    }
  }
}

export function pickDescriptionGenerator(): DescriptionGenerator {
  const key = process.env.ANTHROPIC_API_KEY;
  if (key && process.env.USE_LLM === "1") return new ClaudeDescriptions(key);
  return new SpecDerivedDescriptions();
}

function capitalize(s: string): string {
  return s.length ? s[0].toUpperCase() + s.slice(1) : s;
}
