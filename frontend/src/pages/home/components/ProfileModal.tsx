import { useState, type FormEvent } from 'react';
import Modal from '../../../components/common/Modal';
import Input from '../../../components/common/Input';
import Button from '../../../components/common/Button';
import { useAuth } from '../../../hooks/useAuth';
import { userService } from '../../../services/user.service';
import { errorMessage } from '../../../services/api';
import type { User } from '../../../types/user.type';

export default function ProfileModal({ user, onClose, onSaved }: { user: User; onClose: () => void; onSaved: () => void }) {
  const [fullName, setFullName] = useState(user.fullName); const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  const { updateUser, logout } = useAuth();
  async function submit(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError('');
    try { updateUser(await userService.update(fullName)); onSaved(); onClose(); }
    catch (reason) { setError(errorMessage(reason)); } finally { setBusy(false); }
  }
  async function signOut() {
    setBusy(true); setError('');
    try { await logout(); } catch (reason) { setError(errorMessage(reason)); } finally { setBusy(false); }
  }
  return <Modal open title="Thông tin tài khoản" onClose={onClose} busy={busy}>
    <form onSubmit={submit}><fieldset disabled={busy}>
      <Input label="Họ và tên" value={fullName} onChange={e => setFullName(e.target.value)} readOnly={!editing} required minLength={2} maxLength={100} autoComplete="name" />
      <Input label="Email" value={user.email} readOnly type="email" />
      {error && <p className="notice error" role="alert">{error}</p>}
      {editing ? <div className="actions"><Button type="button" className="secondary" onClick={() => { setFullName(user.fullName); setEditing(false); setError(''); }}>Hủy</Button><Button type="submit" disabled={busy}>{busy ? 'Đang lưu…' : 'Lưu thay đổi'}</Button></div>
        : <Button type="button" onClick={() => setEditing(true)}>Sửa thông tin</Button>}
      <button className="logout-button" type="button" onClick={signOut} disabled={busy}>Đăng xuất</button>
    </fieldset></form>
  </Modal>;
}
