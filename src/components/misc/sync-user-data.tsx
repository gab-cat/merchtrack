'use client';

import crypto from "crypto";
import { useUser } from "@clerk/nextjs";
import { useEffect } from "react";
import { User } from "@prisma/client";
import { useUserStore } from "@/stores/user.store";
import { NEXT_PUBLIC_CHATWOOT_KEY } from '@/config';

const SyncUserData = () => {
  const { user, isSignedIn } = useUser();
  const { setUser, clearUser, user: userData } = useUserStore();

  // Function to set user info in Chatwoot
  const setChatwootUser = () => {
    if (userData && typeof window !== 'undefined' && window.$chatwoot) {
      const { id, firstName, lastName, email, phone, role } = userData;
      const key = NEXT_PUBLIC_CHATWOOT_KEY;
      if (!key) {
        console.error('Chatwoot key is not defined');
        return;
      }
      const hmac = crypto.createHmac('sha256', key).update(id).digest('hex');
      
      window.$chatwoot.setUser(id, {
        name: `${firstName || ''} ${lastName || ''}`.trim(),
        avatar_url: user?.imageUrl || '',
        email: email || '',
        phone_number: phone || '',
        description: role || '',
        identifier_hash: hmac,
      });

      console.log('Chatwoot user set:', firstName, lastName);
    }
  };

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
      if (typeof window !== 'undefined' && window.$chatwoot) {
        window.$chatwoot.reset();
      }
    }
  }, [isSignedIn, user, userData, setUser, clearUser]);

  // Listen for the chatwoot:ready event
  useEffect(() => {
    const handleChatwootReady = () => {
      setChatwootUser();
    };

    if (typeof window !== 'undefined') {
      // Set user if Chatwoot is already ready
      if (window.$chatwoot) {
        setChatwootUser();
      }
      
      // Listen for Chatwoot ready event
      window.addEventListener('chatwoot:ready', handleChatwootReady);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('chatwoot:ready', handleChatwootReady);
      }
    };
  }, [userData, user]);

  return null;
};

export default SyncUserData;