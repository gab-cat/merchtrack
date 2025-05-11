import { z } from 'zod';

// Storage environment variables schema
const storageEnvSchema = z.object({
  // Cloudflare R2
  CLOUDFLARE_R2_ACCESS_KEY_ID: z.string().min(1),
  CLOUDFLARE_R2_SECRET_ACCESS_KEY: z.string().min(1),
  CLOUDFLARE_R2_BUCKET_NAME: z.string().min(1),
  CLOUDFLARE_R2_ENDPOINT: z.string().url(),
  CLOUDFLARE_R2_PUBLIC_DOMAIN: z.string().min(1),
  CLOUDFLARE_R2_PUBLIC_URL: z.string().url()
});

// Parse with defaults for non-production environments
const parseEnv = () => {
  try {
    return storageEnvSchema.parse(process.env);
  } catch (error: unknown) {
    // In production, throw errors for missing variables
    if (process.env.NODE_ENV === 'production') {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Missing or invalid storage environment variables: ${errorMessage}`);
    }
    
    // In development, use defaults but log warnings
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.warn('⚠️ Using default values for some storage environment variables:', errorMessage);
    
    // For development, if missing required variables, use placeholder values
    // These won't work in production, but allow development to proceed
    return storageEnvSchema.parse({
      ...process.env,
      CLOUDFLARE_R2_ACCESS_KEY_ID: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || 'dev-access-key',
      CLOUDFLARE_R2_SECRET_ACCESS_KEY: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || 'dev-secret-key',
      CLOUDFLARE_R2_BUCKET_NAME: process.env.CLOUDFLARE_R2_BUCKET_NAME || 'dev-bucket',
      CLOUDFLARE_R2_ENDPOINT: process.env.CLOUDFLARE_R2_ENDPOINT || 'https://dev.example.com',
      CLOUDFLARE_R2_PUBLIC_DOMAIN: process.env.CLOUDFLARE_R2_PUBLIC_DOMAIN || 'dev.example.com',
      CLOUDFLARE_R2_PUBLIC_URL: process.env.CLOUDFLARE_R2_PUBLIC_URL || 'https://dev.example.com'
    });
  }
};

export const storageConfig = parseEnv();

// Export individual variables for convenience
export const {
  CLOUDFLARE_R2_ACCESS_KEY_ID,
  CLOUDFLARE_R2_SECRET_ACCESS_KEY,
  CLOUDFLARE_R2_BUCKET_NAME,
  CLOUDFLARE_R2_ENDPOINT,
  CLOUDFLARE_R2_PUBLIC_DOMAIN,
  CLOUDFLARE_R2_PUBLIC_URL
} = storageConfig; 