/**
 * Auth Store — Zustand global state for authentication
 *
 * Manages user session, profile, and subscription state.
 */
import type { UserProfile } from '@become/shared';

// Zustand store interface — actual create() call requires the package installed
export interface AuthStore {
  // State
  session: { user: { id: string; email: string } } | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  // Actions
  setSession: (session: AuthStore['session']) => void;
  setProfile: (profile: UserProfile | null) => void;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

/**
 * Store factory — will be initialized with zustand create()
 * Example usage:
 *
 * export const useAuthStore = create<AuthStore>((set, get) => ({
 *   session: null,
 *   profile: null,
 *   isLoading: true,
 *   isAuthenticated: false,
 *   setSession: (session) => set({ session, isAuthenticated: !!session }),
 *   setProfile: (profile) => set({ profile }),
 *   signOut: async () => { ... },
 *   refreshProfile: async () => { ... },
 * }));
 */

// Placeholder export for type-checking — real implementation connects to Supabase auth listener
export const AUTH_STORE_INITIAL_STATE: Omit<AuthStore, 'setSession' | 'setProfile' | 'signOut' | 'refreshProfile'> = {
  session: null,
  profile: null,
  isLoading: true,
  isAuthenticated: false,
};
