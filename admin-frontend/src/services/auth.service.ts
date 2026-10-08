import { api } from './api';
import type { AuthResponse, User } from '../types';

export const authService = {
  async login(email: string, password: string) { return (await api.post<AuthResponse>('/auth/login', { email, password, portal: 'ADMIN' })).data; },
  async me() { return (await api.get<User>('/auth/me')).data; },
  async logout() { await api.post('/auth/logout'); },
};

