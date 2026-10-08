import { useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useFetch } from '../../hooks/useFetch';
import { courseService } from '../../services/course.service';
import CourseCard from '../courses/components/CourseCard';
import Loading from '../../components/common/Loading';

export default function HomePage() {
  const loader = useCallback(() => courseService.list({ limit: 12 }), []);
  const { data, loading, error, reload } = useFetch(loader);
  const openCourses = data?.items.filter(course => course.availability === 'AVAILABLE').slice(0, 3) ?? [];
  return <>
    <section className="home-hero"><div><p className="eyebrow">HỌC TẬP TẠI PKS</p><h1>Phát triển kỹ năng<br />cho chặng đường mới.</h1><p>Khám phá các chương trình đào tạo thực tế đang nhận học viên.</p><Link className="hero-button" to="/courses">Xem tất cả khóa học →</Link></div><div className="hero-stat"><strong>{data?.total ?? '—'}</strong><span>khóa học đang hiển thị</span></div></section>
    <section className="home-courses"><div className="section-heading"><div><p className="eyebrow">ĐANG TUYỂN SINH</p><h2>Khóa học đang mở</h2></div><Link to="/courses">Xem tất cả →</Link></div>
      {error && <div className="notice error"><span>{error}</span><button onClick={reload}>Thử lại</button></div>}
      {loading ? <Loading label="Đang tải khóa học…" /> : openCourses.length ? <div className="course-grid">{openCourses.map(course => <CourseCard key={course.code} course={course} />)}</div> : <p className="course-state">Hiện chưa có khóa học còn chỗ.</p>}
    </section>
  </>;
}
