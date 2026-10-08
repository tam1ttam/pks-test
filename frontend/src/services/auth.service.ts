import { api } from './api';
import type { AuthResponse, User } from '../types/user.type';

export const authService = {
  async login(email: string, password: string) { return (await api.post<AuthResponse>('/auth/login', { email, password, portal: 'CLIENT' })).data; },
  async register(fullName: string, email: string, password: string) { return (await api.post<User>('/auth/register', { fullName, email, password })).data; },
  async google(credential: string) { return (await api.post<AuthResponse>('/auth/google', { credential, portal: 'CLIENT' })).data; },
  async me() { return (await api.get<User>('/auth/me')).data; },
  async logout() { await api.post('/auth/logout'); },
};
