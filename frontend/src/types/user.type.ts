export interface User {
  code: string;
  fullName: string;
  email: string;
  role: 'STUDENT' | 'ADMIN';
  isActive: boolean;
  avatarUrl?: string | null;
  createdAt: string;
}

export interface AuthResponse { user: User }

export interface Course {
  code: string;
  categoryCode: string;
  name: string;
  category: string;
  instructor: string;
  shortDescription: string;
  description: string;
  tuition: number;
  capacity: number;
  enrolledCount: number;
  availability: 'AVAILABLE' | 'FULL';
  imageUrl?: string | null;
  createdAt: string;
}

export interface Page<T> { items: T[]; total: number; page: number; limit: number }

export interface Enrollment {
  code: string;
  courseCode: string;
  studentCode: string;
  status: 'ENROLLED' | 'CANCEL_REQUESTED' | 'CANCELLED';
  enrolledAt: string;
  enrolledDate: string;
  updatedAt: string;
  course: Course;
}
