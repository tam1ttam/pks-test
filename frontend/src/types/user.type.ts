export interface User {
  id: string;
  fullName: string;
  email: string;
  role: 'STUDENT' | 'ADMIN' | 'STAFF';
  createdAt: string;
}

export interface AuthResponse { accessToken: string; user: User }
