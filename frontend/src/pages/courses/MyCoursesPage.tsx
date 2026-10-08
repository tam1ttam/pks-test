import { useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useFetch } from '../../hooks/useFetch';
import { enrollmentService } from '../../services/enrollment.service';

export default function MyCoursesPage() {
  const loader = useCallback(() => enrollmentService.mine(), []);
  const { data, loading, error, reload } = useFetch(loader);
  return <section><div className="client-heading"><div><p className="eyebrow">HỌC TẬP</p><h1>Khóa học của tôi</h1><p>Theo dõi các khóa học bạn đã ghi danh.</p></div></div>
    {error && <div className="notice error"><span>{error}</span><button onClick={reload}>Thử lại</button></div>}
    {loading ? <p className="course-state">Đang tải danh sách…</p> : !data?.items.length ? <div className="course-state"><p>Bạn chưa ghi danh khóa học nào.</p><Link className="hero-button" to="/courses">Khám phá khóa học</Link></div> : <div className="my-course-list">{data.items.map(item => <article key={item.code} className="my-course-row"><div><span className={`course-status ${item.status === 'CANCELLED' ? 'full' : ''}`}>{item.status === 'ENROLLED' ? 'Đang học' : 'Đã hủy'}</span><h2>{item.course.name}</h2><p>{item.course.category} · {item.course.instructor}</p></div><div className="enrollment-meta"><small>Ngày ghi danh</small><strong>{item.enrolledDate}</strong><Link to={`/courses/${item.course.code}`}>Xem khóa học →</Link></div></article>)}</div>}
  </section>;
}
