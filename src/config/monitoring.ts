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


// Cloudflare Web Analytics
export const CF_BEACON_TOKEN: string = process.env.NEXT_PUBLIC_CF_BEACON_TOKEN ?? "";