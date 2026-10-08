import { api } from './api';
import type { Course, Page } from '../types/user.type';

export const courseService = {
  async list(params?: { search?: string; category?: string; page?: number; limit?: number }) {
    return (await api.get<Page<Course>>('/courses', { params })).data;
  },
  async find(code: string) { return (await api.get<Course>(`/courses/${code}`)).data; },
  async categories() { return (await api.get<{ items: Array<{ code: string; name: string }> }>('/categories')).data.items; },
};
