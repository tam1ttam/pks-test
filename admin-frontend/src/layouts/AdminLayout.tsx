import { useEffect, useRef, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import Modal from '../components/Modal';
import { can } from '../constants/permissions';
import { showToast } from '../components/Toast';
import { useAuth } from '../store/auth.store';

export default function AdminLayout() {
  const user = useAuth(state => state.user)!; const logout = useAuth(state => state.logout); const navigate = useNavigate();
  const [menu, setMenu] = useState(false); const [profile, setProfile] = useState(false); const ref = useRef<HTMLDivElement>(null);
  const navigation = [{ to: '/', label: 'Tổng quan', icon: '⌂', permission: 'dashboard:view' as const }, { to: '/users', label: 'Người dùng', icon: '♙', permission: 'users:read' as const }, { to: '/courses', label: 'Khóa học', icon: '◇', permission: 'courses:read' as const }, { to: '/enrollments', label: 'Ghi danh', icon: '☑', permission: 'enrollments:read' as const }];
  useEffect(() => { const close = (event: MouseEvent) => { if (!ref.current?.contains(event.target as Node)) setMenu(false); }; document.addEventListener('mousedown', close); return () => document.removeEventListener('mousedown', close); }, []);
  return <div className="admin-shell"><aside className="sidebar">
    <div className="admin-brand"><span>PK</span><div><strong>PKS ADMIN</strong><small>Management console</small></div></div><p className="nav-label">QUẢN TRỊ HỆ THỐNG</p>
    <nav>{navigation.filter(item => can(user.role, item.permission)).map(item => <NavLink key={item.to} to={item.to} end={item.to === '/'}><span>{item.icon}</span>{item.label}</NavLink>)}</nav>
    <div className="sidebar-account"><span className="avatar">{user.fullName.charAt(0).toUpperCase()}</span><div><strong>{user.fullName}</strong><small>{user.role}</small></div></div>
  </aside><div className="workspace"><header className="topbar"><div><strong>Quản trị khóa học</strong><small>PKS · Management Console</small></div><div className="topbar-actions">
    <div className="admin-account-menu" ref={ref}><button className="admin-user-trigger" onClick={() => setMenu(value => !value)} aria-expanded={menu}>{user.fullName.charAt(0).toUpperCase()}</button>{menu && <div className="admin-dropdown"><button onClick={() => { setProfile(true); setMenu(false); }}>Hồ sơ</button><button onClick={async () => { await logout(); showToast('Đã đăng xuất khỏi cổng quản trị.'); navigate('/login'); }}>Đăng xuất</button></div>}</div>
  </div></header><main className="page"><Outlet /></main></div>
  {profile && <Modal title="Hồ sơ" onClose={() => setProfile(false)}><dl className="profile-details"><div><dt>Họ và tên</dt><dd>{user.fullName}</dd></div><div><dt>Email</dt><dd>{user.email}</dd></div><div><dt>Vai trò</dt><dd>{user.role}</dd></div></dl></Modal>}</div>;
}
