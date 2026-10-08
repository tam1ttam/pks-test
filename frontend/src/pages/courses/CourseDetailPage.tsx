import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useFetch } from '../../hooks/useFetch';
import { courseService } from '../../services/course.service';
import { enrollmentService } from '../../services/enrollment.service';
import { errorMessage } from '../../services/api';
import { showToast } from '../../components/common/Toast';
import Loading from '../../components/common/Loading';

export default function CourseDetailPage() {
  const { code = '' } = useParams();
  const loader = useCallback(async () => { const [course, mine] = await Promise.all([courseService.find(code), enrollmentService.mine()]); return { course, mine }; }, [code]);
  const { data, loading, error, reload } = useFetch(loader); const [busy, setBusy] = useState(false); const [now, setNow] = useState(Date.now()); const [actionError, setActionError] = useState(''); const [success, setSuccess] = useState('');
  const enrollment = useMemo(() => data?.mine.items.find(item => item.courseCode === code), [data, code]);
  async function enroll() { setBusy(true); setActionError(''); setSuccess(''); try { await enrollmentService.enroll(code); const message='Ghi danh thành công. Khóa học đã được thêm vào danh sách của bạn.'; setSuccess(message); showToast(message); reload(); } catch (reason) { const message=errorMessage(reason); setActionError(message); showToast(message,'error'); } finally { setBusy(false); } }
  async function requestCancellation() { if (!enrollment) return; setBusy(true); setActionError(''); try { await enrollmentService.requestCancellation(enrollment.code); const message='Đã gửi yêu cầu hủy. Vui lòng chờ Admin duyệt.'; setSuccess(message); showToast(message); reload(); } catch (reason) { const message=errorMessage(reason); setActionError(message); showToast(message,'error'); } finally { setBusy(false); } }
  async function reenroll() { if (!enrollment) return; setBusy(true); setActionError(''); try { await enrollmentService.reenroll(enrollment.code); const message='Ghi danh lại thành công.'; setSuccess(message); showToast(message); reload(); } catch (reason) { const message=errorMessage(reason); setActionError(message); showToast(message,'error'); } finally { setBusy(false); } }
  useEffect(() => { const timer=window.setInterval(() => setNow(Date.now()), 1000); return () => window.clearInterval(timer); }, []);
  if (loading) return <Loading label="Đang tải khóa học…" />;
  if (error || !data) return <div className="course-state"><p>{error || 'Không tìm thấy khóa học.'}</p><button onClick={reload}>Thử lại</button></div>;
  const { course } = data; const full = course.availability === 'FULL'; const enrolled = enrollment?.status === 'ENROLLED'; const pending = enrollment?.status === 'CANCEL_REQUESTED'; const cancelled = enrollment?.status === 'CANCELLED'; const retryRemaining = cancelled ? Math.max(0, new Date(enrollment.updatedAt).getTime() + 60_000 - now) : 0; const retrySeconds = Math.ceil(retryRemaining / 1000);
  return <article className="course-detail"><Link to="/courses" className="back-link">← Danh sách khóa học</Link>
    <div className="detail-hero"><div><span className="course-category">{course.category}</span><h1>{course.name}</h1><p>{course.shortDescription}</p></div><aside><small>Học phí</small><strong>{course.tuition.toLocaleString('vi-VN')} ₫</strong><span className={`course-status ${full ? 'full' : ''}`}>{full ? 'Đã đủ chỗ' : `Còn ${course.capacity - course.enrolledCount} chỗ`}</span>{enrolled?<button className="enroll-button cancel" disabled={busy} onClick={() => void requestCancellation()}>{busy?<><span className="button-spinner"/>Đang gửi…</>:'Hủy ghi danh'}</button>:cancelled?<button className="enroll-button" title={retryRemaining>0?`Hãy thử lại sau ${retrySeconds} giây`:'Ghi danh lại'} disabled={busy || full || retryRemaining>0} onClick={() => void reenroll()}>{busy?<><span className="button-spinner"/>Đang xử lý…</>:retryRemaining>0?`Thử lại sau ${retrySeconds}s`:'Ghi danh lại'}</button>:<button className="enroll-button" title={pending?'Yêu cầu hủy đang chờ Admin duyệt':full?'Khóa học đã đầy':''} disabled={busy || full || pending} onClick={() => void enroll()}>{busy?<><span className="button-spinner"/>Đang xử lý…</>:pending?'Đang chờ Admin duyệt':full?'Khóa học đã đầy':'Ghi danh ngay'}</button>}</aside></div>
    {success && <p className="notice success" role="status">{success}</p>}{actionError && <p className="notice error" role="alert">{actionError}</p>}
    <div className="detail-content"><section><h2>Nội dung khóa học</h2><p>{course.description}</p></section><dl><div><dt>Giảng viên</dt><dd>{course.instructor}</dd></div><div><dt>Sĩ số</dt><dd>{course.enrolledCount}/{course.capacity}</dd></div></dl></div>
  </article>;
}
