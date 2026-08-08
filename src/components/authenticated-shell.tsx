"use client";

import type { User } from "firebase/auth";
import { Activity, BarChart3, Dumbbell, Loader2, MoreHorizontal, PlusCircle, SunMedium } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type MouseEvent, type ReactNode } from "react";
import { useAuth } from "@/components/auth-provider";
import { NavigationGuardProvider, useNavigationInterceptor } from "@/components/navigation-guard";
import { QuickLogProvider, useQuickLog } from "@/components/quick-log/quick-log-provider";
import { TodayDataProvider } from "@/components/today-data-provider";
import { Panel } from "@/components/ui";

const navItems = [
  { href: "/dashboard", label: "Today", icon: SunMedium },
  { href: "/workouts", label: "Train", icon: Dumbbell },
  { href: "/progress", label: "Progress", icon: BarChart3 },
  { href: "/more", label: "More", icon: MoreHorizontal }
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
  const { user, loading, error: authError, configured } = useAuth();

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
    <TodayDataProvider user={user}>
      <QuickLogProvider user={user}>
        <AuthenticatedAppFrame authError={authError} pathname={pathname}>
          {children(user)}
        </AuthenticatedAppFrame>
      </QuickLogProvider>
    </TodayDataProvider>
  );
}

function AuthenticatedAppFrame({
  authError,
  pathname,
  children
}: {
  authError: string | null;
  pathname: string;
  children: ReactNode;
}) {
  const { openQuickLog } = useQuickLog();

  return (
    <div className="min-h-screen bg-night md:flex">
      <aside className="hidden w-20 shrink-0 border-r border-line bg-panel/95 px-3 py-4 md:block lg:w-56">
        <div className="flex min-h-11 items-center justify-center rounded-md border border-line bg-raised text-sm font-semibold text-mint lg:justify-start lg:px-3">
          <Activity className="h-5 w-5" aria-hidden="true" />
          <span className="sr-only lg:not-sr-only lg:ml-3">P99</span>
        </div>

        <nav className="mt-6 space-y-2" aria-label="Primary">
          {navItems.slice(0, 2).map((item) => (
            <DesktopNavItem key={item.href} item={item} pathname={pathname} />
          ))}
          <button
            className="flex min-h-12 w-full items-center justify-center gap-3 rounded-md bg-mint px-3 text-sm font-semibold text-night transition hover:bg-mint/90 lg:justify-start"
            type="button"
            onClick={() => openQuickLog()}
          >
            <PlusCircle className="h-5 w-5" aria-hidden="true" />
            <span className="sr-only lg:not-sr-only">Log</span>
          </button>
          {navItems.slice(2).map((item) => (
            <DesktopNavItem key={item.href} item={item} pathname={pathname} />
          ))}
        </nav>
      </aside>

      <div className="min-w-0 flex-1 pb-[calc(5.75rem+env(safe-area-inset-bottom))] md:pb-0">
        {authError ? (
          <section className="mx-auto max-w-6xl px-4 pt-4 sm:px-6 lg:px-8">
            <div className="rounded-lg border border-red-300/30 bg-red-300/10 p-4 text-sm text-red-100">{authError}</div>
          </section>
        ) : null}

        <main className="px-4 py-5 sm:px-6 lg:px-8">{children}</main>
      </div>

      <nav
        className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-line bg-panel/95 px-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] pt-2 backdrop-blur-sm md:hidden"
        aria-label="Primary"
      >
        <MobileNavItem item={navItems[0]} pathname={pathname} />
        <MobileNavItem item={navItems[1]} pathname={pathname} />
        <button
          className="mx-auto flex h-14 w-14 -translate-y-3 items-center justify-center rounded-full border border-mint/70 bg-mint text-night shadow-glow"
          type="button"
          onClick={() => openQuickLog()}
          aria-label="Open Quick Log"
        >
          <PlusCircle className="h-7 w-7" aria-hidden="true" />
        </button>
        <MobileNavItem item={navItems[2]} pathname={pathname} />
        <MobileNavItem item={navItems[3]} pathname={pathname} />
      </nav>
    </div>
  );
}

function DesktopNavItem({
  item,
  pathname
}: {
  item: (typeof navItems)[number];
  pathname: string;
}) {
  const active = isNavActive(item.href, pathname);
  const Icon = item.icon;

  return (
    <GuardedNavLink
      className={`flex min-h-12 items-center justify-center gap-3 rounded-md px-3 text-sm font-medium transition lg:justify-start ${
        active ? "bg-raised text-ink" : "text-muted hover:bg-raised hover:text-ink"
      }`}
      href={item.href}
      active={active}
    >
      <Icon className="h-5 w-5" aria-hidden="true" />
      <span className="sr-only lg:not-sr-only">{item.label}</span>
    </GuardedNavLink>
  );
}

function MobileNavItem({
  item,
  pathname
}: {
  item: (typeof navItems)[number];
  pathname: string;
}) {
  const active = isNavActive(item.href, pathname);
  const Icon = item.icon;

  return (
    <GuardedNavLink
      className={`flex min-h-12 flex-col items-center justify-center gap-1 rounded-md text-[11px] font-medium ${
        active ? "text-mint" : "text-muted"
      }`}
      href={item.href}
      active={active}
    >
      <Icon className="h-5 w-5" aria-hidden="true" />
      {item.label}
    </GuardedNavLink>
  );
}

function isNavActive(href: string, pathname: string) {
  return pathname === href || (href === "/dashboard" && pathname === "/") || (href !== "/dashboard" && pathname.startsWith(`${href}/`));
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
