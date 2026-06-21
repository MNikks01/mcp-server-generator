"use client";

import { useEffect } from "react";

// Route-segment error boundary (App Router). Catches render/runtime errors in the page.
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error); // production: report to Sentry/observability
  }, [error]);
  return (
    <main className="mx-auto max-w-3xl px-6 py-12" role="alert">
      <h1 className="text-2xl font-bold tracking-tight">Something went wrong</h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">An unexpected error occurred. You can try again — if it persists, reload the page.</p>
      <button type="button" onClick={reset} className="mt-4 rounded-md bg-black px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-black">Try again</button>
    </main>
  );
}
