import Link from "next/link";

// A small gallery of public OpenAPI specs to try. Clicking one pre-fills the home
// generator (via ?spec=). Bring your own spec for anything else.
const EXAMPLES = [
  {
    name: "Swagger Petstore (v3)",
    desc: "The classic 19-endpoint demo API — pets, store, and users.",
    url: "https://petstore3.swagger.io/api/v3/openapi.json",
  },
  {
    name: "Swagger Petstore (v2)",
    desc: "OpenAPI 2.0 variant of the Petstore (JSON).",
    url: "https://petstore.swagger.io/v2/swagger.json",
  },
];

export const metadata = {
  title: "Examples · MCPForge",
  description: "Example OpenAPI specs you can turn into MCP servers in one click.",
};

export default function Examples() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <Link href="/" className="text-sm text-zinc-500">
        ← back
      </Link>
      <h1 className="mt-4 text-3xl font-bold tracking-tight">Examples</h1>
      <p className="mt-2 text-sm text-zinc-500">
        Try one of these public APIs, or paste your own spec on the home page. Generated servers run in Claude Desktop.
      </p>
      <div className="mt-6 space-y-3">
        {EXAMPLES.map((ex) => (
          <div key={ex.url} className="rounded-md border border-zinc-200 p-4 dark:border-zinc-800">
            <h2 className="font-semibold">{ex.name}</h2>
            <p className="mt-1 text-sm text-zinc-500">{ex.desc}</p>
            <code className="mt-1 block break-all text-xs text-zinc-400">{ex.url}</code>
            <Link
              href={`/?spec=${encodeURIComponent(ex.url)}`}
              className="mt-3 inline-block rounded-md bg-black px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-black"
            >
              Generate this →
            </Link>
          </div>
        ))}
      </div>
    </main>
  );
}
