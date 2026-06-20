"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Gen = { id: string; name: string; endpointCount: number; createdAt: string };

export default function History() {
  const [gens, setGens] = useState<Gen[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/generations")
      .then(async (r) => {
        const d = await r.json();
        if (r.status === 402) {
          setError(d.error?.message ?? "Saved history is a Pro feature.");
          return;
        }
        if (!r.ok) {
          setError("Could not load history.");
          return;
        }
        setGens(d.generations ?? []);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <Link href="/" className="text-sm text-zinc-500">
        ← back
      </Link>
      <h1 className="mt-4 text-3xl font-bold tracking-tight">History</h1>

      {loading && <p className="mt-6 text-sm text-zinc-500">Loading…</p>}

      {error && (
        <p className="mt-6 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
          {error}{" "}
          <Link href="/pricing" className="font-medium underline">
            Upgrade →
          </Link>
        </p>
      )}

      {!loading && !error && gens.length === 0 && (
        <p className="mt-6 text-sm text-zinc-500">No saved generations yet. Generate one on the home page.</p>
      )}

      {gens.length > 0 && (
        <div className="mt-6 divide-y divide-zinc-200 rounded-md border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
          {gens.map((g) => (
            <div key={g.id} className="flex items-center justify-between px-3 py-2 text-sm">
              <div>
                <code className="font-mono">{g.name}</code>
                <span className="ml-2 text-zinc-400">
                  {g.endpointCount} tools · {new Date(g.createdAt).toLocaleString()}
                </span>
              </div>
              <a href={`/api/generations/${g.id}/download`} className="rounded-md border border-zinc-300 px-3 py-1 dark:border-zinc-700">
                Download
              </a>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
