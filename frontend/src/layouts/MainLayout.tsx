import { Outlet } from 'react-router-dom';
export default function MainLayout() {
  return <div className="main-shell"><header className="main-header"><span className="brand"><span className="brand-mark">pks</span><span>EDUCATION</span></span></header><main className="home-content"><Outlet /></main></div>;
}
