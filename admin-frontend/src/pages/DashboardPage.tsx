import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { can } from '../constants/permissions';
import { adminService } from '../services/admin.service';
import { errorMessage } from '../services/api';
import { useAuth } from '../store/auth.store';

export default function DashboardPage() {
  const user = useAuth(state => state.user)!;
  const [stats, setStats] = useState({ users: '—', courses: '—', enrollments: '—' });
  const [error, setError] = useState('');
  useEffect(() => {
    Promise.all([
      can(user.role, 'users:read') ? adminService.users({ limit: 1 }) : null,
      adminService.courses({ limit: 1 }), adminService.enrollments({ limit: 1 }),
    ]).then(([users, courses, enrollments]) => setStats({ users: users ? String(users.total) : 'Không có quyền', courses: String(courses.total), enrollments: String(enrollments.total) }))
      .catch(reason => setError(errorMessage(reason)));
  }, [user.role]);
  return <>
    <div className="page-heading"><div><p className="eyebrow">TỔNG QUAN</p><h1>Xin chào, {user.fullName}</h1><p>Quyền hiện tại: <span className="badge purple">{user.role}</span></p></div></div>
    {error && <p className="alert error">{error}</p>}
    <section className="stats-grid">
      {can(user.role, 'users:read') && <Link to="/users" className="stat-card"><span>Người dùng</span><strong>{stats.users}</strong><small>Quản lý tài khoản và vai trò →</small></Link>}
      <Link to="/courses" className="stat-card"><span>Khóa học</span><strong>{stats.courses}</strong><small>Quản lý nội dung và sĩ số →</small></Link>
      <Link to="/enrollments" className="stat-card"><span>Ghi danh</span><strong>{stats.enrollments}</strong><small>Theo dõi trạng thái học viên →</small></Link>
    </section>
    <section className="info-panel"><h2>Quyền quản trị</h2><div className="permission-row"><b>ADMIN</b><span>Toàn quyền người dùng, khóa học và ghi danh.</span></div></section>
  </>;
}

