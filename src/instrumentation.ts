import * as Sentry from '@sentry/nextjs';

/**
 * Registers Sentry instrumentation for server-side error tracking in a Next.js application.
 *
 * @remarks
 * This function conditionally imports Sentry server configuration based on the runtime environment.
 * It skips configuration if running under Turbopack or if not in a Node.js runtime.
 *
 * @returns A promise that resolves when Sentry server configuration is imported
 *
 * @throws {Error} Potential import errors if Sentry configuration fails to load
 *
 * @beta
 */
export async function register() {
  if (process.env.TURBOPACK) {
    return;
  }

  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("../sentry.server.config");
  }

  // if (process.env.NEXT_RUNTIME === "edge") {
  //   await import("../sentry.edge.config");
  // }
}

export const onRequestError = Sentry.captureRequestError;