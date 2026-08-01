"use client";

import type { User } from "firebase/auth";
import { Activity, CalendarDays, LayoutDashboard, Loader2, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type MouseEvent, type ReactNode } from "react";
import { useAuth } from "@/components/auth-provider";
import { NavigationGuardProvider, useNavigationInterceptor } from "@/components/navigation-guard";
import { Panel } from "@/components/ui";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/log", label: "Daily Log", icon: CalendarDays }
];

export function AuthenticatedShell({ children }: { children: (user: User) => ReactNode }) {
  return (
    <NavigationGuardProvider>
      <AuthenticatedShellContent>{children}</AuthenticatedShellContent>
    </NavigationGuardProvider>
  );
}

function AuthenticatedShellContent({ children }: { children: (user: User) => ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading, error: authError, configured, signOutUser } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/");
    }
  }, [loading, router, user]);

  if (loading || (!user && configured)) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <div className="flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-950/80 px-4 py-3 text-zinc-300">
          <Loader2 className="h-5 w-5 animate-spin text-emerald-300" aria-hidden="true" />
          Loading
        </div>
      </main>
    );
  }

  if (!configured) {
    return (
      <main className="mx-auto flex min-h-screen max-w-2xl items-center px-4">
        <Panel title="Firebase configuration required">
          <p className="text-sm leading-6 text-zinc-300">
            Add Firebase Spark plan web app values to `.env.local`, then restart the development server.
          </p>
        </Panel>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen md:flex">
      <aside className="hidden w-64 shrink-0 border-r border-zinc-800 bg-zinc-950/80 px-4 py-5 md:block">
        <div className="flex min-w-0 items-center gap-3">
          {user.photoURL ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="h-11 w-11 rounded-lg border border-zinc-800" src={user.photoURL} alt="" />
          ) : (
            <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-emerald-400/30 bg-emerald-400/10">
              <Activity className="h-5 w-5 text-emerald-300" aria-hidden="true" />
            </div>
          )}
          <div className="min-w-0">
            <p className="truncate text-lg font-semibold text-zinc-50">Project 99</p>
            <p className="truncate text-xs text-zinc-500">{user.email}</p>
          </div>
        </div>

        <nav className="mt-8 space-y-1" aria-label="Primary">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = href === "/log" ? pathname.startsWith("/log") : pathname === href;
            return (
              <GuardedNavLink
                key={href}
                className={`flex min-h-11 items-center gap-3 rounded-md px-3 text-sm font-medium transition ${
                  active ? "bg-emerald-400/10 text-emerald-100" : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100"
                }`}
                href={href}
                active={active}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {label}
              </GuardedNavLink>
            );
          })}
        </nav>

        <button
          className="mt-8 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md border border-zinc-700 bg-zinc-900 px-4 text-sm font-medium text-zinc-200 transition hover:border-purple-400/60 hover:text-purple-100"
          onClick={signOutUser}
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
          Sign out
        </button>
      </aside>

      <div className="min-w-0 flex-1 pb-20 md:pb-0">
        <header className="flex items-center justify-between border-b border-zinc-800 bg-zinc-950/80 px-4 py-3 md:hidden">
          <div className="min-w-0">
            <p className="truncate text-base font-semibold text-zinc-50">Project 99</p>
            <p className="truncate text-xs text-zinc-500">{user.email}</p>
          </div>
          <button
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-zinc-700 bg-zinc-900 px-3 text-sm font-medium text-zinc-200"
            onClick={signOutUser}
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Sign out
          </button>
        </header>

        {authError ? (
          <section className="mx-auto mt-4 max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-lg border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-100">{authError}</div>
          </section>
        ) : null}

        <main className="px-4 py-5 sm:px-6 lg:px-8">{children(user)}</main>
      </div>

      <nav
        className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-2 border-t border-zinc-800 bg-zinc-950/95 px-3 py-2 backdrop-blur-sm md:hidden"
        aria-label="Primary"
      >
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = href === "/log" ? pathname.startsWith("/log") : pathname === href;
          return (
            <GuardedNavLink
              key={href}
              className={`flex min-h-12 flex-col items-center justify-center gap-1 rounded-md text-xs font-medium ${
                active ? "bg-emerald-400/10 text-emerald-100" : "text-zinc-400"
              }`}
              href={href}
              active={active}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
              {label}
            </GuardedNavLink>
          );
        })}
      </nav>
    </div>
  );
}

function GuardedNavLink({
  href,
  className,
  active,
  children
}: {
  href: string;
  className: string;
  active: boolean;
  children: ReactNode;
}) {
  const intercept = useNavigationInterceptor();

  return (
    <Link
      className={className}
      href={href}
      aria-current={active ? "page" : undefined}
      onClick={(event: MouseEvent<HTMLAnchorElement>) => {
        // Modified clicks open a new tab and cannot lose in-page edits.
        if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
          return;
        }

        if (intercept(href)) {
          event.preventDefault();
        }
      }}
    >
      {children}
    </Link>
  );
}
