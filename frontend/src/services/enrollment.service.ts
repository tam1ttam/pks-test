import { api } from './api';
import type { Enrollment, Page } from '../types/user.type';

export const enrollmentService = {
  async mine() { return (await api.get<Page<Enrollment>>('/enrollments/me', { params: { limit: 100 } })).data; },
  async enroll(courseCode: string) { return (await api.post<Enrollment>('/enrollments', { courseCode })).data; },
};
