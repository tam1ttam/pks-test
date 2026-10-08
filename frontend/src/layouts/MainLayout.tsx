import { useEffect, useRef, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useI18n } from '../i18n';
import ProfileModal from '../pages/home/components/ProfileModal';

export default function MainLayout() {
  const user = useAuth(state => state.user)!; const logout = useAuth(state => state.logout);
  const [menu, setMenu] = useState(false); const [profile, setProfile] = useState(false); const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate(); const { locale, setLocale, t } = useI18n();
  useEffect(() => { const close = (event: MouseEvent) => { if (!ref.current?.contains(event.target as Node)) setMenu(false); }; document.addEventListener('mousedown', close); return () => document.removeEventListener('mousedown', close); }, []);
  return <div className="main-shell"><header className="main-header">
    <NavLink to="/" className="brand"><span className="brand-mark">pks</span><span>EDUCATION</span></NavLink>
    <div className="header-actions"><nav className="client-nav"><NavLink to="/" end>{t('home')}</NavLink><NavLink to="/courses">{t('courses')}</NavLink><NavLink to="/my-courses">{t('myCourses')}</NavLink></nav>
      <button className="locale-button" onClick={() => setLocale(locale === 'vi' ? 'en' : 'vi')} aria-label={t('language')}>◎ {locale.toUpperCase()}</button>
      <div className="account-menu" ref={ref}><button className="user-trigger" onClick={() => setMenu(value => !value)} aria-expanded={menu} aria-label={t('account')}>{user.fullName.charAt(0).toUpperCase()}</button>
        {menu && <div className="account-dropdown"><div><strong>{user.fullName}</strong><small>{user.email}</small></div><button onClick={() => { setProfile(true); setMenu(false); }}>{t('profile')}</button><button onClick={async () => { await logout(); navigate('/login'); }}>{t('logout')}</button></div>}
      </div>
    </div>
  </header><main className="home-content"><Outlet /></main>{profile && <ProfileModal user={user} onClose={() => setProfile(false)} onSaved={() => undefined} />}</div>;
}
