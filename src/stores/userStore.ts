import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../services/auth';
import { canonicalRole, toUserRole, type UserRole } from '../domain/roles';

export type { UserRole };

interface UserState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  role: UserRole | null;
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  clearAuth: () => void;
  updateFactoryId: (factoryId: string) => void;
  hasRole: (role: UserRole) => boolean;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      role: null,

      setUser: (user) => {
        localStorage.setItem('user', JSON.stringify(user));
        set((state) => ({
          user,
          token: state.token,
          isAuthenticated: true,
          role: toUserRole(user.role),
        }));
      },

      setToken: (token) => {
        const clean = token.startsWith('Bearer ') ? token.slice(7) : token;
        localStorage.setItem('token', clean);
        set((state) => ({
          token: clean,
          user: state.user,
          isAuthenticated: true,
          role: state.role,
        }));
      },

      clearAuth: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        set({ user: null, token: null, isAuthenticated: false, role: null });
      },

      updateFactoryId: (factoryId) =>
        set((state) => ({
          user: state.user ? { ...state.user, factoryId } : null,
        })),

      hasRole: (role) => canonicalRole(get().role) === canonicalRole(role),
    }),
    {
      name: 'user-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        role: state.role,
      }),
    },
  ),
);
