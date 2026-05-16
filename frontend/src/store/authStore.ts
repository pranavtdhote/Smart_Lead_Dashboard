import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../types';
import { apiClient } from '../lib/axios';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, accessToken: string) => void;
  setAccessToken: (accessToken: string) => void;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,

      setAuth: (user, accessToken) => {
        set({ user, accessToken, isAuthenticated: true });
      },

      setAccessToken: (accessToken) => {
        set({ accessToken });
      },

      logout: async () => {
        try {
          await apiClient.post('/auth/logout');
        } catch {
          // Ignore logout errors
        } finally {
          set({ user: null, accessToken: null, isAuthenticated: false });
        }
      },

      checkAuth: async () => {
        try {
          // Verify current token or try to refresh via interceptor
          const { data } = await apiClient.get('/auth/me');
          set({ user: data.data.user, isAuthenticated: true });
        } catch {
          set({ user: null, accessToken: null, isAuthenticated: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      // Only persist the token and user data, not the checking state
      partialize: (state) => ({ user: state.user, accessToken: state.accessToken, isAuthenticated: state.isAuthenticated }),
    }
  )
);
