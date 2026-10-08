import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { authService } from '../../services/auth.service';
import { errorMessage } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { showToast } from '../../components/common/Toast';

export default function LoginPage() {
  const [email, setEmail] = useState(''); const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  const signIn = useAuth(state => state.signIn); const navigate = useNavigate(); const location = useLocation();
  async function submit(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError('');
    try { signIn(await authService.login(email, password)); showToast('Đăng nhập thành công.'); navigate('/', { replace: true }); }
    catch (reason) { const message = errorMessage(reason); setError(message); showToast(message, 'error'); } finally { setBusy(false); }
  }
  return <>
    <p className="eyebrow">TÀI KHOẢN CỦA BẠN</p><h2>Chào mừng trở lại</h2><p className="muted">Đăng nhập để tiếp tục cùng PKS.</p>
    {location.state?.registered && <p className="notice success" role="status">Tạo tài khoản thành công. Bạn có thể đăng nhập ngay.</p>}
    <form onSubmit={submit}>
      <fieldset disabled={busy}>
        <Input label="Email" type="email" autoComplete="username" value={email} onChange={e => setEmail(e.target.value)} required maxLength={254} />
        <Input label="Mật khẩu" type="password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} required maxLength={72} />
        {error && <p className="notice error" role="alert">{error}</p>}
        <Button type="submit" disabled={busy}>{busy ? 'Đang đăng nhập…' : 'Đăng nhập'}<span aria-hidden="true">↗</span></Button>
      </fieldset>
    </form>
    <p className="auth-switch">Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link></p>
    <p className="auth-about"><Link to="/about">About · README dự án</Link></p>
  </>;
}
