# PKS Course Enrollment Portal

Hệ thống quản lý khóa học và ghi danh gồm cổng học viên, cổng quản trị và REST API. Dự án dùng mã `code` công khai trên URL/DTO; khóa `id` nội bộ không được đưa ra frontend.

## Chức năng

**Học viên:** đăng ký/đăng nhập bằng HttpOnly cookie; tìm kiếm, lọc và xem chi tiết khóa học; ghi danh; theo dõi khóa học của mình; gửi yêu cầu hủy và ghi danh lại sau thời gian chờ; cập nhật hồ sơ và ảnh đại diện.

**Quản trị viên:** dashboard và biểu đồ; quản lý, lọc, khóa/mở khóa, xóa đơn/xóa nhiều người dùng; đặt lại mật khẩu qua email; CRUD khóa học; tải ảnh; xem học viên và duyệt yêu cầu hủy ghi danh.

**Backend:** DTO validation toàn cục, CORS allowlist, rate limit, exception filter, bcrypt salt rounds 10, Role/Permission guard, transaction và khóa bản ghi để chống race condition khi tranh suất học cuối.

## Kiến trúc

| Thành phần | Công nghệ | URL mặc định |
| --- | --- | --- |
| Client | React 19, TypeScript, Vite, Zustand, Axios | `http://localhost:5173` |
| Admin | React 19, TypeScript, Vite, Zustand, Axios | `http://localhost:5174` |
| API | NestJS 11, TypeORM, PostgreSQL | `http://localhost:3030/api` |
| Tài liệu local | `serve` | `http://localhost:3003` |

```text
.
├── frontend/          # Cổng học viên
├── admin-frontend/    # Cổng quản trị
├── backend/           # API, migration, seed và integration test
├── docs/              # ERD, Postman và ảnh minh chứng
├── readme.md
└── package.json       # Script điều phối, không dùng npm workspace
```

## Cài đặt

Yêu cầu Node.js 20+, npm và PostgreSQL 15+. Mỗi ứng dụng quản lý dependency riêng, không cần `node_modules` ở root.

```powershell
npm --prefix backend install
npm --prefix frontend install
npm --prefix admin-frontend install

Copy-Item backend/.env.example backend/.env
Copy-Item frontend/.env.example frontend/.env
Copy-Item admin-frontend/.env.example admin-frontend/.env
```

Cấu hình tối thiểu trong `backend/.env`:

```dotenv
PORT=3030
FRONTEND_URL=http://localhost:5173,http://localhost:5174
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your-local-password
DB_DATABASE=pkstest
JWT_SECRET=replace-with-a-random-secret-at-least-32-characters
JWT_TTL_SECONDS=3600
```

Tạo database `pkstest`, sau đó khởi tạo schema và dữ liệu demo:

```powershell
npm --prefix backend run db:check
npm --prefix backend run db:migrate
npm --prefix backend run db:seed
```

`backend/migration.sql` là script schema/seed được chủ động giữ trong Git. Các file export như `test.sql`, `*.dump` và `*.backup` là bản sao local, đã được `.gitignore` loại khỏi source.

## Chạy dự án

Mở ba terminal:

```powershell
npm run dev:backend
npm run dev:frontend
npm run dev:admin
```

Tài khoản sau khi seed:

| Vai trò | Email | Mật khẩu |
| --- | --- | --- |
| Admin | `admin@pks.demo` | `PksDemo@123` |
| Student | `student1@pks.demo` | `PksDemo@123` |
| Student | `student2@pks.demo` | `PksDemo@123` |

Client và Admin dùng hai cookie riêng (`pks_client_session`, `pks_admin_session`), nên có thể đăng nhập đồng thời. Request Admin gửi thêm header `X-PKS-Portal: admin`. JWT không được lưu trong localStorage.

Cloudinary cần ba biến `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`. Đặt lại mật khẩu qua email cần cấu hình `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM`.

## Route giao diện

| Ứng dụng | Route | Nội dung |
| --- | --- | --- |
| Client | `/login`, `/register` | Xác thực học viên |
| Client | `/` | Trang chủ, thống kê và khóa học đang mở |
| Client | `/courses`, `/courses/:code` | Danh sách/bộ lọc và chi tiết khóa học |
| Client | `/my-courses` | Các khóa học của học viên |
| Admin | `/login` | Đăng nhập quản trị |
| Admin | `/` | Dashboard và biểu đồ |
| Admin | `/users` | Quản lý người dùng |
| Admin | `/courses` | Quản lý khóa học |
| Admin | `/enrollments` | Quản lý ghi danh |

## API chính

Base URL: `http://localhost:3030/api`.

| Nhóm | Endpoint |
| --- | --- |
| Public | `GET /`, `GET /categories`, `GET /courses`, `GET /courses/:code` |
| Auth | `POST /auth/register`, `POST /auth/login`, `GET /auth/me`, `POST /auth/logout` |
| Hồ sơ | `GET /users/me`, `PATCH /users/me`, `POST /uploads/image` |
| Ghi danh | `POST /enrollments`, `GET /enrollments/me`, `GET /enrollments/:code`, `POST /enrollments/:code/cancel-request`, `POST /enrollments/:code/reenroll` |
| Admin users | `GET/POST /admin/users`, `GET/PATCH/DELETE /admin/users/:code`, `DELETE /admin/users`, `POST /admin/users/:code/reset-password` |
| Admin courses | `GET/POST /admin/courses`, `GET/PATCH/DELETE /admin/courses/:code`, `GET /admin/courses/:code/enrollments` |
| Admin enrollments | `GET /enrollments`, `PATCH/DELETE /enrollments/:code` |

Chi tiết request, response và các trường hợp lỗi nằm trong [Postman Collection](docs/postman.json).

## Kiểm thử

```powershell
npm run typecheck
npm run build
npm run test:integration
```

Bộ integration test dùng **Supertest** khởi tạo ứng dụng NestJS thật và kết nối PostgreSQL test. Test bao phủ Auth/cookie, RBAC, User/Course/Enrollment CRUD, danh mục, validation upload, trùng email, sức chứa, rollback transaction, tranh suất cuối, hủy và ghi danh lại. Dữ liệu test có marker ngẫu nhiên và được dọn sau khi chạy. Không chạy bộ integration test trên database production.

## Postman và minh chứng

1. Import `docs/postman.json` vào Postman.
2. Chạy migration, seed và Backend.
3. Mở Collection Runner, chạy đúng thứ tự từ `00` đến `99`.
4. Thư mục `99 - Cleanup` xóa dữ liệu test.
5. Chụp request/response của luồng thành công và lỗi vào `docs/screenshots/`.

Collection gồm 35 request: xác thực, hai cookie Student/Admin, lỗi RBAC 403, User CRUD, Course CRUD, ghi danh, hết chỗ, yêu cầu hủy, thời gian chờ ghi danh lại, upload validation và cleanup.

## Tài liệu

- ERD: `docs/erd.mmd`
- Postman: `docs/postman.json`
- Hướng dẫn docs: `docs/readme.md`
- Minh chứng: `docs/screenshots/`

Xem Markdown local:

```powershell
npx serve -l 3003
```

Mở `http://localhost:3003`. File secret, dependency, build output và database dump đều được loại khỏi Git.

## Deploy VPS

Cấu hình Docker Compose tối giản cho đường dẫn `https://cellvany.id.vn/enrol/pks-test/` nằm trong [deploy/readme.md](deploy/readme.md). Cấu hình dùng PostgreSQL sẵn có trên VPS và chỉ publish web gateway tại `127.0.0.1:13030` để Nginx của máy chủ reverse proxy vào.
