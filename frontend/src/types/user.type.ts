export interface User {
  code: string;
  fullName: string;
  email: string;
  role: 'STUDENT' | 'ADMIN';
  isActive: boolean;
  createdAt: string;
}

export interface AuthResponse { user: User }

export interface Course {
  code: string;
  name: string;
  category: string;
  instructor: string;
  shortDescription: string;
  description: string;
  tuition: number;
  capacity: number;
  enrolledCount: number;
  availability: 'AVAILABLE' | 'FULL';
  createdAt: string;
}

export interface Page<T> { items: T[]; total: number; page: number; limit: number }

export interface Enrollment {
  code: string;
  courseCode: string;
  studentCode: string;
  status: 'ENROLLED' | 'CANCELLED';
  enrolledAt: string;
  enrolledDate: string;
  course: Course;
}
