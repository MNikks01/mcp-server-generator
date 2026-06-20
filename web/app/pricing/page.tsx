"use client";

import { useState } from "react";
import Link from "next/link";

export default function Pricing() {
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function upgrade() {
    setBusy(true);
    setMsg("");
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = await res.json();
      if (res.ok && data.url) {
        window.location.href = data.url;
        return;
      }
      setMsg(data.error?.message ?? "Could not start checkout.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <Link href="/" className="text-sm text-zinc-500">
        ← back
      </Link>
      <h1 className="mt-4 text-3xl font-bold tracking-tight">Pricing</h1>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-zinc-200 p-5 dark:border-zinc-800">
          <h2 className="text-lg font-semibold">Free</h2>
          <p className="mt-1 text-2xl font-bold">$0</p>
          <ul className="mt-4 space-y-1 text-sm text-zinc-600 dark:text-zinc-300">
            <li>Generate servers (up to 8 endpoints)</li>
            <li>Download the full project</li>
            <li>Good tool descriptions</li>
          </ul>
        </div>
        <div className="rounded-lg border-2 border-emerald-500 p-5">
          <h2 className="text-lg font-semibold">Pro</h2>
          <p className="mt-1 text-2xl font-bold">
            $15<span className="text-base font-normal text-zinc-500">/mo</span>
          </p>
          <ul className="mt-4 space-y-1 text-sm text-zinc-600 dark:text-zinc-300">
            <li>Unlimited endpoints</li>
            <li>Premium descriptions</li>
            <li>GitHub push + saved history</li>
          </ul>
          <button
            onClick={upgrade}
            disabled={busy}
            className="mt-4 w-full rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {busy ? "Starting checkout…" : "Upgrade to Pro"}
          </button>
        </div>
      </div>
      {msg && <p className="mt-4 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">{msg}</p>}
    </main>
  );
}
