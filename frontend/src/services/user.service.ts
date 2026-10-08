import { api } from './api';
import type { User } from '../types/user.type';
export const userService = {
  async update(fullName: string) { return (await api.patch<User>('/users/me', { fullName })).data; },
};
