import { NavLink, Outlet } from 'react-router-dom';
export default function MainLayout() {
  return <div className="main-shell"><header className="main-header"><NavLink to="/" className="brand"><span className="brand-mark">pks</span><span>EDUCATION</span></NavLink><nav><NavLink to="/courses">Khóa học</NavLink><NavLink to="/">Tài khoản</NavLink></nav></header><main className="home-content"><Outlet /></main></div>;
}
