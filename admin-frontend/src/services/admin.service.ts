import { api } from './api';
import type { Course, Enrollment, Page, Role, User } from '../types';

export interface CourseInput { name: string; categoryCode: string; instructor: string; shortDescription: string; description: string; tuition: number; capacity: number; isPublished: boolean; imageUrl?: string | null }
export interface UserInput { fullName: string; email: string; password?: string; role: Role; isActive?: boolean }

export const adminService = {
  async users(params?: Record<string, string | number>) { return (await api.get<Page<User>>('/admin/users', { params })).data; },
  async createUser(input: UserInput) { return (await api.post<User>('/admin/users', input)).data; },
  async updateUser(code: string, input: Partial<UserInput>) { return (await api.patch<User>(`/admin/users/${code}`, input)).data; },
  async deleteUser(code: string) { await api.delete(`/admin/users/${code}`); },
  async deleteUsers(codes: string[]) { await api.delete('/admin/users', { data: { codes } }); },
  async resetUserPassword(code: string) { return (await api.post<{ message: string }>(`/admin/users/${code}/reset-password`)).data; },
  async courses(params?: Record<string, string | number | boolean>) { return (await api.get<Page<Course>>('/admin/courses', { params })).data; },
  async categories() { return (await api.get<{ items: Array<{ code: string; name: string }> }>('/categories')).data.items; },
  async createCourse(input: CourseInput) { return (await api.post<Course>('/admin/courses', input)).data; },
  async updateCourse(code: string, input: Partial<CourseInput>) { return (await api.patch<Course>(`/admin/courses/${code}`, input)).data; },
  async deleteCourse(code: string) { await api.delete(`/admin/courses/${code}`); },
  async courseEnrollments(code: string) { return (await api.get<Page<Enrollment>>(`/admin/courses/${code}/enrollments`, { params: { limit: 100 } })).data; },
  async enrollments(params?: Record<string, string | number>) { return (await api.get<Page<Enrollment>>('/enrollments', { params })).data; },
  async createEnrollment(courseCode: string, studentCode: string) { return (await api.post<Enrollment>('/enrollments', { courseCode, studentCode })).data; },
  async updateEnrollment(code: string, status: Enrollment['status']) { return (await api.patch<Enrollment>(`/enrollments/${code}`, { status })).data; },
  async deleteEnrollment(code: string) { await api.delete(`/enrollments/${code}`); },
};

