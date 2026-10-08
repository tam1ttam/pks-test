import { useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useFetch } from '../../hooks/useFetch';
import { courseService } from '../../services/course.service';

export default function CourseDetailPage() {
  const { id = '' } = useParams(); const loader = useCallback(() => courseService.find(id), [id]);
  const { data: course, loading, error, reload } = useFetch(loader);
  if (loading) return <p className="course-state">Đang tải khóa học…</p>;
  if (error || !course) return <div className="course-state"><p>{error || 'Không tìm thấy khóa học.'}</p><button onClick={reload}>Thử lại</button></div>;
  return <article className="course-detail"><Link to="/courses" className="back-link">← Danh sách khóa học</Link><div className="detail-hero"><div><span className="course-category">{course.category}</span><h1>{course.name}</h1><p>{course.shortDescription}</p></div><aside><small>Học phí</small><strong>{course.tuition.toLocaleString('vi-VN')} ₫</strong><span className={`course-status ${course.availability === 'FULL' ? 'full' : ''}`}>{course.availability === 'FULL' ? 'Đã đủ chỗ' : `Còn ${course.capacity - course.enrolledCount} chỗ`}</span></aside></div><div className="detail-content"><section><h2>Nội dung khóa học</h2><p>{course.description}</p></section><dl><div><dt>Giảng viên</dt><dd>{course.instructor}</dd></div><div><dt>Sĩ số</dt><dd>{course.enrolledCount}/{course.capacity}</dd></div></dl></div></article>;
}
