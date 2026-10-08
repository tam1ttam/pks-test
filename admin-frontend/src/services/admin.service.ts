import { api } from './api';
import type { Course, Enrollment, Page, Role, User } from '../types';

export interface CourseInput { name: string; category: string; instructor: string; shortDescription: string; description: string; tuition: number; capacity: number; isPublished: boolean }
export interface UserInput { fullName: string; email: string; password?: string; role: Role; isActive?: boolean }

export const adminService = {
  async users(params?: Record<string, string | number>) { return (await api.get<Page<User>>('/admin/users', { params })).data; },
  async createUser(input: UserInput) { return (await api.post<User>('/admin/users', input)).data; },
  async updateUser(id: string, input: Partial<UserInput>) { return (await api.patch<User>(`/admin/users/${id}`, input)).data; },
  async deleteUser(id: string) { await api.delete(`/admin/users/${id}`); },
  async courses(params?: Record<string, string | number | boolean>) { return (await api.get<Page<Course>>('/admin/courses', { params })).data; },
  async createCourse(input: CourseInput) { return (await api.post<Course>('/admin/courses', input)).data; },
  async updateCourse(id: string, input: Partial<CourseInput>) { return (await api.patch<Course>(`/admin/courses/${id}`, input)).data; },
  async deleteCourse(id: string) { await api.delete(`/admin/courses/${id}`); },
  async enrollments(params?: Record<string, string | number>) { return (await api.get<Page<Enrollment>>('/enrollments', { params })).data; },
  async createEnrollment(courseId: string, studentId: string) { return (await api.post<Enrollment>('/enrollments', { courseId, studentId })).data; },
  async updateEnrollment(id: string, status: Enrollment['status']) { return (await api.patch<Enrollment>(`/enrollments/${id}`, { status })).data; },
  async deleteEnrollment(id: string) { await api.delete(`/enrollments/${id}`); },
};

