if (process.env.NODE_ENV !== 'production') {
  import('dotenv').then((dotenv) => {
    dotenv.config();
  });
}

// Environment
export const NODE_ENV: string = process.env.NEXT_PUBLIC_NODE_ENV ?? 'development',
  NEXT_TELEMETRY_DISABLED: string = process.env.NEXT_TELEMETRY_DISABLED ?? '1';

// API
export const API_PORT: string = process.env.API_PORT ?? '3000';

// Database
export const DATABASE_URL: string = process.env.MONGODB_URI ?? 'postgres://postgres@localhost:5432/merchtrack';

// Clerk
export const CLERK_SECRET_KEY: string = process.env.CLERK_SECRET_KEY ?? '',
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: string = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? '',
  NEXT_PUBLIC_CLERK_SIGN_IN_URL: string = process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL ?? '/sign-in',
  NEXT_PUBLIC_CLERK_SIGN_UP_URL: string = process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL ?? '/sign-up',
  NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL: string = process.env.NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL ?? '/dashboard',
  NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL: string = process.env.NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL ?? '/dashboard';

// Sentry
export const SENTRY_AUTH_TOKEN: string = process.env.SENTRY_AUTH_TOKEN ?? '',
  NEXT_PUBLIC_SENTRY_DSN: string = process.env.NEXT_PUBLIC_SENTRY_DSN ?? '',
  SENTRY_TRACES_SAMPLE_RATE: string = process.env.SENTRY_TRACES_SAMPLE_RATE ?? '0.4';

// Datadog
export const DATADOG_APPLICATION_ID: string = process.env.NEXT_PUBLIC_DATADOG_APPLICATION_ID ?? '',
  DATADOG_CLIENT_TOKEN: string = process.env.NEXT_PUBLIC_DATADOG_CLIENT_TOKEN ?? '';

