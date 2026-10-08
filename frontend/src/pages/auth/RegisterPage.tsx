import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { authService } from '../../services/auth.service';
import { errorMessage } from '../../services/api';
import { showToast } from '../../components/common/Toast';

export default function RegisterPage() {
  const [fullName, setFullName] = useState(''); const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [confirmPassword, setConfirmPassword] = useState('');
  const [busy, setBusy] = useState(false); const [error, setError] = useState(''); const navigate = useNavigate();
  async function submit(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError('');
    try {
      if (password !== confirmPassword) throw new Error('Mật khẩu nhập lại không khớp.');
      if (new TextEncoder().encode(password).length > 72) throw new Error('Mật khẩu tối đa 72 byte UTF-8.');
      await authService.register(fullName, email, password);
      showToast('Tạo tài khoản thành công.');
      navigate('/login', { replace: true, state: { registered: true } });
    } catch (reason) { const message=errorMessage(reason); setError(message); showToast(message, 'error'); } finally { setBusy(false); }
  }
  return <>
    <p className="eyebrow">BẮT ĐẦU HÀNH TRÌNH</p><h2>Tạo tài khoản</h2><p className="muted">Rất vui được đồng hành cùng bạn.</p>
    <form onSubmit={submit}><fieldset disabled={busy}>
      <Input label="Họ và tên" autoComplete="name" value={fullName} onChange={e => setFullName(e.target.value)} required minLength={2} maxLength={100} />
      <Input label="Email" type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} required maxLength={254} />
      <Input label="Mật khẩu" type="password" autoComplete="new-password" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} maxLength={72} />
      <Input label="Nhập lại mật khẩu" type="password" autoComplete="new-password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required minLength={8} maxLength={72} />
      {error && <p className="notice error" role="alert">{error}</p>}
      <Button type="submit" disabled={busy}>{busy ? 'Đang tạo tài khoản…' : 'Tạo tài khoản'}<span aria-hidden="true">↗</span></Button>
    </fieldset></form>
    <p className="auth-switch">Đã có tài khoản? <Link to="/login">Đăng nhập</Link></p>
  </>;
}
