export interface User {
  id: string;
  fullName: string;
  email: string;
  role: 'STUDENT' | 'ADMIN';
  isActive: boolean;
  createdAt: string;
}

export interface AuthResponse { accessToken: string; user: User }

export interface Course {
  id: string;
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
