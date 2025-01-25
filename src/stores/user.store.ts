import { User } from '@prisma/client';
import { create } from 'zustand';

type UserState = {
  userId: string | null;
  user: User | null;
  setUser: (user: User) => void;
  clearUser: () => void;
};

export const useUserStore = create<UserState>((set) => ({
  userId: null,
  user: null,
  setUser: (user: User) => set({ user, userId: user.id }),
  clearUser: () => set({ userId: null, user: null }),
}));
