import { User } from '@prisma/client';
import { create } from 'zustand';

type UserState = {
  userId: string | null;
  user: User | null;
  setUser: (user: User) => void;
  clearUser: () => void;
};

import { persist } from 'zustand/middleware';

export const useUserStore = create(
  persist<UserState>(
    (set) => ({
      userId: null,
      user: null,
      setUser: (user: User) => set({ user, userId: user.id }),
      clearUser: () => set({ userId: null, user: null }),
    }),
    {
      name: 'user-storage',
    }
  )
);
