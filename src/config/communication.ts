import { z } from 'zod';

// Communication environment variables schema
const communicationEnvSchema = z.object({
  // Email (Mailgun)
  MAILGUN_API_KEY: z.string().min(1),
  MAILGUN_DOMAIN: z.string().min(1),
  
  // Chat (Chatwoot)
  NEXT_PUBLIC_CHATWOOT_BASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_CHATWOOT_KEY: z.string().optional(),
  NEXT_PUBLIC_CHATWOOT_WEBSITE_TOKEN: z.string().optional()
});

// Parse with defaults for non-production environments
const parseEnv = () => {
  try {
    return communicationEnvSchema.parse(process.env);
  } catch (error: unknown) {
    // In production, throw errors for missing variables
    if (process.env.NODE_ENV === 'production') {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Missing or invalid communication environment variables: ${errorMessage}`);
    }
    
    // In development, use defaults but log warnings
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.warn('⚠️ Using default values for some communication environment variables:', errorMessage);
    
    return communicationEnvSchema.parse({
      ...process.env,
      MAILGUN_API_KEY: process.env.MAILGUN_API_KEY || 'key-dev',
      MAILGUN_DOMAIN: process.env.MAILGUN_DOMAIN || 'dev.example.com',
      NEXT_PUBLIC_CHATWOOT_BASE_URL: process.env.NEXT_PUBLIC_CHATWOOT_BASE_URL || 'https://chat.example.com',
      NEXT_PUBLIC_CHATWOOT_KEY: process.env.NEXT_PUBLIC_CHATWOOT_KEY || '',
      NEXT_PUBLIC_CHATWOOT_WEBSITE_TOKEN: process.env.NEXT_PUBLIC_CHATWOOT_WEBSITE_TOKEN || ''
    });
  }
};

export const communicationConfig = parseEnv();

// Export individual variables for convenience
export const {
  MAILGUN_API_KEY,
  MAILGUN_DOMAIN,
  NEXT_PUBLIC_CHATWOOT_BASE_URL,
  NEXT_PUBLIC_CHATWOOT_KEY,
  NEXT_PUBLIC_CHATWOOT_WEBSITE_TOKEN
} = communicationConfig; 