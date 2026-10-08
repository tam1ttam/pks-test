import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { can } from '../constants/permissions';
import { useAuth } from '../store/auth.store';

const navigation = [
  { to: '/', label: 'Tổng quan', icon: '⌂', permission: 'dashboard:view' as const },
  { to: '/users', label: 'Người dùng', icon: '♙', permission: 'users:read' as const },
  { to: '/courses', label: 'Khóa học', icon: '◇', permission: 'courses:read' as const },
  { to: '/enrollments', label: 'Ghi danh', icon: '☑', permission: 'enrollments:read' as const },
];

export default function AdminLayout() {
  const user = useAuth(state => state.user)!;
  const logout = useAuth(state => state.logout);
  const navigate = useNavigate();
  return <div className="admin-shell">
    <aside className="sidebar">
      <div className="admin-brand"><span>PK</span><div><strong>PKS ADMIN</strong><small>Management console</small></div></div>
      <p className="nav-label">QUẢN TRỊ HỆ THỐNG</p>
      <nav>{navigation.filter(item => can(user.role, item.permission)).map(item =>
        <NavLink key={item.to} to={item.to} end={item.to === '/'}><span>{item.icon}</span>{item.label}</NavLink>)}</nav>
      <div className="sidebar-account"><span className="avatar">{user.fullName.charAt(0).toUpperCase()}</span><div><strong>{user.fullName}</strong><small>{user.role}</small></div></div>
    </aside>
    <div className="workspace">
      <header className="topbar"><div><strong>Quản trị khóa học</strong><small>PKS · Management Console</small></div><button className="quiet-button" onClick={async () => { await logout(); navigate('/login'); }}>Đăng xuất</button></header>
      <main className="page"><Outlet /></main>
    </div>
  </div>;
}

