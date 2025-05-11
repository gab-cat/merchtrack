import { z } from 'zod';

// Doppler environment variables schema
const dopplerEnvSchema = z.object({
  DOPPLER_CONFIG: z.enum(['dev', 'stg', 'prd']).default('dev'),
  DOPPLER_ENVIRONMENT: z.enum(['dev', 'stg', 'prd']).default('dev'),
  DOPPLER_PROJECT: z.string().default('merchtrack')
});

// Parse with defaults for non-production environments
const parseEnv = () => {
  try {
    return dopplerEnvSchema.parse(process.env);
  } catch (error: unknown) {
    // In production, throw errors for missing variables
    if (process.env.NODE_ENV === 'production') {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Missing or invalid Doppler environment variables: ${errorMessage}`);
    }
    
    // In development, use defaults but log warnings
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.warn('⚠️ Using default values for some Doppler environment variables:', errorMessage);
    
    return dopplerEnvSchema.parse({
      ...process.env,
      DOPPLER_CONFIG: process.env.DOPPLER_CONFIG || 'dev',
      DOPPLER_ENVIRONMENT: process.env.DOPPLER_ENVIRONMENT || 'dev',
      DOPPLER_PROJECT: process.env.DOPPLER_PROJECT || 'merchtrack'
    });
  }
};

export const dopplerConfig = parseEnv();

// Export individual variables for convenience
export const {
  DOPPLER_CONFIG,
  DOPPLER_ENVIRONMENT,
  DOPPLER_PROJECT
} = dopplerConfig; 