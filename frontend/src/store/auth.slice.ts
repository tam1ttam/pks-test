import { create } from 'zustand';
import { authService } from '../services/auth.service';
import { errorMessage } from '../services/api';
import type { AuthResponse, User } from '../types/user.type';

interface AuthState {
  user: User | null;
  ready: boolean;
  error: string;
  initialize: () => Promise<void>;
  signIn: (response: AuthResponse) => void;
  updateUser: (user: User) => void;
  clear: () => void;
  logout: () => Promise<void>;
}
let initializing: Promise<void> | undefined;
export const useAuthStore = create<AuthState>((set, get) => ({
  user: null, ready: false, error: '',
  initialize: () => {
    if (initializing) return initializing;
    initializing = (async () => {
      set({ ready: false, error: '' });
      try { set({ user: await authService.me() }); }
      catch (error) { if (!(errorMessage(error).includes('401'))) set({ user: null }); }
      finally { set({ ready: true }); }
    })().finally(() => { initializing = undefined; });
    return initializing;
  },
  signIn: ({ user }) => { set({ user, ready: true, error: '' }); },
  updateUser: user => set({ user }),
  clear: () => { set({ user: null, ready: true, error: '' }); },
  logout: async () => { await authService.logout(); get().clear(); },
}));
