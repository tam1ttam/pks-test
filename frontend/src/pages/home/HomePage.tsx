import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useFetch } from '../../hooks/useFetch';
import { courseService } from '../../services/course.service';
import CourseCard from '../courses/components/CourseCard';
import Loading from '../../components/common/Loading';

export default function HomePage() {
  const loader = useCallback(() => courseService.list({ limit: 100 }), []);
  const { data, loading, error, reload } = useFetch(loader);
  const [statIndex, setStatIndex] = useState(0);
  const availableCourses = useMemo(() => data?.items.filter(course => course.availability === 'AVAILABLE') ?? [], [data]);
  const openCourses = availableCourses.slice(0, 3);
  const stats = [
    { value: data?.total ?? '—', label: 'Tổng số khóa học' },
    { value: availableCourses.length, label: 'Khóa học đang mở' },
  ];

  useEffect(() => {
    const timer = window.setInterval(() => setStatIndex(current => (current + 1) % stats.length), 4000);
    return () => window.clearInterval(timer);
  }, [stats.length]);

  const moveStat = (step: number) => setStatIndex(current => (current + step + stats.length) % stats.length);

  return <>
    <section className="home-hero">
      <div><p className="eyebrow">HỌC TẬP TẠI PKS</p><h1>Phát triển kỹ năng<br />cho chặng đường mới.</h1><p>Khám phá các chương trình đào tạo thực tế đang nhận học viên.</p><Link className="hero-button" to="/courses">Xem tất cả khóa học →</Link></div>
      <div className="hero-stat-slider" aria-label="Thống kê khóa học">
        <button type="button" className="stat-arrow previous" onClick={() => moveStat(-1)} aria-label="Thống kê trước">‹</button>
        <div className="hero-stat" key={statIndex} aria-live="polite"><strong>{stats[statIndex].value}</strong><span>{stats[statIndex].label}</span></div>
        <button type="button" className="stat-arrow next" onClick={() => moveStat(1)} aria-label="Thống kê tiếp theo">›</button>
        <div className="stat-dots" role="tablist" aria-label="Chọn thống kê">{stats.map((stat, index) => <button key={stat.label} type="button" className={index === statIndex ? 'active' : ''} onClick={() => setStatIndex(index)} aria-label={stat.label} aria-selected={index === statIndex} role="tab" />)}</div>
      </div>
    </section>
    <section className="home-courses"><div className="section-heading"><div><p className="eyebrow">ĐANG TUYỂN SINH</p><h2>Khóa học đang mở</h2></div><Link to="/courses">Xem tất cả →</Link></div>
      {error && <div className="notice error"><span>{error}</span><button onClick={reload}>Thử lại</button></div>}
      {loading ? <Loading label="Đang tải khóa học" /> : openCourses.length ? <div className="course-grid">{openCourses.map(course => <CourseCard key={course.code} course={course} />)}</div> : <p className="course-state">Hiện chưa có khóa học còn chỗ.</p>}
    </section>
  </>;
}
