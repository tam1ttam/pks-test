import { useCallback, useEffect, useState, type FormEvent } from 'react';
import Modal from '../components/Modal';
import PermissionGate from '../components/PermissionGate';
import { adminService } from '../services/admin.service';
import { errorMessage } from '../services/api';
import type { Enrollment } from '../types';

export default function EnrollmentsPage() {
  const [items, setItems] = useState<Enrollment[]>([]); const [total, setTotal] = useState(0);
  const [search, setSearch] = useState(''); const [status, setStatus] = useState(''); const [creating, setCreating] = useState(false);
  const [studentCode, setStudentCode] = useState(''); const [courseCode, setCourseCode] = useState(''); const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  const load = useCallback(async () => { try { setError(''); const page = await adminService.enrollments({ limit: 100, ...(search && { search }), ...(status && { status }) }); setItems(page.items); setTotal(page.total); } catch (reason) { setError(errorMessage(reason)); } }, [search, status]);
  useEffect(() => { const timer = window.setTimeout(() => void load(), 350); return () => window.clearTimeout(timer); }, [load]);
  async function create(event: FormEvent) { event.preventDefault(); setBusy(true); setError(''); try { await adminService.createEnrollment(courseCode, studentCode); setCreating(false); setCourseCode(''); setStudentCode(''); await load(); } catch (reason) { setError(errorMessage(reason)); } finally { setBusy(false); } }
  async function change(item: Enrollment) { try { await adminService.updateEnrollment(item.code, item.status === 'ENROLLED' ? 'CANCELLED' : 'ENROLLED'); await load(); } catch (reason) { setError(errorMessage(reason)); } }
  async function remove(item: Enrollment) { if (!confirm(`Xóa ghi danh của ${item.student.fullName}?`)) return; try { await adminService.deleteEnrollment(item.code); await load(); } catch (reason) { setError(errorMessage(reason)); } }
  return <>
    <div className="page-heading"><div><p className="eyebrow">VẬN HÀNH</p><h1>Quản lý ghi danh</h1><p>{total} lượt ghi danh</p></div><PermissionGate permission="enrollments:write"><button className="primary-button" onClick={() => { setCreating(true); setError(''); }}>＋ Tạo ghi danh</button></PermissionGate></div>
    <div className="toolbar"><input aria-label="Tìm ghi danh" value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm học viên hoặc khóa học" /><select aria-label="Lọc trạng thái" value={status} onChange={e => setStatus(e.target.value)}><option value="">Tất cả trạng thái</option><option value="ENROLLED">Đang học</option><option value="CANCELLED">Đã hủy</option></select></div>
    {error && <p className="alert error">{error}</p>}
    <div className="table-card"><table><thead><tr><th>Học viên</th><th>Khóa học</th><th>Ngày ghi danh</th><th>Trạng thái</th><th>Thao tác</th></tr></thead><tbody>{items.map(item => <tr key={item.code}><td><strong>{item.student.fullName}</strong><small>{item.student.email}</small></td><td><strong>{item.course.name}</strong><small>{item.course.category}</small></td><td>{item.enrolledDate || new Date(item.enrolledAt).toLocaleDateString('vi-VN')}</td><td><span className={`badge ${item.status === 'ENROLLED' ? 'active' : 'muted'}`}>{item.status === 'ENROLLED' ? 'Đang học' : 'Đã hủy'}</span></td><td><div className="row-actions"><PermissionGate permission="enrollments:write"><button onClick={() => void change(item)}>{item.status === 'ENROLLED' ? 'Hủy' : 'Kích hoạt'}</button></PermissionGate><PermissionGate permission="enrollments:delete"><button className="danger" onClick={() => void remove(item)}>Xóa</button></PermissionGate></div></td></tr>)}</tbody></table>{!items.length && <p className="empty">Không có ghi danh phù hợp.</p>}</div>
    {creating && <Modal title="Tạo ghi danh" onClose={() => setCreating(false)}><form className="form-grid" onSubmit={create}><p className="helper span-2">Nhập code của tài khoản Student và khóa học. Có thể lấy các code này từ API hoặc Postman.</p><label className="span-2">Student Code<input value={studentCode} onChange={e => setStudentCode(e.target.value)} required /></label><label className="span-2">Course Code<input value={courseCode} onChange={e => setCourseCode(e.target.value)} required /></label>{error && <p className="alert error span-2">{error}</p>}<div className="modal-actions span-2"><button type="button" className="secondary-button" onClick={() => setCreating(false)}>Hủy</button><button className="primary-button" disabled={busy}>{busy ? 'Đang tạo…' : 'Tạo ghi danh'}</button></div></form></Modal>}
  </>;
}
