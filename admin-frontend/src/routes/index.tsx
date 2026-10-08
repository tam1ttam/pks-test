import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import AdminLayout from '../layouts/AdminLayout';
import LoginPage from '../pages/LoginPage';
import DashboardPage from '../pages/DashboardPage';
import UsersPage from '../pages/UsersPage';
import CoursesPage from '../pages/CoursesPage';
import EnrollmentsPage from '../pages/EnrollmentsPage';
import ForbiddenPage from '../pages/ForbiddenPage';
import NotFoundPage from '../pages/NotFoundPage';
import { can } from '../constants/permissions';
import { useAuth } from '../store/auth.store';
import type { Permission } from '../types';

function ProtectedRoute() { return useAuth(state => state.user) ? <Outlet /> : <Navigate to="/login" replace />; }
function PermissionRoute({ permission }: { permission: Permission }) {
  const role = useAuth(state => state.user?.role);
  return can(role, permission) ? <Outlet /> : <Navigate to="/forbidden" replace />;
}

export default function AppRoutes() {
  return <Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route element={<ProtectedRoute />}><Route element={<AdminLayout />}>
      <Route element={<PermissionRoute permission="dashboard:view" />}><Route index element={<DashboardPage />} /></Route>
      <Route element={<PermissionRoute permission="users:read" />}><Route path="users" element={<UsersPage />} /></Route>
      <Route element={<PermissionRoute permission="courses:read" />}><Route path="courses" element={<CoursesPage />} /></Route>
      <Route element={<PermissionRoute permission="enrollments:read" />}><Route path="enrollments" element={<EnrollmentsPage />} /></Route>
      <Route path="forbidden" element={<ForbiddenPage />} />
    </Route></Route>
    <Route path="*" element={<NotFoundPage />} />
  </Routes>;
}

