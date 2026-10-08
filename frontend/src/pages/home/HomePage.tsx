import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import ProfileModal from './components/ProfileModal';

export default function HomePage() {
  const user = useAuth(state => state.user)!;
  const [open, setOpen] = useState(false); const [saved, setSaved] = useState(false);
  return <>
    <button className="profile-card" onClick={() => { setOpen(true); setSaved(false); }} aria-haspopup="dialog">
      <span className="avatar" aria-hidden="true">{user.fullName.trim().slice(0, 1).toUpperCase()}</span>
      <span className="profile-copy"><span className="eyebrow">TÀI KHOẢN CỦA BẠN</span><strong>{user.fullName}</strong><span className="muted">{user.email}</span></span>
      <span className="profile-arrow" aria-hidden="true">↗</span>
    </button>
    {saved && <p className="notice success" role="status">Đã cập nhật thông tin của bạn.</p>}
    {open && <ProfileModal user={user} onClose={() => setOpen(false)} onSaved={() => setSaved(true)} />}
  </>;
}
