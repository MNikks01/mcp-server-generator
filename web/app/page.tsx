"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { IR } from "@/lib/engine/ir/types";

const DEMO_URL = "https://petstore3.swagger.io/api/v3/openapi.json";

type GenResult = { name: string; descriptions: Record<string, string>; toolCount: number };

export default function Home() {
  const [url, setUrl] = useState(DEMO_URL);
  const [paste, setPaste] = useState("");
  const [ir, setIr] = useState<IR | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [result, setResult] = useState<GenResult | null>(null);
  const [busy, setBusy] = useState<"" | "parse" | "generate" | "download">("");
  const [error, setError] = useState("");
  const [plan, setPlan] = useState("free");
  const [showUpgrade, setShowUpgrade] = useState(false);

  useEffect(() => {
    fetch("/api/me")
      .then((r) => r.json())
      .then((d) => setPlan(d.plan ?? "free"))
      .catch(() => {});
  }, []);

  async function parse() {
    setError("");
    setResult(null);
    setIr(null);
    setBusy("parse");
    try {
      const res = await fetch("/api/parse", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(paste.trim() ? { spec: paste } : { specUrl: url }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message ?? "Parse failed");
      setIr(data.ir);
      setSelected(new Set<string>(data.ir.tools.map((t: { name: string }) => t.name)));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy("");
    }
  }

  function toggle(name: string) {
    const next = new Set(selected);
    if (next.has(name)) next.delete(name);
    else next.add(name);
    setSelected(next);
  }

  async function generate() {
    if (!ir) return;
    setError("");
    setShowUpgrade(false);
    setBusy("generate");
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ir, selectedTools: [...selected] }),
      });
      const data = await res.json();
      if (res.status === 402) {
        setShowUpgrade(true);
        throw new Error(data.error?.message ?? "Upgrade required");
      }
      if (!res.ok) throw new Error(data.error?.message ?? "Generation failed");
      setResult({ name: data.name, descriptions: data.descriptions, toolCount: data.toolCount });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy("");
    }
  }

  async function download() {
    if (!ir) return;
    setBusy("download");
    try {
      const res = await fetch("/api/download", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ir, selectedTools: [...selected] }),
      });
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `${result?.name ?? "mcp-server"}.zip`;
      a.click();
      URL.revokeObjectURL(a.href);
    } finally {
      setBusy("");
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">MCPForge</h1>
        <span className="text-sm text-zinc-500">
          Plan: <span className="font-medium">{plan}</span> · <Link href="/pricing" className="underline">Pricing</Link>
        </span>
      </div>
      <p className="mt-2 text-zinc-500">
        Turn any API into a production-ready MCP server in minutes. Paste an OpenAPI spec and get a runnable,
        well-described MCP server — auth, validation, and good tool descriptions included.
      </p>

      <section className="mt-8 space-y-3">
        <label className="block text-sm font-medium">OpenAPI spec URL</label>
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          placeholder="https://.../openapi.json"
        />
        <details className="text-sm text-zinc-500">
          <summary className="cursor-pointer">…or paste the spec JSON</summary>
          <textarea
            value={paste}
            onChange={(e) => setPaste(e.target.value)}
            rows={6}
            className="mt-2 w-full rounded-md border border-zinc-300 px-3 py-2 font-mono text-xs dark:border-zinc-700 dark:bg-zinc-900"
            placeholder='{ "openapi": "3.0.0", ... }'
          />
        </details>
        <button
          onClick={parse}
          disabled={busy === "parse"}
          className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-white dark:text-black"
        >
          {busy === "parse" ? "Parsing…" : "Parse spec"}
        </button>
      </section>

      {error && (
        <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
          {showUpgrade && (
            <>
              {" "}
              <Link href="/pricing" className="font-medium underline">
                Upgrade to Pro →
              </Link>
            </>
          )}
        </p>
      )}

      {ir && (
        <section className="mt-8">
          <h2 className="text-lg font-semibold">
            {ir.title} · {ir.tools.length} endpoints · auth: {ir.security.type}
          </h2>
          <div className="mt-3 divide-y divide-zinc-200 rounded-md border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
            {ir.tools.map((t) => (
              <label key={t.name} className="flex items-center gap-3 px-3 py-2 text-sm">
                <input type="checkbox" checked={selected.has(t.name)} onChange={() => toggle(t.name)} />
                <code className="font-mono">{t.name}</code>
                <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                  {t.method}
                </span>
                <span className="text-zinc-400">{t.path}</span>
                {t.sideEffecting && <span className="text-xs text-amber-600">side-effecting</span>}
              </label>
            ))}
          </div>
          <button
            onClick={generate}
            disabled={busy === "generate" || selected.size === 0}
            className="mt-4 rounded-md bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-white dark:text-black"
          >
            {busy === "generate" ? "Generating…" : `Generate server (${selected.size} tools)`}
          </button>
        </section>
      )}

      {result && (
        <section className="mt-8">
          <h2 className="text-lg font-semibold">Generated: {result.name}</h2>
          <p className="text-sm text-zinc-500">Tool descriptions (what the LLM uses to call each tool):</p>
          <div className="mt-3 space-y-2">
            {Object.entries(result.descriptions).map(([name, desc]) => (
              <div key={name} className="rounded-md border border-zinc-200 p-3 text-sm dark:border-zinc-800">
                <code className="font-mono text-xs">{name}</code>
                <p className="mt-1 text-zinc-600 dark:text-zinc-300">{desc}</p>
              </div>
            ))}
          </div>
          <button
            onClick={download}
            disabled={busy === "download"}
            className="mt-4 rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {busy === "download" ? "Zipping…" : "Download ZIP"}
          </button>
        </section>
      )}
    </main>
  );
}
