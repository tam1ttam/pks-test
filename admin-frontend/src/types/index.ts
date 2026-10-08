export type Role = 'STUDENT' | 'ADMIN';
export type Permission = 'dashboard:view' | 'users:read' | 'users:write' | 'users:delete' | 'courses:read' | 'courses:write' | 'courses:delete' | 'enrollments:read' | 'enrollments:write' | 'enrollments:delete';

export interface User { code: string; fullName: string; email: string; role: Role; isActive: boolean; avatarUrl?: string | null; createdAt: string }
export interface AuthResponse { user: User }
export interface Page<T> { items: T[]; total: number; page: number; limit: number }
export interface Course {
  code: string; name: string; categoryCode: string; category: string; instructor: string; shortDescription: string;
  description: string; tuition: number; capacity: number; enrolledCount: number;
  isPublished: boolean; imageUrl?: string | null; availability: 'AVAILABLE' | 'FULL'; createdAt: string;
}
export interface Enrollment {
  code: string; studentCode: string; courseCode: string; status: 'ENROLLED' | 'CANCEL_REQUESTED' | 'CANCELLED';
  enrolledAt: string; enrolledDate: string; updatedAt: string; student: Pick<User, 'code' | 'fullName' | 'email'>;
  course: Course;
}

