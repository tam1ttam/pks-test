import { lazy, Suspense } from 'react';
import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
const MainLayout = lazy(() => import('../layouts/MainLayout')); const AuthLayout = lazy(() => import('../layouts/AuthLayout'));
const HomePage = lazy(() => import('../pages/home/HomePage')); const CoursesPage = lazy(() => import('../pages/courses/CoursesPage')); const CourseDetailPage = lazy(() => import('../pages/courses/CourseDetailPage')); const MyCoursesPage = lazy(() => import('../pages/courses/MyCoursesPage'));
const LoginPage = lazy(() => import('../pages/auth/LoginPage')); const RegisterPage = lazy(() => import('../pages/auth/RegisterPage')); const NotFoundPage = lazy(() => import('../pages/NotFoundPage'));

function ProtectedRoute() { return useAuth(state => state.user) ? <Outlet /> : <Navigate to="/login" replace />; }
function GuestRoute() { return useAuth(state => state.user) ? <Navigate to="/" replace /> : <Outlet />; }
export default function AppRoutes() { return <Suspense fallback={<main className="session-state">Đang tải trang…</main>}><Routes>
  <Route element={<ProtectedRoute />}><Route element={<MainLayout />}><Route index element={<HomePage />} /><Route path="courses" element={<CoursesPage />} /><Route path="courses/:code" element={<CourseDetailPage />} /><Route path="my-courses" element={<MyCoursesPage />} /></Route></Route>
  <Route element={<GuestRoute />}><Route element={<AuthLayout />}><Route path="login" element={<LoginPage />} /><Route path="register" element={<RegisterPage />} /></Route></Route>
  <Route path="*" element={<NotFoundPage />} />
</Routes></Suspense>; }
