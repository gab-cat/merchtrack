import { User } from "@prisma/client";

export interface SessionMetadataData {
  id?: string;
  isStaff?: boolean;
}

export interface SessionMetadata {
  isOnboardingCompleted?: boolean;
  data?: User;
}

export interface SessionClaims {
  metadata?: SessionMetadata;
}

export interface AuthSession {
  sessionClaims?: SessionClaims;
}