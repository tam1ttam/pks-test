import { api } from './api';
import type { User } from '../types/user.type';
export const userService = {
  async update(fullName: string, avatarUrl?: string | null) { return (await api.patch<User>('/users/me', { fullName, ...(avatarUrl !== undefined && { avatarUrl }) })).data; },
};
