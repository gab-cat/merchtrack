import { z } from 'zod';

// Monitoring environment variables schema
const monitoringEnvSchema = z.object({
  // Sentry
  SENTRY_AUTH_TOKEN: z.string().optional(),
  SENTRY_DSN: z.string().optional(),
  NEXT_PUBLIC_SENTRY_DSN: z.string().optional(),
  SENTRY_LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  SENTRY_SUPPRESS_TURBOPACK_WARNING: z.enum(['0', '1']).default('0'),
  SENTRY_TRACES_SAMPLE_RATE: z.string().transform(Number).default('0.4'),
  
  // Cloudflare Web Analytics
  NEXT_PUBLIC_CF_BEACON_TOKEN: z.string().optional(),
  
  // Datadog
  NEXT_PUBLIC_DATADOG_APPLICATION_ID: z.string().optional(),
  NEXT_PUBLIC_DATADOG_CLIENT_TOKEN: z.string().optional(),
  NEXT_PUBLIC_DATADOG_SERVICE_NAME: z.string().optional(),
  NEXT_PUBLIC_DATADOG_SITE: z.string().optional()
});

// Parse with defaults for non-production environments
const parseEnv = () => {
  try {
    return monitoringEnvSchema.parse(process.env);
  } catch (error: unknown) {
    // In production, throw errors for missing variables
    if (process.env.NODE_ENV === 'production') {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Missing or invalid monitoring environment variables: ${errorMessage}`);
    }
    
    // In development, use defaults but log warnings
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.warn('⚠️ Using default values for some monitoring environment variables:', errorMessage);
    
    return monitoringEnvSchema.parse({
      ...process.env,
      SENTRY_LOG_LEVEL: process.env.SENTRY_LOG_LEVEL || 'info',
      SENTRY_SUPPRESS_TURBOPACK_WARNING: process.env.SENTRY_SUPPRESS_TURBOPACK_WARNING || '0',
      SENTRY_TRACES_SAMPLE_RATE: process.env.SENTRY_TRACES_SAMPLE_RATE || '0.4'
    });
  }
};

export const monitoringConfig = parseEnv();

// Export individual variables for convenience
export const {
  SENTRY_AUTH_TOKEN,
  SENTRY_DSN,
  NEXT_PUBLIC_SENTRY_DSN,
  SENTRY_LOG_LEVEL,
  SENTRY_SUPPRESS_TURBOPACK_WARNING,
  SENTRY_TRACES_SAMPLE_RATE,
  NEXT_PUBLIC_CF_BEACON_TOKEN,
  NEXT_PUBLIC_DATADOG_APPLICATION_ID,
  NEXT_PUBLIC_DATADOG_CLIENT_TOKEN,
  NEXT_PUBLIC_DATADOG_SERVICE_NAME,
  NEXT_PUBLIC_DATADOG_SITE
} = monitoringConfig;

// For backward compatibility
export const CF_BEACON_TOKEN = NEXT_PUBLIC_CF_BEACON_TOKEN;