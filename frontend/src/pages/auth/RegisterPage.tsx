import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { authService } from '../../services/auth.service';
import { errorMessage } from '../../services/api';
import GoogleSignIn from './components/GoogleSignIn';

export default function RegisterPage() {
  const [fullName, setFullName] = useState(''); const [email, setEmail] = useState(''); const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false); const [error, setError] = useState(''); const navigate = useNavigate();
  async function submit(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError('');
    try {
      if (new TextEncoder().encode(password).length > 72) throw new Error('Mật khẩu tối đa 72 byte UTF-8.');
      await authService.register(fullName, email, password);
      navigate('/login', { replace: true, state: { registered: true } });
    } catch (reason) { setError(errorMessage(reason)); } finally { setBusy(false); }
  }
  return <>
    <p className="eyebrow">BẮT ĐẦU HÀNH TRÌNH</p><h2>Tạo tài khoản</h2><p className="muted">Rất vui được đồng hành cùng bạn.</p>
    <form onSubmit={submit}><fieldset disabled={busy}>
      <Input label="Họ và tên" autoComplete="name" placeholder="Nguyễn Minh Anh" value={fullName} onChange={e => setFullName(e.target.value)} required minLength={2} maxLength={100} />
      <Input label="Email" type="email" autoComplete="email" placeholder="ban@example.com" value={email} onChange={e => setEmail(e.target.value)} required maxLength={254} />
      <Input label="Mật khẩu" type="password" autoComplete="new-password" placeholder="Ít nhất 8 ký tự" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} maxLength={72} />
      {error && <p className="notice error" role="alert">{error}</p>}
      <Button type="submit" disabled={busy}>{busy ? 'Đang tạo tài khoản…' : 'Tạo tài khoản'}<span aria-hidden="true">↗</span></Button>
    </fieldset></form>
    <GoogleSignIn busy={busy} setBusy={setBusy} setError={setError} />
    <p className="auth-switch">Đã có tài khoản? <Link to="/login">Đăng nhập</Link></p>
  </>;
}
