"use client";

import { useEffect } from "react";
import { reportError } from "@/lib/monitoring";

export default function GlobalError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    reportError(error, { surface: "global-error-boundary" });
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-zinc-950 text-zinc-50">
        <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center px-4 py-8">
          <h1 className="text-2xl font-semibold">Project 99 needs to restart this screen.</h1>
          <button
            type="button"
            className="mt-6 min-h-11 self-start rounded-md bg-emerald-400 px-4 text-sm font-semibold text-zinc-950 hover:bg-emerald-300"
            onClick={reset}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
