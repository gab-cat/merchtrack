export {};

import type { User } from '@prisma/client';

declare global {
  interface CustomJwtSessionClaims {
    metadata: {
      isOnboardingCompleted?: boolean;
      permissions?: string[];
      data: User;
    }
  }
}