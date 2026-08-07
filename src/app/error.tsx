"use client";

import { useEffect } from "react";
import { reportError } from "@/lib/monitoring";

export default function Error({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    reportError(error, { surface: "app-error-boundary" });
  }, [error]);

  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center px-4 py-8">
      <p className="text-sm font-medium uppercase tracking-wide text-red-300">Something went wrong</p>
      <h1 className="mt-2 text-2xl font-semibold text-zinc-50">Project 99 could not load this screen.</h1>
      <p className="mt-3 text-sm leading-6 text-zinc-300">Try again. Your saved data remains protected in Firebase.</p>
      <button
        type="button"
        className="mt-6 min-h-11 self-start rounded-md bg-emerald-400 px-4 text-sm font-semibold text-zinc-950 hover:bg-emerald-300"
        onClick={reset}
      >
        Try again
      </button>
    </main>
  );
}
