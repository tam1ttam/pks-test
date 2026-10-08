import { useEffect, useState, type FormEvent } from 'react';
import Modal from '../components/Modal';
import PermissionGate from '../components/PermissionGate';
import { adminService, type UserInput } from '../services/admin.service';
import { errorMessage } from '../services/api';
import type { Role, User } from '../types';

const blank: UserInput = { fullName: '', email: '', password: '', role: 'STUDENT', isActive: true };

export default function UsersPage() {
  const [items, setItems] = useState<User[]>([]); const [total, setTotal] = useState(0);
  const [search, setSearch] = useState(''); const [role, setRole] = useState(''); const [active, setActive] = useState('');
  const [editing, setEditing] = useState<User | 'new' | null>(null); const [form, setForm] = useState<UserInput>(blank);
  const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  async function load() { try { setError(''); const page = await adminService.users({ limit: 100, ...(search && { search }), ...(role && { role }), ...(active && { isActive: active }) }); setItems(page.items); setTotal(page.total); } catch (reason) { setError(errorMessage(reason)); } }
  useEffect(() => { void load(); }, []);
  function open(user?: User) { setEditing(user || 'new'); setForm(user ? { fullName: user.fullName, email: user.email, password: '', role: user.role, isActive: user.isActive } : blank); setError(''); }
  async function submit(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError('');
    try {
      const payload = { ...form }; if (!payload.password) delete payload.password;
      if (editing === 'new') await adminService.createUser(payload as UserInput); else if (editing) await adminService.updateUser(editing.id, payload);
      setEditing(null); await load();
    } catch (reason) { setError(errorMessage(reason)); } finally { setBusy(false); }
  }
  async function remove(user: User) { if (!confirm(`Xóa tài khoản ${user.email}?`)) return; try { await adminService.deleteUser(user.id); await load(); } catch (reason) { setError(errorMessage(reason)); } }
  async function toggleLock(user: User) {
    const action = user.isActive ? 'khóa' : 'mở khóa';
    if (!confirm(`${action.charAt(0).toUpperCase() + action.slice(1)} tài khoản ${user.email}?`)) return;
    try { await adminService.updateUser(user.id, { isActive: !user.isActive }); await load(); }
    catch (reason) { setError(errorMessage(reason)); }
  }
  return <>
    <div className="page-heading"><div><p className="eyebrow">TÀI KHOẢN</p><h1>Quản lý người dùng</h1><p>{total} tài khoản trong hệ thống</p></div><PermissionGate permission="users:write"><button className="primary-button" onClick={() => open()}>＋ Thêm người dùng</button></PermissionGate></div>
    <div className="toolbar users-toolbar"><input aria-label="Tìm người dùng" value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm tên hoặc email" /><select aria-label="Lọc vai trò" value={role} onChange={e => setRole(e.target.value)}><option value="">Tất cả vai trò</option><option>ADMIN</option><option>STUDENT</option></select><select aria-label="Lọc trạng thái" value={active} onChange={e => setActive(e.target.value)}><option value="">Tất cả trạng thái</option><option value="true">Đang hoạt động</option><option value="false">Đã khóa</option></select><button className="secondary-button" onClick={() => void load()}>Tìm kiếm</button></div>
    {error && <p className="alert error">{error}</p>}
    <div className="table-card"><table><thead><tr><th>Người dùng</th><th>Vai trò</th><th>Trạng thái</th><th>Ngày tạo</th><th>Thao tác</th></tr></thead><tbody>{items.map(user => <tr key={user.id}><td><strong>{user.fullName}</strong><small>{user.email}</small></td><td><span className={`badge ${user.role.toLowerCase()}`}>{user.role}</span></td><td><span className={`badge ${user.isActive ? 'active' : 'locked'}`}>{user.isActive ? 'Hoạt động' : 'Đã khóa'}</span></td><td>{new Date(user.createdAt).toLocaleDateString('vi-VN')}</td><td><div className="row-actions"><PermissionGate permission="users:write"><button onClick={() => open(user)}>Sửa</button><button className={user.isActive ? 'warning' : 'success-action'} onClick={() => void toggleLock(user)}>{user.isActive ? 'Khóa' : 'Mở khóa'}</button></PermissionGate><PermissionGate permission="users:delete"><button className="danger" onClick={() => void remove(user)}>Xóa</button></PermissionGate></div></td></tr>)}</tbody></table>{!items.length && <p className="empty">Không có người dùng phù hợp.</p>}</div>
    {editing && <Modal title={editing === 'new' ? 'Thêm người dùng' : 'Cập nhật người dùng'} onClose={() => setEditing(null)}><form className="form-grid" onSubmit={submit}><label>Họ và tên<input value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} required minLength={2} maxLength={100} /></label><label>Email<input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required /></label><label>Mật khẩu<input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required={editing === 'new'} minLength={8} /><small>{editing !== 'new' && 'Để trống nếu không đổi mật khẩu'}</small></label><label>Vai trò<select value={form.role} onChange={e => setForm({ ...form, role: e.target.value as Role })}><option>STUDENT</option><option>ADMIN</option></select></label>{error && <p className="alert error span-2">{error}</p>}<div className="modal-actions span-2"><button type="button" className="secondary-button" onClick={() => setEditing(null)}>Hủy</button><button className="primary-button" disabled={busy}>{busy ? 'Đang lưu…' : 'Lưu'}</button></div></form></Modal>}
  </>;
}
