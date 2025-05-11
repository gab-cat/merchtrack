// Add polyfill for environments that don't support 'process.env' natively
if (process.env.NODE_ENV !== 'production') {
  import('dotenv').then((dotenv) => {
    dotenv.config();
  });
}

// Export all configurations from each domain
export * from './app';
export * from './auth';
export * from './database';
export * from './monitoring';
export * from './storage';
export * from './communication';
export * from './doppler';

// Re-export all configs as objects for convenience
import { appConfig } from './app';
import { authConfig } from './auth';
import { dbConfig } from './database';
import { monitoringConfig } from './monitoring';
import { storageConfig } from './storage';
import { communicationConfig } from './communication';
import { dopplerConfig } from './doppler';

// Export a single object with all configurations for easy access
export const config = {
  app: appConfig,
  auth: authConfig,
  db: dbConfig,
  monitoring: monitoringConfig,
  storage: storageConfig,
  communication: communicationConfig,
  doppler: dopplerConfig
};

// Environment
export const NODE_ENV: string = process.env.NEXT_PUBLIC_NODE_ENV ?? 'development',
  NEXT_TELEMETRY_DISABLED: string = process.env.NEXT_TELEMETRY_DISABLED ?? '1',
  APP_ENV: string = process.env.APP_ENV ?? 'development';

// API
export const API_PORT: string = process.env.API_PORT ?? '3000';

// Database
export const DATABASE_URL: string = process.env.DATABASE_URL ?? 'postgres://postgres@localhost:5432/merchtrack';

// Clerk
export const CLERK_SECRET_KEY: string = process.env.CLERK_SECRET_KEY ?? '',
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: string = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? '',
  NEXT_PUBLIC_CLERK_SIGN_IN_URL: string = process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL ?? '/sign-in',
  NEXT_PUBLIC_CLERK_SIGN_UP_URL: string = process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL ?? '/sign-up',
  NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL: string = process.env.NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL ?? '/dashboard',
  NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL: string = process.env.NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL ?? '/dashboard';

// Monitoring
import {
  SENTRY_AUTH_TOKEN,
  SENTRY_DSN,
  SENTRY_TRACES_SAMPLE_RATE,
  CF_BEACON_TOKEN,
} from './monitoring';

export {
  SENTRY_AUTH_TOKEN,
  SENTRY_DSN,
  SENTRY_TRACES_SAMPLE_RATE,
  CF_BEACON_TOKEN,
};


