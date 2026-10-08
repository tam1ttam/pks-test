import { useCallback, useEffect, useState, type FormEvent } from 'react';
import Modal from '../components/Modal';
import PermissionGate from '../components/PermissionGate';
import Loading from '../components/Loading';
import { adminService } from '../services/admin.service';
import { errorMessage } from '../services/api';
import type { Enrollment } from '../types';
import { useConfirm } from '../hooks/useConfirm';

export default function EnrollmentsPage() {
  const { confirmAction, confirmModal } = useConfirm();
  const [items, setItems] = useState<Enrollment[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [creating, setCreating] = useState(false);
  const [studentCode, setStudentCode] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setError('');
      const page = await adminService.enrollments({ limit: 100, ...(search && { search }), ...(status && { status }) });
      setItems(page.items); setTotal(page.total);
    } catch (reason) { setError(errorMessage(reason)); }
    finally { setLoading(false); }
  }, [search, status]);
  useEffect(() => { const timer = window.setTimeout(() => void load(), 350); return () => window.clearTimeout(timer); }, [load]);

  async function create(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError('');
    try { await adminService.createEnrollment(courseCode, studentCode); setCreating(false); setCourseCode(''); setStudentCode(''); await load(); }
    catch (reason) { setError(errorMessage(reason)); } finally { setBusy(false); }
  }
  async function setEnrollmentStatus(item: Enrollment, next: Enrollment['status']) {
    try { await adminService.updateEnrollment(item.code, next); await load(); }
    catch (reason) { setError(errorMessage(reason)); }
  }
  async function remove(item: Enrollment) {
    if (!await confirmAction({ title: 'Xác nhận xóa ghi danh', message: `Bạn có chắc muốn xóa ghi danh của ${item.student.fullName}?`, confirmLabel: 'Xóa ghi danh', danger: true })) return;
    try { await adminService.deleteEnrollment(item.code); await load(); }
    catch (reason) { setError(errorMessage(reason)); }
  }
  const statusLabel = (value: Enrollment['status']) => value === 'ENROLLED' ? 'Đang học' : value === 'CANCEL_REQUESTED' ? 'Chờ duyệt hủy' : 'Đã hủy';

  return <>
    <div className="page-heading"><div><p className="eyebrow">VẬN HÀNH</p><h1>Quản lý ghi danh</h1><p>{total} lượt ghi danh</p></div><PermissionGate permission="enrollments:write"><button className="primary-button" onClick={() => { setCreating(true); setError(''); }}>Thêm ghi danh</button></PermissionGate></div>
    <div className="toolbar"><input aria-label="Tìm ghi danh" value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm học viên hoặc khóa học" /><select aria-label="Lọc trạng thái" value={status} onChange={e => setStatus(e.target.value)}><option value="">Tất cả trạng thái</option><option value="ENROLLED">Đang học</option><option value="CANCEL_REQUESTED">Chờ duyệt hủy</option><option value="CANCELLED">Đã hủy</option></select></div>
    {error && <p className="alert error">{error}</p>}
    {loading ? <Loading /> : <div className="table-card"><table><thead><tr><th>Học viên</th><th>Khóa học</th><th>Ngày ghi danh</th><th>Trạng thái</th><th>Thao tác</th></tr></thead><tbody>{items.map(item => <tr key={item.code}><td><strong>{item.student.fullName}</strong><small>{item.student.email}</small></td><td><strong>{item.course.name}</strong><small>{item.course.category}</small></td><td>{item.enrolledDate || new Date(item.enrolledAt).toLocaleDateString('vi-VN')}</td><td><span className={`badge ${item.status === 'ENROLLED' ? 'active' : 'muted'}`}>{statusLabel(item.status)}</span></td><td><div className="row-actions"><PermissionGate permission="enrollments:write">{item.status === 'CANCEL_REQUESTED' ? <><button onClick={() => void setEnrollmentStatus(item, 'CANCELLED')}>Duyệt hủy</button><button onClick={() => void setEnrollmentStatus(item, 'ENROLLED')}>Từ chối hủy</button></> : <button onClick={() => void setEnrollmentStatus(item, item.status === 'ENROLLED' ? 'CANCELLED' : 'ENROLLED')}>{item.status === 'ENROLLED' ? 'Hủy' : 'Kích hoạt'}</button>}</PermissionGate><PermissionGate permission="enrollments:delete"><button className="danger" onClick={() => void remove(item)}>Xóa</button></PermissionGate></div></td></tr>)}</tbody></table>{!items.length && <p className="empty">Không có ghi danh phù hợp.</p>}</div>}
    {creating && <Modal title="Tạo ghi danh" onClose={() => setCreating(false)}><form className="form-grid" onSubmit={create}><p className="helper span-2">Nhập code của tài khoản Student và khóa học.</p><label className="span-2">Student Code<input value={studentCode} onChange={e => setStudentCode(e.target.value)} required /></label><label className="span-2">Course Code<input value={courseCode} onChange={e => setCourseCode(e.target.value)} required /></label>{error && <p className="alert error span-2">{error}</p>}<div className="modal-actions span-2"><button type="button" className="secondary-button" onClick={() => setCreating(false)}>Hủy</button><button className="primary-button" disabled={busy}>{busy ? 'Đang tạo…' : 'Tạo ghi danh'}</button></div></form></Modal>}
  {confirmModal}</>;
}
