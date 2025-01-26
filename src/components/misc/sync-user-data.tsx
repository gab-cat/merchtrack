'use client';

import { useUser } from "@clerk/nextjs";
import { useEffect } from "react";
import { User } from "@prisma/client";
import { useUserStore } from "@/stores/user.store";

const SyncUserData = () => {
  const { user, isSignedIn } = useUser();
  const { setUser, clearUser, user: userData } = useUserStore();

  useEffect(() => {
    if (isSignedIn && userData === null) {
      try {
        const metadata = user?.publicMetadata?.data;
        if (!metadata) {
          throw new Error('User metadata is missing');
        }
        setUser(metadata as User);
      } catch (error) {
        // no-dd-sa:typescript-best-practices/no-console
        console.error('Failed to sync user data:', error);
        clearUser();
      }
    } else if (!isSignedIn) {
      clearUser();
    }
  }, [isSignedIn, user, userData, setUser, clearUser]);

  return null;
};

export default SyncUserData;