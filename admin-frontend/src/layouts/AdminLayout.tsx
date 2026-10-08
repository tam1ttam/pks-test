import { useEffect, useRef, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import Modal from '../components/Modal';
import { can } from '../constants/permissions';
import { useI18n } from '../i18n';
import { useAuth } from '../store/auth.store';

export default function AdminLayout() {
  const user = useAuth(state => state.user)!; const logout = useAuth(state => state.logout); const navigate = useNavigate();
  const { locale, setLocale, t } = useI18n(); const [menu, setMenu] = useState(false); const [profile, setProfile] = useState(false); const ref = useRef<HTMLDivElement>(null);
  const navigation = [{ to: '/', label: t('dashboard'), icon: '⌂', permission: 'dashboard:view' as const }, { to: '/users', label: t('users'), icon: '♙', permission: 'users:read' as const }, { to: '/courses', label: t('courses'), icon: '◇', permission: 'courses:read' as const }, { to: '/enrollments', label: t('enrollments'), icon: '☑', permission: 'enrollments:read' as const }];
  useEffect(() => { const close = (event: MouseEvent) => { if (!ref.current?.contains(event.target as Node)) setMenu(false); }; document.addEventListener('mousedown', close); return () => document.removeEventListener('mousedown', close); }, []);
  return <div className="admin-shell"><aside className="sidebar">
    <div className="admin-brand"><span>PK</span><div><strong>PKS ADMIN</strong><small>Management console</small></div></div><p className="nav-label">{t('system')}</p>
    <nav>{navigation.filter(item => can(user.role, item.permission)).map(item => <NavLink key={item.to} to={item.to} end={item.to === '/'}><span>{item.icon}</span>{item.label}</NavLink>)}</nav>
    <div className="sidebar-account"><span className="avatar">{user.fullName.charAt(0).toUpperCase()}</span><div><strong>{user.fullName}</strong><small>{user.role}</small></div></div>
  </aside><div className="workspace"><header className="topbar"><div><strong>{t('console')}</strong><small>PKS · Management Console</small></div><div className="topbar-actions">
    <button className="language-switch" onClick={() => setLocale(locale === 'vi' ? 'en' : 'vi')}>◎ {locale.toUpperCase()}⌄</button>
    <div className="admin-account-menu" ref={ref}><button className="admin-user-trigger" onClick={() => setMenu(value => !value)} aria-expanded={menu}>{user.fullName.charAt(0).toUpperCase()}</button>{menu && <div className="admin-dropdown"><button onClick={() => { setProfile(true); setMenu(false); }}>{t('profile')}</button><button onClick={async () => { await logout(); navigate('/login'); }}>{t('logout')}</button></div>}</div>
  </div></header><main className="page"><Outlet /></main></div>
  {profile && <Modal title={t('profile')} onClose={() => setProfile(false)}><dl className="profile-details"><div><dt>Họ và tên</dt><dd>{user.fullName}</dd></div><div><dt>Email</dt><dd>{user.email}</dd></div><div><dt>Vai trò</dt><dd>{user.role}</dd></div></dl></Modal>}</div>;
}
