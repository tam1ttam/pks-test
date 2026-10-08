import { create } from 'zustand';
import { ADMIN_TOKEN_KEY } from '../constants/storage';
import { authService } from '../services/auth.service';
import type { AuthResponse, User } from '../types';

interface AuthState {
  user: User | null; ready: boolean;
  initialize: () => Promise<void>; signIn: (response: AuthResponse) => void;
  clear: () => void; logout: () => Promise<void>;
}

export const useAuth = create<AuthState>((set, get) => ({
  user: null, ready: false,
  initialize: async () => {
    if (!sessionStorage.getItem(ADMIN_TOKEN_KEY)) { set({ ready: true }); return; }
    try {
      const user = await authService.me();
      if (user.role !== 'ADMIN') throw new Error('Tài khoản không có quyền vào cổng quản trị.');
      set({ user });
    } catch { sessionStorage.removeItem(ADMIN_TOKEN_KEY); set({ user: null }); }
    finally { set({ ready: true }); }
  },
  signIn: response => { sessionStorage.setItem(ADMIN_TOKEN_KEY, response.accessToken); set({ user: response.user, ready: true }); },
  clear: () => { sessionStorage.removeItem(ADMIN_TOKEN_KEY); set({ user: null, ready: true }); },
  logout: async () => { try { await authService.logout(); } finally { get().clear(); } },
}));

