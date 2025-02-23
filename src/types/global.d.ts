export {};

import type { User } from '@prisma/client';

declare global {
  interface CustomJwtSessionClaims {
    metadata: {
      isLocked?: boolean;
      isOnboardingCompleted?: boolean;
      permissions?: string[];
      data: User;
    }
  }
}