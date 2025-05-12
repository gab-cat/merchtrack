import { z } from 'zod';

// Auth and security environment variables schema
const authEnvSchema = z.object({
  // JWT
  JWT_KEY: z.string().min(32).optional(),
  NEXT_PUBLIC_API_KEY: z.string().optional(),
  
  // Clerk
  CLERK_ENCRYPTION_KEY: z.string().min(32).optional(),
  CLERK_SECRET_KEY: z.string().min(1).optional(),
  CLERK_TEST_ADMIN_USER: z.string().optional(),
  CLERK_TEST_STAFF_USER: z.string().optional(),
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1).optional(),
  NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL: z.string().default('/dashboard'),
  NEXT_PUBLIC_CLERK_SIGN_IN_URL: z.string().default('/sign-in'),
  NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL: z.string().default('/onboarding'),
  NEXT_PUBLIC_CLERK_SIGN_UP_URL: z.string().default('/sign-up')
});

// Parse with defaults for non-production environments
const parseEnv = () => {
  try {
    return authEnvSchema.parse(process.env);
  } catch (error: unknown) {
    // In production, throw errors for missing variables
    if (process.env.NODE_ENV === 'production') {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Missing or invalid auth environment variables: ${errorMessage}`);
    }
    
    // In development, use defaults but log warnings
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.warn('⚠️ Using default values for some auth environment variables:', errorMessage);
    
    return authEnvSchema.parse({
      ...process.env,
      CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY || '',
      NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || '', 
      NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL || '/dashboard',
      NEXT_PUBLIC_CLERK_SIGN_IN_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL || '/sign-in',
      NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL || '/onboarding',
      NEXT_PUBLIC_CLERK_SIGN_UP_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL || '/sign-up'
    });
  }
};

export const authConfig = parseEnv();

// Export individual variables for convenience
export const {
  JWT_KEY,
  NEXT_PUBLIC_API_KEY,
  CLERK_ENCRYPTION_KEY,
  CLERK_SECRET_KEY,
  CLERK_TEST_ADMIN_USER,
  CLERK_TEST_STAFF_USER,
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL,
  NEXT_PUBLIC_CLERK_SIGN_IN_URL,
  NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL,
  NEXT_PUBLIC_CLERK_SIGN_UP_URL
} = authConfig; 