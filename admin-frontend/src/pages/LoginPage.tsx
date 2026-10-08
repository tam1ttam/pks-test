import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { authService } from '../services/auth.service';
import { errorMessage } from '../services/api';
import { useAuth } from '../store/auth.store';

export default function LoginPage() {
  const current = useAuth(state => state.user); const signIn = useAuth(state => state.signIn);
  const [email, setEmail] = useState(''); const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false); const [error, setError] = useState(''); const navigate = useNavigate();
  if (current) return <Navigate to="/" replace />;
  async function submit(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError('');
    try {
      const response = await authService.login(email, password);
      if (response.user.role !== 'ADMIN') {
        await authService.rejectSession(response.accessToken).catch(() => undefined);
        throw new Error('Cổng này chỉ dành cho Admin.');
      }
      signIn(response); navigate('/', { replace: true });
    } catch (reason) { setError(errorMessage(reason)); }
    finally { setBusy(false); }
  }
  return <main className="login-page">
    <section className="login-aside"><div className="login-logo">PK</div><div><p>PKS MANAGEMENT</p><h1>Điều hành hệ thống học tập tập trung.</h1><span>Quản lý người dùng, khóa học và ghi danh theo quyền được cấp.</span></div><small>Admin portal · localhost:5174</small></section>
    <section className="login-panel"><form onSubmit={submit} className="login-card">
      <p className="eyebrow">CỔNG QUẢN TRỊ</p><h2>Đăng nhập quản trị</h2><p className="subtle">Sử dụng tài khoản Admin.</p>
      <label>Email<input type="email" autoComplete="username" value={email} onChange={e => setEmail(e.target.value)} required /></label>
      <label>Mật khẩu<input type="password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} required /></label>
      {error && <p className="alert error" role="alert">{error}</p>}
      <button className="primary-button full" disabled={busy}>{busy ? 'Đang đăng nhập…' : 'Đăng nhập'}</button>
      <p className="demo-account">Demo: admin@pks.demo / PksDemo@123</p>
    </form></section>
  </main>;
}

