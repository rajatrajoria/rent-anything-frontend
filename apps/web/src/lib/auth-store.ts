import { create } from "zustand";
import type { UserProfileResponse } from "@rent-anything/types";

interface AuthState {
  user: UserProfileResponse | null;
  /** True once the initial silent-refresh-on-load attempt has finished. */
  hasHydrated: boolean;
  setUser: (user: UserProfileResponse | null) => void;
  setHydrated: () => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  hasHydrated: false,
  setUser: (user) => set({ user }),
  setHydrated: () => set({ hasHydrated: true }),
  clear: () => set({ user: null }),
}));
