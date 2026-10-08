export type Role = 'STUDENT' | 'ADMIN';
export type Permission = 'dashboard:view' | 'users:read' | 'users:write' | 'users:delete' | 'courses:read' | 'courses:write' | 'courses:delete' | 'enrollments:read' | 'enrollments:write' | 'enrollments:delete';

export interface User { id: string; fullName: string; email: string; role: Role; isActive: boolean; createdAt: string }
export interface AuthResponse { accessToken: string; user: User }
export interface Page<T> { items: T[]; total: number; page: number; limit: number }
export interface Course {
  id: string; name: string; category: string; instructor: string; shortDescription: string;
  description: string; tuition: number; capacity: number; enrolledCount: number;
  isPublished: boolean; availability: 'AVAILABLE' | 'FULL'; createdAt: string;
}
export interface Enrollment {
  id: string; studentId: string; courseId: string; status: 'ENROLLED' | 'CANCELLED';
  enrolledAt: string; enrolledDate: string; student: Pick<User, 'id' | 'fullName' | 'email'>;
  course: Course;
}

