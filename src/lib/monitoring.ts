import * as Sentry from "@sentry/nextjs";

type MonitoringContext = Record<string, string | number | boolean>;

export function reportError(error: unknown, context: MonitoringContext = {}) {
  const normalizedError = error instanceof Error ? error : new Error(String(error));

  Sentry.withScope((scope) => {
    for (const [key, value] of Object.entries(context)) {
      scope.setTag(key, String(value));
    }
    Sentry.captureException(normalizedError);
  });
}

export async function reportFirestoreError<T>(
  operation: string,
  action: () => Promise<T>
): Promise<T> {
  try {
    return await action();
  } catch (error) {
    reportError(error, { subsystem: "firestore", operation });
    throw error;
  }
}
