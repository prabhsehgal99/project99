"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, type ReactNode } from "react";

/**
 * The App Router has no cancellable route-change event, so the shell asks the
 * active page before following a client-side navigation. A page registers a
 * guard that returns true to take over the navigation (e.g. to show its
 * unsaved-changes prompt for the given href); returning false lets the link
 * proceed normally. Only one guard is active at a time.
 */
export type NavigationGuard = (href: string) => boolean;

interface NavigationGuardContextValue {
  register: (guard: NavigationGuard) => () => void;
  intercept: (href: string) => boolean;
}

const NavigationGuardContext = createContext<NavigationGuardContextValue | null>(null);

export function NavigationGuardProvider({ children }: { children: ReactNode }) {
  const guardRef = useRef<NavigationGuard | null>(null);

  const register = useCallback((guard: NavigationGuard) => {
    guardRef.current = guard;
    return () => {
      if (guardRef.current === guard) {
        guardRef.current = null;
      }
    };
  }, []);

  const intercept = useCallback((href: string) => guardRef.current?.(href) ?? false, []);

  const value = useMemo(() => ({ register, intercept }), [intercept, register]);

  return <NavigationGuardContext.Provider value={value}>{children}</NavigationGuardContext.Provider>;
}

export function useNavigationGuard(guard: NavigationGuard) {
  const context = useContext(NavigationGuardContext);

  useEffect(() => {
    if (!context) {
      return;
    }

    return context.register(guard);
  }, [context, guard]);
}

export function useNavigationInterceptor(): (href: string) => boolean {
  const context = useContext(NavigationGuardContext);
  const intercept = context?.intercept;

  return useCallback((href: string) => intercept?.(href) ?? false, [intercept]);
}
