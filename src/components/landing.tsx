"use client";

import { Activity, Cloud, Dumbbell, Flame, Loader2, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/components/auth-provider";

export function Landing() {
  const router = useRouter();
  const { user, loading, error, configured, signIn } = useAuth();

  useEffect(() => {
    if (user) {
      router.replace("/dashboard");
    }
  }, [router, user]);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-5 sm:px-6 lg:px-8">
      <nav className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-emerald-400/30 bg-emerald-400/10">
            <Activity className="h-5 w-5 text-emerald-300" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Project 99</p>
            <p className="text-xs text-zinc-500">Fitness operating system</p>
          </div>
        </div>
      </nav>

      <section className="grid flex-1 items-center gap-8 py-12 lg:grid-cols-[1.1fr_0.9fr] lg:py-16">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-emerald-300">Mobile-first health tracking</p>
          <h1 className="mt-4 max-w-3xl text-5xl font-semibold leading-tight text-zinc-50 sm:text-6xl">
            Project 99
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-zinc-300">
            Track morning weight in kg, training readiness, nutrition, recovery, water, habits, and daily workout
            completion from one private dashboard synced through Firebase.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-emerald-400 px-5 text-base font-semibold text-zinc-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
              onClick={signIn}
              disabled={loading || !configured}
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> : <ShieldCheck className="h-5 w-5" aria-hidden="true" />}
              Sign in with Google
            </button>
            <div className="rounded-md border border-purple-400/30 bg-purple-400/10 px-4 py-3 text-sm text-purple-100">
              Free-tier ready: Firebase Spark + Vercel
            </div>
          </div>

          {!configured ? (
            <p className="mt-4 rounded-md border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
              Firebase is not configured yet. Add the values from `.env.example` to `.env.local`.
            </p>
          ) : null}
          {error ? (
            <p className="mt-4 rounded-md border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-100">{error}</p>
          ) : null}
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
          {[
            { icon: Flame, label: "Calories and protein", tone: "text-emerald-300" },
            { icon: Dumbbell, label: "Workout and cardio status", tone: "text-purple-300" },
            { icon: Cloud, label: "Cloud sync across devices", tone: "text-zinc-200" }
          ].map((item) => (
            <div key={item.label} className="rounded-lg border border-zinc-800 bg-zinc-950/75 p-5">
              <item.icon className={`h-6 w-6 ${item.tone}`} aria-hidden="true" />
              <p className="mt-4 text-lg font-semibold text-zinc-50">{item.label}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
