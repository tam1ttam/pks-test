import { useCallback, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useFetch } from '../../hooks/useFetch';
import { courseService } from '../../services/course.service';
import { enrollmentService } from '../../services/enrollment.service';
import { errorMessage } from '../../services/api';

export default function CourseDetailPage() {
  const { code = '' } = useParams();
  const loader = useCallback(async () => { const [course, mine] = await Promise.all([courseService.find(code), enrollmentService.mine()]); return { course, mine }; }, [code]);
  const { data, loading, error, reload } = useFetch(loader); const [busy, setBusy] = useState(false); const [actionError, setActionError] = useState(''); const [success, setSuccess] = useState('');
  const enrollment = useMemo(() => data?.mine.items.find(item => item.courseCode === code), [data, code]);
  async function enroll() { setBusy(true); setActionError(''); setSuccess(''); try { await enrollmentService.enroll(code); setSuccess('Ghi danh thành công. Khóa học đã được thêm vào danh sách của bạn.'); reload(); } catch (reason) { setActionError(errorMessage(reason)); } finally { setBusy(false); } }
  if (loading) return <p className="course-state">Đang tải khóa học…</p>;
  if (error || !data) return <div className="course-state"><p>{error || 'Không tìm thấy khóa học.'}</p><button onClick={reload}>Thử lại</button></div>;
  const { course } = data; const full = course.availability === 'FULL'; const enrolled = enrollment?.status === 'ENROLLED';
  return <article className="course-detail"><Link to="/courses" className="back-link">← Danh sách khóa học</Link>
    <div className="detail-hero"><div><span className="course-category">{course.category}</span><h1>{course.name}</h1><p>{course.shortDescription}</p></div><aside><small>Học phí</small><strong>{course.tuition.toLocaleString('vi-VN')} ₫</strong><span className={`course-status ${full ? 'full' : ''}`}>{full ? 'Đã đủ chỗ' : `Còn ${course.capacity - course.enrolledCount} chỗ`}</span><button className="enroll-button" disabled={busy || full || enrolled || Boolean(enrollment)} onClick={() => void enroll()}>{busy ? 'Đang ghi danh…' : enrolled ? 'Đã ghi danh' : enrollment ? 'Ghi danh đã bị hủy' : full ? 'Khóa học đã đầy' : 'Ghi danh ngay'}</button></aside></div>
    {success && <p className="notice success" role="status">{success}</p>}{actionError && <p className="notice error" role="alert">{actionError}</p>}
    <div className="detail-content"><section><h2>Nội dung khóa học</h2><p>{course.description}</p></section><dl><div><dt>Giảng viên</dt><dd>{course.instructor}</dd></div><div><dt>Sĩ số</dt><dd>{course.enrolledCount}/{course.capacity}</dd></div></dl></div>
  </article>;
}
