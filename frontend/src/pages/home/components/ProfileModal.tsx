import { useState, type FormEvent } from 'react';
import Modal from '../../../components/common/Modal';
import Input from '../../../components/common/Input';
import Button from '../../../components/common/Button';
import { useAuth } from '../../../hooks/useAuth';
import { userService } from '../../../services/user.service';
import { errorMessage } from '../../../services/api';
import type { User } from '../../../types/user.type';
import { uploadImage } from '../../../services/upload.service';
import { showToast } from '../../../components/common/Toast';

export default function ProfileModal({ user, onClose, onSaved }: { user: User; onClose: () => void; onSaved: () => void }) {
  const [fullName, setFullName] = useState(user.fullName); const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false); const [uploading, setUploading] = useState(false); const [error, setError] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl || '');
  const { updateUser, logout } = useAuth();
  async function submit(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError('');
    try { updateUser(await userService.update(fullName, avatarUrl || null)); showToast('Đã cập nhật hồ sơ.'); onSaved(); onClose(); }
    catch (reason) { const message=errorMessage(reason); setError(message); showToast(message,'error'); } finally { setBusy(false); }
  }
  async function signOut() {
    setBusy(true); setError('');
    try { await logout(); } catch (reason) { setError(errorMessage(reason)); } finally { setBusy(false); }
  }
  return <Modal open title="Thông tin tài khoản" onClose={onClose} busy={busy}>
    <form onSubmit={submit}><fieldset disabled={busy||uploading}>
      <Input label="Họ và tên" value={fullName} onChange={e => setFullName(e.target.value)} readOnly={!editing} required minLength={2} maxLength={100} autoComplete="name" />
      <Input label="Email" value={user.email} readOnly type="email" />
      <label className="image-upload">?nh ??i di?n<input type="file" accept="image/png,image/jpeg,image/webp" onChange={async e => { const file=e.target.files?.[0]; if(!file)return; setUploading(true); try { const url=await uploadImage(file); setAvatarUrl(url); showToast('T?i ?nh l?n th?nh c?ng.'); } catch(reason){const message=errorMessage(reason);setError(message);showToast(message,'error');} finally{setUploading(false);} }} />{uploading && <span className="upload-progress"><span className="spinner"/>?ang t?i ?nh?</span>}</label>
      <div className="avatar-preview-frame">{avatarUrl ? <img className="avatar-preview" src={avatarUrl} alt="?nh ??i di?n" /> : <span>?nh xem tr??c</span>}</div>
      {error && <p className="notice error" role="alert">{error}</p>}
      {editing ? <div className="actions"><Button type="button" className="secondary" onClick={() => { setFullName(user.fullName); setEditing(false); setError(''); }}>Hủy</Button><Button type="submit" disabled={busy||uploading}>{busy ? 'Đang lưu…' : 'Lưu thay đổi'}</Button></div>
        : <Button type="button" onClick={() => setEditing(true)}>Sửa thông tin</Button>}
      <button className="logout-button" type="button" onClick={signOut} disabled={busy}>Đăng xuất</button>
    </fieldset></form>
  </Modal>;
}
