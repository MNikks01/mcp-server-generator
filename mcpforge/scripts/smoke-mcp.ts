// Runtime proof: spawn a generated MCP server and drive it over the real stdio
// JSON-RPC protocol (initialize -> initialized -> tools/list). If it lists its tools,
// the server genuinely runs and speaks MCP — the headless equivalent of "it runs in
// Claude Desktop".
//
//   node scripts/smoke-mcp.ts <path-to-built-server-dist/index.js>

import { spawn } from "node:child_process";
import { resolve } from "node:path";

const serverEntry = resolve(process.argv[2] ?? "generated/pet-store/dist/index.js");
const child = spawn("node", [serverEntry], { stdio: ["pipe", "pipe", "inherit"] });

let buf = "";
const pending = new Map<number, (msg: any) => void>();

child.stdout.on("data", (chunk) => {
  buf += chunk.toString();
  let nl: number;
  while ((nl = buf.indexOf("\n")) >= 0) {
    const line = buf.slice(0, nl).trim();
    buf = buf.slice(nl + 1);
    if (!line) continue;
    let msg: any;
    try { msg = JSON.parse(line); } catch { continue; }
    if (msg.id && pending.has(msg.id)) {
      pending.get(msg.id)!(msg);
      pending.delete(msg.id);
    }
  }
});

function send(obj: any): void {
  child.stdin.write(JSON.stringify(obj) + "\n");
}
function request(id: number, method: string, params?: any): Promise<any> {
  return new Promise((res) => {
    pending.set(id, res);
    send({ jsonrpc: "2.0", id, method, params });
  });
}

const initRes = await request(1, "initialize", {
  protocolVersion: "2024-11-05",
  capabilities: {},
  clientInfo: { name: "mcpforge-smoke", version: "1.0.0" },
});
console.log(`▸ initialize OK — server: ${initRes.result?.serverInfo?.name} v${initRes.result?.serverInfo?.version}`);

send({ jsonrpc: "2.0", method: "notifications/initialized" });

const toolsRes = await request(2, "tools/list", {});
const tools = toolsRes.result?.tools ?? [];
console.log(`▸ tools/list OK — ${tools.length} tools advertised over MCP:`);
for (const t of tools) {
  console.log(`    - ${t.name}: ${String(t.description).slice(0, 70)}...`);
}

child.kill();
console.log(tools.length >= 1 ? "\n✅ RUNTIME PROOF: the generated server boots and speaks MCP." : "\n❌ no tools listed");
process.exit(tools.length >= 1 ? 0 : 1);
