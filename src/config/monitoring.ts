// Sentry
export const SENTRY_AUTH_TOKEN: string = process.env.SENTRY_AUTH_TOKEN ?? '',
  SENTRY_DSN: string = process.env.NEXT_PUBLIC_SENTRY_DSN ?? '',
  SENTRY_TRACES_SAMPLE_RATE: string = process.env.SENTRY_TRACES_SAMPLE_RATE ?? '0.4';

// Datadog
export const DATADOG_APPLICATION_ID: string = process.env.NEXT_PUBLIC_DATADOG_APPLICATION_ID ?? '',
  DATADOG_CLIENT_TOKEN: string = process.env.NEXT_PUBLIC_DATADOG_CLIENT_TOKEN ?? '',
  DATADOG_SITE: string = process.env.NEXT_PUBLIC_DATADOG_SITE ?? '',
  DATADOG_SERVICE: string = process.env.NEXT_PUBLIC_DATADOG_SERVICE_NAME ?? '';
