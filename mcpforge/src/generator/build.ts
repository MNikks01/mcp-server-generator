// Build orchestrator — IR -> a complete file map (the thing the web layer zips,
// and the CLI/demo writes to disk). This is the single entry point of the engine.

import type { IR } from "../ir/types.ts";
import { pickDescriptionGenerator, type DescriptionGenerator } from "./descriptions.ts";
import { generateServerCode } from "./server-template.ts";
import {
  envExample,
  gitignore,
  kebab,
  mcpJson,
  packageJson,
  readme,
  tsconfigJson,
} from "./project-files.ts";

export interface GenerateResult {
  name: string;
  files: Record<string, string>;
  descriptions: Record<string, string>;
  toolCount: number;
}

export async function build(
  ir: IR,
  opts: { descriptionGenerator?: DescriptionGenerator } = {},
): Promise<GenerateResult> {
  const name = kebab(ir.title);
  const gen = opts.descriptionGenerator ?? pickDescriptionGenerator();

  // Fill descriptions (the differentiator). Never blocks: SpecDerived is the floor.
  const descriptions: Record<string, string> = {};
  for (const tool of ir.tools) {
    tool.description = await gen.describe(tool, ir);
    descriptions[tool.name] = tool.description;
  }

  const files: Record<string, string> = {
    "src/index.ts": generateServerCode(ir, name),
    "package.json": packageJson(name),
    "tsconfig.json": tsconfigJson(),
    "README.md": readme(name, ir),
    "mcp.json": mcpJson(name, ir),
    ".env.example": envExample(ir),
    ".gitignore": gitignore(),
  };

  return { name, files, descriptions, toolCount: ir.tools.length };
}
