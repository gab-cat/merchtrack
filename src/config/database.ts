import { z } from 'zod';

// Database environment variables schema
const databaseEnvSchema = z.object({
  // Main Database
  DATABASE_URL: z.string().min(1),
  
  // Redis
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.string().default('6379').transform(Number),
  REDIS_PASSWORD: z.string().optional(),
  REDIS_DEV_MODE: z.enum(['0', '1']).default('0')
});

// Parse with defaults for non-production environments
const parseEnv = () => {
  try {
    return databaseEnvSchema.parse(process.env);
  } catch (error: unknown) {
    // In production, throw errors for missing variables
    if (process.env.NODE_ENV === 'production') {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Missing or invalid database environment variables: ${errorMessage}`);
    }
    
    // In development, use defaults but log warnings
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.warn('⚠️ Using default values for some database environment variables:', errorMessage);
    return databaseEnvSchema.parse({
      ...process.env,
      DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres@localhost:5432/merchtrack',
      REDIS_HOST: process.env.REDIS_HOST || 'localhost',
      REDIS_PORT: process.env.REDIS_PORT || '6379',
      REDIS_DEV_MODE: process.env.REDIS_DEV_MODE || '0'
    });
  }
};

export const dbConfig = parseEnv();

// Export individual variables for convenience
export const {
  DATABASE_URL,
  REDIS_HOST,
  REDIS_PORT,
  REDIS_PASSWORD,
  REDIS_DEV_MODE
} = dbConfig; 