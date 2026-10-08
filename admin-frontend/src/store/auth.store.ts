import { create } from 'zustand';
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
    try {
      const user = await authService.me();
      if (user.role !== 'ADMIN') throw new Error('Tài khoản không có quyền vào cổng quản trị.');
      set({ user });
    } catch { set({ user: null }); }
    finally { set({ ready: true }); }
  },
  signIn: response => { set({ user: response.user, ready: true }); },
  clear: () => { set({ user: null, ready: true }); },
  logout: async () => { try { await authService.logout(); } finally { get().clear(); } },
}));

