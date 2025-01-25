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
      setUser(user.publicMetadata.data as User);
    } else if (!isSignedIn) {
      clearUser();
    }
  }, [isSignedIn]);

  return null;
};

export default SyncUserData;