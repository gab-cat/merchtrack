export {};


declare global {
  interface CustomJwtSessionClaims {
    metadata: {
      isOnboardingCompleted?: boolean;
      permissions?: string[];
      data: {
        firstName: string
        lastName: string
        email: string
        role: string
        college: string
        courses: string
        
        isStaff: boolean
      }
    }
  }
}