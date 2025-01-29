export interface SessionMetadataData {
  id?: string;
  isStaff?: boolean;
}

export interface SessionMetadata {
  isOnboardingCompleted?: boolean;
  data?: SessionMetadataData;
}

export interface SessionClaims {
  metadata?: SessionMetadata;
}

export interface AuthSession {
  sessionClaims?: SessionClaims;
}