import { useEffect, useRef, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import ProfileModal from '../pages/home/components/ProfileModal';
import { showToast } from '../components/common/Toast';

export default function MainLayout() {
  const user = useAuth(state => state.user)!; const logout = useAuth(state => state.logout);
  const [menu, setMenu] = useState(false); const [profile, setProfile] = useState(false); const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  useEffect(() => { const close = (event: MouseEvent) => { if (!ref.current?.contains(event.target as Node)) setMenu(false); }; document.addEventListener('mousedown', close); return () => document.removeEventListener('mousedown', close); }, []);
  return <div className="main-shell"><header className="main-header">
    <NavLink to="/" className="brand"><span className="brand-mark">pks</span><span>EDUCATION</span></NavLink>
    <div className="header-actions"><nav className="client-nav"><NavLink to="/" end>Trang chủ</NavLink><NavLink to="/courses">Khóa học</NavLink><NavLink to="/my-courses">Khóa học của tôi</NavLink></nav>
      <div className="account-menu" ref={ref}><button className="user-trigger" onClick={() => setMenu(value => !value)} aria-expanded={menu} aria-label="Tài khoản">{user.avatarUrl ? <img src={user.avatarUrl} alt="" /> : user.fullName.charAt(0).toUpperCase()}</button>
        {menu && <div className="account-dropdown"><div><strong>{user.fullName}</strong><small>{user.email}</small></div><button onClick={() => { setProfile(true); setMenu(false); }}>Hồ sơ</button><button onClick={async () => { await logout(); showToast('Bạn đã đăng xuất.'); navigate('/login'); }}>Đăng xuất</button></div>}
      </div>
    </div>
  </header><main className="home-content"><Outlet /></main>{profile && <ProfileModal user={user} onClose={() => setProfile(false)} onSaved={() => undefined} />}</div>;
}
