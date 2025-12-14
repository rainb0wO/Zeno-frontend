import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../services/auth';

export type UserRole = 'admin' | 'super_admin' | 'user' | 'manager';

interface UserState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  role: UserRole | null;
  permissions: string[];
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  clearAuth: () => void;
  updateFactoryId: (factoryId: string) => void;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: UserRole) => boolean;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      role: null,
      permissions: [],

      setUser: (user) =>
        set((state) => {
          console.log('setUser 调用:', user);
          // 同步保存到 localStorage
          localStorage.setItem('user', JSON.stringify(user));
          const role = (user as any).role || 'user';
          const permissions = (user as any).permissions || [];
          return {
            user,
            token: state.token, // 保留token
            isAuthenticated: true,
            role,
            permissions,
          };
        }),

      setToken: (token) =>
        set((state) => {
          console.log('setToken 调用:', token.substring(0, 20) + '...');
          // 同步保存到 localStorage
          localStorage.setItem('token', token);
          return {
            token,
            user: state.user, // 保留user
            isAuthenticated: true, // 同时设置认证状态
            role: state.role,
            permissions: state.permissions,
          };
        }),

      clearAuth: () => {
        console.log('clearAuth 调用');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return set({
          user: null,
          token: null,
          isAuthenticated: false,
          role: null,
          permissions: [],
        });
      },

      updateFactoryId: (factoryId) =>
        set((state) => ({
          user: state.user ? { ...state.user, factoryId } : null,
        })),

      hasPermission: (permission: string) => {
        const { permissions, role } = get();
        if (role === 'super_admin') return true;
        return permissions.includes(permission);
      },

      hasRole: (role: UserRole) => {
        const { role: userRole } = get();
        return userRole === role;
      },
    }),
    {
      name: 'user-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        role: state.role,
        permissions: state.permissions,
      }),
    }
  )
);
