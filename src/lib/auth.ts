import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import type { SessionMetadata, SessionClaims } from "../types/auth";

export async function getSessionData(): Promise<{
  sessionClaims: SessionClaims;
  metadata: SessionMetadata;
}> {
  const session = await auth();
  
  if (!session) {
    redirect('/auth/sign-in');
  }

  return {
    sessionClaims: session.sessionClaims as SessionClaims || {},
    metadata: session.sessionClaims?.metadata || {},
  };
}

export function isOnboardingCompleted(metadata?: SessionMetadata): boolean {
  return metadata?.isOnboardingCompleted === true;
}

export function isStaffMember(metadata?: SessionMetadata): boolean {
  return metadata?.data?.isStaff === true;
}

export function getUserId(metadata?: SessionMetadata): string | undefined {
  return metadata?.data?.id;
}