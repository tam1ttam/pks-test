import { Link, Outlet } from 'react-router-dom';
export default function AuthLayout() {
  return <main className="auth-shell">
    <aside className="auth-intro">
      <Link to="/" className="brand"><span className="brand-mark">pks</span><span>EDUCATION</span></Link>
      <div><p className="eyebrow">KHỞI ĐẦU TỪ HÔM NAY</p><h1>Mỗi bước nhỏ.<br />Một tương lai lớn.</h1><p className="intro-copy">Chào mừng bạn đến với PKS.<br />Một tài khoản, kết nối hành trình của bạn.</p></div>
      <span className="intro-foot">PKS Course & Enrollment Portal</span>
    </aside>
    <section className="auth-content"><div className="auth-card"><Outlet /></div><p className="copyright">© {new Date().getFullYear()} PKS Education</p></section>
  </main>;
}
