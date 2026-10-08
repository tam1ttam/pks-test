import { Link } from 'react-router-dom';

const productionLinks = [
  ['Client', 'https://cellvany.id.vn/enrol/pks-test/'],
  ['Admin', 'https://cellvany.id.vn/enrol/pks-test/admin/'],
  ['API', 'https://cellvany.id.vn/enrol/pks-test/api/'],
];

export default function AboutPage() {
  return <div className="readme-page">
    <header className="readme-header">
      <Link to="/" className="brand"><span className="brand-mark">pks</span><span>EDUCATION</span></Link>
      <nav><Link to="/">Trang chủ</Link><Link to="/courses">Khóa học</Link></nav>
    </header>
    <main className="readme-content">
      <section className="readme-hero">
        <p className="eyebrow">PROJECT README</p>
        <h1>PKS Course Enrollment Portal</h1>
        <p>Hệ thống quản lý khóa học và ghi danh gồm cổng học viên, cổng quản trị và REST API.</p>
        <div className="readme-actions"><a href="https://github.com/tam1ttam/pks-test" target="_blank" rel="noreferrer">Xem mã nguồn GitHub ↗</a><Link to="/courses">Khám phá khóa học →</Link></div>
      </section>
      <section className="readme-section">
        <h2>Demo trực tuyến</h2>
        <div className="readme-link-grid">{productionLinks.map(([label, url]) => <a key={label} href={url}><strong>{label}</strong><span>{url}</span></a>)}</div>
      </section>
      <section className="readme-section">
        <h2>Tài khoản demo</h2>
        <div className="demo-accounts">
          <article><span>ADMIN</span><strong>admin@pks.demo</strong><code>PksDemo@123</code></article>
          <article><span>STUDENT</span><strong>student1@pks.demo</strong><code>PksDemo@123</code></article>
          <article><span>STUDENT</span><strong>student2@pks.demo</strong><code>PksDemo@123</code></article>
        </div>
        <p className="readme-note">Client và Admin dùng cookie đăng nhập riêng nên có thể đăng nhập đồng thời trên cùng trình duyệt.</p>
      </section>
      <section className="readme-section readme-columns">
        <div><h2>Học viên</h2><ul><li>Đăng ký, đăng nhập bằng HttpOnly cookie</li><li>Tìm kiếm, lọc và xem khóa học</li><li>Ghi danh và theo dõi khóa học</li><li>Yêu cầu hủy và ghi danh lại</li><li>Cập nhật hồ sơ và ảnh đại diện</li></ul></div>
        <div><h2>Quản trị viên</h2><ul><li>Dashboard và biểu đồ thống kê</li><li>Quản lý, khóa và xóa người dùng</li><li>CRUD khóa học và danh mục</li><li>Duyệt yêu cầu hủy ghi danh</li><li>Upload ảnh và đặt lại mật khẩu</li></ul></div>
      </section>
      <section className="readme-section"><h2>Công nghệ</h2><div className="tech-list"><span>React 19</span><span>TypeScript</span><span>Vite</span><span>NestJS 11</span><span>TypeORM</span><span>PostgreSQL</span><span>Docker</span><span>Nginx</span></div></section>
      <section className="readme-section">
        <h2>Chạy dự án local</h2>
        <div className="command-grid">
          <article><strong>Client · :5173</strong><pre><code>cd frontend{`\n`}npm install{`\n`}npm run dev</code></pre></article>
          <article><strong>Admin · :5174</strong><pre><code>cd admin-frontend{`\n`}npm install{`\n`}npm run dev</code></pre></article>
          <article><strong>Backend · :3030</strong><pre><code>cd backend{`\n`}npm install{`\n`}npm run db:migrate{`\n`}npm run db:seed{`\n`}npm run start:dev</code></pre></article>
        </div>
      </section>
    </main>
  </div>;
}
