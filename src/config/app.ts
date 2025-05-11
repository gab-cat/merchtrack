import { z } from 'zod';

const appEnvSchema = z.object({
  // App Configuration
  APP_ENV: z.enum(['development', 'staging', 'production']).default('development'),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  NEXT_PUBLIC_NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
  NEXT_RUNTIME: z.enum(['nodejs', 'edge']).default('nodejs'),
  NEXT_TELEMETRY_DISABLED: z.enum(['0', '1']).default('1'),
  API_PORT: z.string().default('3000'),
});

// Parse with defaults for non-production environments
const parseEnv = () => {
  try {
    return appEnvSchema.parse(process.env);
  } catch (error: unknown) {
    // In production, throw errors for missing variables
    if (process.env.NODE_ENV === 'production') {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Missing or invalid environment variables: ${errorMessage}`);
    }
    
    // In development, use defaults but log warnings
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.warn('⚠️ Using default values for some environment variables:', errorMessage);
    return appEnvSchema.parse({
      ...process.env,
      APP_ENV: process.env.APP_ENV || 'development',
      NODE_ENV: process.env.NODE_ENV || 'development',
      NEXT_PUBLIC_NODE_ENV: process.env.NEXT_PUBLIC_NODE_ENV || 'development',
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      NEXT_RUNTIME: process.env.NEXT_RUNTIME || 'nodejs',
      NEXT_TELEMETRY_DISABLED: process.env.NEXT_TELEMETRY_DISABLED || '1',
      API_PORT: process.env.API_PORT || '3000',
    });
  }
};

export const appConfig = parseEnv();

// Export individual variables for convenience
export const {
  APP_ENV,
  NODE_ENV,
  NEXT_PUBLIC_NODE_ENV,
  NEXT_PUBLIC_APP_URL,
  NEXT_RUNTIME,
  NEXT_TELEMETRY_DISABLED,
  API_PORT,
} = appConfig; 