// Sentry
export const SENTRY_AUTH_TOKEN: string = process.env.SENTRY_AUTH_TOKEN ?? 
  (process.env.APP_ENV === 'production' ? 
    (() => { throw new Error('SENTRY_AUTH_TOKEN is required in production');})() : ''),
  SENTRY_DSN: string = process.env.NEXT_PUBLIC_SENTRY_DSN ?? 
  (process.env.APP_ENV === 'production' ? 
    (() => { throw new Error('NEXT_PUBLIC_SENTRY_DSN is required in production'); })() : ''),
  SENTRY_TRACES_SAMPLE_RATE: string = process.env.SENTRY_TRACES_SAMPLE_RATE ?? 
  (process.env.APP_ENV === 'production' ? 
    (() => { throw new Error('SENTRY_TRACES_SAMPLE_RATE is required in production'); })() : '0.4');

// Datadog
export const DATADOG_APPLICATION_ID: string = process.env.NEXT_PUBLIC_DATADOG_APPLICATION_ID ?? 
  (process.env.APP_ENV === 'production' ? 
    (() => { throw new Error('NEXT_PUBLIC_DATADOG_APPLICATION_ID is required in production'); })() : ''),
  DATADOG_CLIENT_TOKEN: string = process.env.NEXT_PUBLIC_DATADOG_CLIENT_TOKEN ?? 
  (process.env.APP_ENV === 'production' ? 
    (() => { throw new Error('NEXT_PUBLIC_DATADOG_CLIENT_TOKEN is required in production'); })() : ''),
  DATADOG_SITE: string = process.env.NEXT_PUBLIC_DATADOG_SITE ?? 
  (process.env.APP_ENV === 'production' ? 
    (() => { throw new Error('NEXT_PUBLIC_DATADOG_SITE is required in production'); })() : ''),
  DATADOG_SERVICE: string = process.env.NEXT_PUBLIC_DATADOG_SERVICE_NAME ?? 
  (process.env.APP_ENV === 'production' ? 
    (() => { throw new Error('NEXT_PUBLIC_DATADOG_SERVICE_NAME is required in production'); })() : '');
