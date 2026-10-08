import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import HomePage from '../pages/home/HomePage';
import NotFoundPage from '../pages/NotFoundPage';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import MainLayout from '../layouts/MainLayout';
import AuthLayout from '../layouts/AuthLayout';
import { useAuth } from '../hooks/useAuth';
import CoursesPage from '../pages/courses/CoursesPage';
import CourseDetailPage from '../pages/courses/CourseDetailPage';

function ProtectedRoute() {
  return useAuth(state => state.user) ? <Outlet /> : <Navigate to="/login" replace />;
}
function GuestRoute() {
  return useAuth(state => state.user) ? <Navigate to="/" replace /> : <Outlet />;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<ProtectedRoute />}><Route element={<MainLayout />}><Route path="/" element={<HomePage />} /><Route path="/courses" element={<CoursesPage />} /><Route path="/courses/:id" element={<CourseDetailPage />} /></Route></Route>
      <Route element={<GuestRoute />}><Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} /><Route path="/register" element={<RegisterPage />} />
      </Route></Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
