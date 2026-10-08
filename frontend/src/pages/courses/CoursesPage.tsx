import { useCallback, useMemo, useState } from 'react';
import { useFetch } from '../../hooks/useFetch';
import { courseService } from '../../services/course.service';
import CourseCard from './components/CourseCard';
import Loading from '../../components/common/Loading';

export default function CoursesPage() {
  const [search, setSearch] = useState(''); const [category, setCategory] = useState(''); const [availability, setAvailability] = useState('');
  const loader = useCallback(async () => { const [page, categories] = await Promise.all([courseService.list({ limit: 100 }), courseService.categories()]); return { page, categories }; }, []);
  const { data, loading, error, reload } = useFetch(loader);
  const courses = useMemo(() => data?.page.items.filter(course => {
    const keyword = search.trim().toLocaleLowerCase('vi');
    const matchesSearch = !keyword || `${course.name} ${course.instructor} ${course.shortDescription}`.toLocaleLowerCase('vi').includes(keyword);
    return matchesSearch && (!category || course.categoryCode === category) && (!availability || course.availability === availability);
  }) ?? [], [data, search, category, availability]);
  const clearFilters = () => { setSearch(''); setCategory(''); setAvailability(''); };
  return <section className="courses-page">
    <div className="client-heading"><div><p className="eyebrow">CHƯƠNG TRÌNH ĐÀO TẠO</p><h1>Tất cả khóa học</h1><p>Tìm chương trình phù hợp theo tên, danh mục và tình trạng chỗ.</p></div></div>
    <div className="course-filter-panel"><div className="course-filter-search"><span>⌕</span><input aria-label="Tìm khóa học" value={search} onChange={event => setSearch(event.target.value)} placeholder="Tìm tên khóa học, giảng viên…" /></div><select aria-label="Lọc danh mục" value={category} onChange={event => setCategory(event.target.value)}><option value="">Tất cả danh mục</option>{data?.categories.map(item => <option key={item.code} value={item.code}>{item.name}</option>)}</select><select aria-label="Lọc tình trạng" value={availability} onChange={event => setAvailability(event.target.value)}><option value="">Tất cả tình trạng</option><option value="AVAILABLE">Đang mở</option><option value="FULL">Đã đủ chỗ</option></select><button type="button" onClick={clearFilters}>Xóa lọc</button></div>
    <div className="course-results"><span>{courses.length} khóa học</span>{(search || category || availability) && <small>Đang áp dụng bộ lọc</small>}</div>
    {error && <div className="notice error"><span>{error}</span><button onClick={reload}>Thử lại</button></div>}
    {loading ? <Loading label="Đang tải khóa học…" /> : courses.length ? <div className="course-grid">{courses.map(course => <CourseCard key={course.code} course={course} />)}</div> : <p className="course-state">Không tìm thấy khóa học phù hợp.</p>}
  </section>;
}
