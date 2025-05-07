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
        if (user && userData && typeof window !== 'undefined' && window.$chatwoot) {
          // Ensure userData is properly typed
          const { id, firstName, lastName, email, phone, role } = userData;
          // Set user information in Chatwoot
          window.$chatwoot.setUser(id, {
            name: `${firstName || ''} ${lastName || ''}`.trim(),
            avatar_url: user?.imageUrl || '',
            email: email || '',
            phone_number: phone || '',
            description: role || '',
          });
        }
      } catch (error) {
        // no-dd-sa:typescript-best-practices/no-console
        console.error('Failed to sync user data:', error);
        clearUser();
      }
    } else if (!isSignedIn) {
      clearUser();
      if (typeof window !== 'undefined' && window.$chatwoot) {
        window.$chatwoot.reset();
      }
    }
  }, [isSignedIn, user, userData, setUser, clearUser]);

  useEffect(() => {
    if (userData && typeof window !== 'undefined' && window.$chatwoot) {
      const { id, firstName, lastName, email, phone, role } = userData;
      window.$chatwoot.setUser(id, {
        name: `${firstName || ''} ${lastName || ''}`.trim(),
        avatar_url: user?.imageUrl || '',
        email: email || '',
        phone_number: phone || '',
        description: role || '',
      });
    }
  }
  , [userData, user]);

  return null;
};

export default SyncUserData;