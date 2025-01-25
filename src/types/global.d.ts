export {};


declare global {
  interface CustomJwtSessionClaims {
    metadata: {
      isOnboardingCompleted?: boolean;
      permissions?: string[];
      data: User;
    }
  }
}