"use client";

// Root error boundary — catches errors in the root layout. Must render <html>/<body>.
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body>
        <main style={{ maxWidth: 640, margin: "0 auto", padding: 24 }} role="alert">
          <h1>Something went wrong</h1>
          <p>A critical error occurred. Please reload.</p>
          <button type="button" onClick={reset}>Try again</button>
        </main>
      </body>
    </html>
  );
}
