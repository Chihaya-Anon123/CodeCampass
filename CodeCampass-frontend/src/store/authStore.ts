import { create } from 'zustand';
import type { User } from '@/types/user';
import { tokenUtils } from '@/utils/token';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  login: (user: User, token: string) => void;
  logout: () => void;
  init: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  setUser: (user) => set({ user }),
  setToken: (token) => set({ token, isAuthenticated: !!token }),
  login: (user, token) => {
    tokenUtils.setToken(token);
    tokenUtils.setUser(user);
    set({ user, token, isAuthenticated: true });
  },
  logout: () => {
    tokenUtils.removeToken();
    tokenUtils.removeUser();
    set({ user: null, token: null, isAuthenticated: false });
  },
  init: () => {
    const token = tokenUtils.getToken();
    const user = tokenUtils.getUser();
    if (token && user) {
      set({ token, user, isAuthenticated: true });
    }
  },
}));

