import { useCallback, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useFetch } from '../../hooks/useFetch';
import { courseService } from '../../services/course.service';

export default function CoursesPage() {
  const [query, setQuery] = useState(''); const [search, setSearch] = useState('');
  const loader = useCallback(() => courseService.list({ search: query || undefined, limit: 100 }), [query]);
  const { data, loading, error, reload } = useFetch(loader);
  function submit(event: FormEvent) { event.preventDefault(); setQuery(search.trim()); }
  return <section className="courses-page">
    <div className="client-heading"><div><p className="eyebrow">CHƯƠNG TRÌNH ĐÀO TẠO</p><h1>Khóa học dành cho bạn</h1><p>Khám phá các khóa học đang mở tại PKS.</p></div><form className="course-search" onSubmit={submit}><input aria-label="Tìm khóa học" value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm theo tên khóa học" /><button>Tìm kiếm</button></form></div>
    {error && <div className="notice error"><span>{error}</span><button onClick={reload}>Thử lại</button></div>}
    {loading ? <p className="course-state">Đang tải khóa học…</p> : !data?.items.length ? <p className="course-state">Không tìm thấy khóa học phù hợp.</p> : <div className="course-grid">{data.items.map(course => <article className="course-card" key={course.id}>
      <div className="course-cover"><span>{course.category}</span><b>{course.name.slice(0, 2).toUpperCase()}</b></div>
      <div className="course-card-body"><span className={`course-status ${course.availability === 'FULL' ? 'full' : ''}`}>{course.availability === 'FULL' ? 'Đã đủ chỗ' : 'Còn chỗ'}</span><h2>{course.name}</h2><p>{course.shortDescription}</p><dl><div><dt>Giảng viên</dt><dd>{course.instructor}</dd></div><div><dt>Học phí</dt><dd>{course.tuition.toLocaleString('vi-VN')} ₫</dd></div></dl><Link className="course-link" to={`/courses/${course.id}`}>Xem chi tiết →</Link></div>
    </article>)}</div>}
  </section>;
}
