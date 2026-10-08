import { Link } from 'react-router-dom';
import type { Course } from '../../../types/user.type';

export default function CourseCard({ course }: { course: Course }) {
  return <article className="course-card">
    <div className="course-cover" style={course.imageUrl ? { backgroundImage: `linear-gradient(#12392a55,#12392a55),url(${course.imageUrl})` } : undefined}><span>{course.category}</span>{!course.imageUrl && <b>{course.name.slice(0, 2).toUpperCase()}</b>}</div>
    <div className="course-card-body"><span className={`course-status ${course.availability === 'FULL' ? 'full' : ''}`}>{course.availability === 'FULL' ? 'Đã đủ chỗ' : 'Đang mở'}</span><h2>{course.name}</h2><p>{course.shortDescription}</p><dl><div><dt>Giảng viên</dt><dd>{course.instructor}</dd></div><div><dt>Học phí</dt><dd>{course.tuition.toLocaleString('vi-VN')} ₫</dd></div><div><dt>Sĩ số tối đa</dt><dd>{course.capacity}</dd></div><div><dt>Đã ghi danh</dt><dd>{course.enrolledCount}</dd></div></dl><div className="course-card-actions"><Link className="course-link" to={`/courses/${course.code}`}>Xem chi tiết</Link><Link className={`quick-enroll ${course.availability === 'FULL' ? 'disabled' : ''}`} aria-disabled={course.availability === 'FULL'} to={`/courses/${course.code}`}>{course.availability === 'FULL' ? 'Đã đủ chỗ' : 'Ghi danh ngay'}</Link></div></div>
  </article>;
}
