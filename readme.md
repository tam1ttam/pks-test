# PKS Course & Enrollment Portal

Project gồm Client React trong `frontend/` (cổng 5173), Admin React trong `admin-frontend/` (cổng 5174), và NestJS + TypeORM + PostgreSQL trong `backend/` (cổng 3030). Hai frontend giữ phiên độc lập để Student và Admin có thể đăng nhập đồng thời.

## Yêu cầu

Node.js >= 22.12 và npm. Mỗi project cài dependency độc lập và có `node_modules`, `package-lock.json` riêng.

## Chạy frontend

Terminal thứ nhất:

```powershell
cd frontend
npm install
if (!(Test-Path .env)) { Copy-Item .env.example .env }
npm run dev
```

Truy cập http://localhost:5173. Client có trang chủ `/`, danh sách có bộ lọc `/courses`, chi tiết và ghi danh `/courses/:code`, cùng trang `/my-courses`. Client chỉ hiển thị khóa học đã được Admin xuất bản. `VITE_API_URL=http://localhost:3030/api` phải trỏ đúng backend. Backend cấp HttpOnly cookie; Zustand chỉ giữ hồ sơ người dùng trong bộ nhớ và tải lại trang sẽ xác minh phiên với API.

## Chạy Admin frontend

Terminal thứ hai:

```powershell
cd admin-frontend
npm install
if (!(Test-Path .env)) { Copy-Item .env.example .env }
npm run dev
```

Truy cập http://localhost:5174. Cổng này chỉ nhận tài khoản `ADMIN`, có quyền CRUD người dùng, khóa/mở khóa tài khoản, CRUD khóa học và quản lý ghi danh. Khi khóa tài khoản, backend thu hồi toàn bộ phiên và chặn đăng nhập mới. Permission phía giao diện điều khiển route/menu/action; backend dùng `PermissionsGuard` để kiểm tra JWT và permission cho từng endpoint.

## Chạy backend

Terminal thứ ba, bắt đầu từ thư mục gốc dự án:

```powershell
cd backend
npm install
if (!(Test-Path .env)) { Copy-Item .env.example .env }
```

Điền `.env` trước khi chạy. Local đang dùng PostgreSQL tại `localhost:5432`, database `pkstest`, user `postgres`; mật khẩu nằm trong `.env` đã bị Git ignore. Nếu cài máy mới, tạo database `pkstest` bằng công cụ PostgreSQL và điền `DB_PASSWORD` của máy đó. Dùng PostgreSQL 17 hoặc tương thích; backend không tự tạo database.

Tạo JWT secret bằng `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`, lưu vào `JWT_SECRET` (ít nhất 32 ký tự). Giữ `FRONTEND_URL=http://localhost:5173,http://localhost:5174` để CORS cho phép cả Client và Admin.

```powershell
npm run db:check
npm run db:migrate
npm run start:dev
```

Migration tạo `users`, `auth_sessions`, `courses`, `enrollments`; `synchronize` và tự chạy migration khi startup đều tắt. Migration đã chạy sẽ không chạy lại. Không sửa migration đã áp dụng, thêm migration mới khi đổi entity.

### Dữ liệu mẫu

Sau `npm run db:migrate`, chạy trong `backend/`:

```powershell
npm run db:seed
```

Lệnh thực thi `backend/migration.sql`. File SQL này **chỉ chèn dữ liệu mẫu**, schema do TypeORM migration quản lý; cũng có thể mở file và chạy toàn bộ trong SQL editor kết nối `pkstest`. Có transaction và ID cố định, chạy lại không nhân đôi ghi danh hoặc reset mật khẩu/thông tin demo đã sửa. Không dùng seed demo trên production.

| Email | Vai trò | Mật khẩu demo ban đầu |
| --- | --- | --- |
| `admin@pks.demo` | ADMIN | `PksDemo@123` |
| `student1@pks.demo` | STUDENT | `PksDemo@123` |
| `student2@pks.demo` | STUDENT | `PksDemo@123` |
| `student3@pks.demo` | STUDENT | `PksDemo@123` |

Seed có 3 khóa (React còn chỗ, MOS Excel đầy, NestJS ẩn) và 3 ghi danh (2 active, 1 cancelled). Mật khẩu lưu dạng bcrypt cost 10. Đây là thông tin công khai chỉ cho demo, không phải credential môi trường thật. Seed không xóa dữ liệu khác; nếu gặp email trùng với ID khác sẽ rollback. Nếu đã sửa/xóa dữ liệu demo qua API, trạng thái có thể khác lần seed đầu và mật khẩu không tự reset.

Backend chạy ở http://localhost:3030/api. `PORT` trong `.env` điều khiển cổng; `GET /api` giữ response mẫu `Hello World!`.

Nhấn `Ctrl+C` trong terminal tương ứng để dừng. Sau lần cài đầu, chỉ cần chạy lệnh khởi động trong từng thư mục. Trên clone có lockfile, dùng `npm ci` để cài đúng phiên bản đã khóa.

## Kiểm tra và build

Tại thư mục gốc:

```powershell
npm --prefix frontend run typecheck
npm --prefix frontend run build
npm --prefix admin-frontend run typecheck
npm --prefix admin-frontend run build
npm --prefix backend run typecheck
npm --prefix backend run build
npm --prefix backend run test:integration
```

Integration test dùng database được cấu hình trong `.env`, cần chạy migration trước. Test tự mở NestJS trên cổng ngẫu nhiên, tạo fixture UUID rồi dọn đúng dữ liệu test; không reset database và không cần seed demo. 14 nhóm kiểm tra gồm Auth/Profile, CRUD/phân quyền/validation, Google provider stub, ghi danh trùng, tranh suất cuối, đổi capacity đồng thời, cancel/delete đồng thời và rollback khi lỗi. Không cần bật backend trước. Dùng database local hoặc DB test riêng, không dùng production. Provider stub không thay thế kiểm thử Google trực tiếp bằng Client ID thật.

Xem bản build bằng `npm --prefix frontend run preview` hoặc `npm --prefix admin-frontend run preview`. Chạy backend đã build bằng `npm --prefix backend run start:prod`.

## Google Sign-In

Tạo OAuth Client ID loại **Web application** trên Google Cloud, cấu hình consent screen và thêm test user nếu ứng dụng ở chế độ Testing. Khai báo Authorized JavaScript origins là `http://localhost:5173` (thêm origin khác nếu dùng). Luồng này dùng Google Identity Services popup/ID token, không cần Client Secret hoặc route redirect callback.

Điền cùng một Client ID vào:

```dotenv
# backend/.env
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
# frontend/.env
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

Restart FE/BE sau khi đổi env. Khi chưa có Client ID, nút Google vẫn hiện nhưng sẽ thông báo cần cấu hình; backend xác minh chữ ký, audience, issuer/expiry qua google-auth-library và kiểm tra email đã xác minh. Backend nhận diện Google bằng `sub`. Email đã có tài khoản mật khẩu sẽ được yêu cầu đăng nhập bằng mật khẩu; không tự liên kết tài khoản theo email. Chưa có chức năng liên kết tài khoản.

Google SSO chưa thể kiểm thử thực tế khi chưa cung cấp Client ID. Hướng dẫn chính thức: [tạo Client ID](https://developers.google.com/identity/gsi/web/guides/get-google-api-clientid), [xác minh ID token](https://developers.google.com/identity/gsi/web/guides/verify-google-id-token).

## API hiện có

| Method | Endpoint | Quyền |
| --- | --- | --- |
| POST | `/api/auth/register` | Public: fullName, email, password |
| POST | `/api/auth/login` | Public: email, password |
| POST | `/api/auth/google` | Public: credential Google ID token |
| GET | `/api/auth/me` | HttpOnly session cookie |
| GET | `/api/users/me` | HttpOnly session cookie |
| PATCH | `/api/users/me` | HttpOnly session cookie, chỉ fullName |
| POST | `/api/auth/logout` | HttpOnly session cookie, trả 204 và thu hồi phiên hiện tại |

Email được chuẩn hóa chữ thường; đăng ký công khai chỉ tạo STUDENT. Mật khẩu tối thiểu 8 ký tự, tối đa 72 byte UTF-8, bcrypt cost 10. JWT mặc định 1 giờ; phiên được lưu trong DB và kiểm tra mỗi request. Email/role/mật khẩu không sửa qua API hồ sơ. Auth có rate limit theo IP (10 request/phút/endpoint); giới hạn chung 120 request/phút/endpoint, dùng bộ nhớ process cho môi trường local.

Collection Auth: `docs/pks-auth.postman_collection.json`; CRUD: `docs/pks-crud.postman_collection.json`. CRUD Collection dùng tài khoản demo để lấy token, tạo dữ liệu test rồi xóa ở bước cuối. Chạy sau migration/seed và bật backend. Không export token còn hiệu lực khi chia sẻ collection.

### CRUD User / Course / Enrollment

Mọi endpoint trong bảng có prefix `/api`. Body/query sai trả `400`; chưa xác thực `401`; sai role `403`; không tìm thấy `404`; trùng hoặc vi phạm nghiệp vụ `409`. DELETE thành công trả `204`.

| Method | Endpoint | Quyền / chức năng |
| --- | --- | --- |
| GET / POST | `/admin/users` | ADMIN: danh sách / tạo user |
| GET / PATCH / DELETE | `/admin/users/:code` | ADMIN: xem / sửa / xóa user |
| POST | `/admin/users/:code/reset-password` | ADMIN: tạo mật khẩu mới và gửi qua SMTP |
| DELETE | `/admin/users` | ADMIN: xóa nhiều user theo danh sách code |
| GET | `/courses` | Public: danh sách khóa đang hiển thị |
| GET | `/courses/:code` | Public: chi tiết khóa đang hiển thị |
| GET / POST | `/admin/courses` | ADMIN: danh sách cả khóa ẩn / tạo khóa |
| GET / PATCH / DELETE | `/admin/courses/:code` | ADMIN: chi tiết / sửa, ẩn / xóa khóa |
| POST | `/enrollments` | Student ghi danh mình; ADMIN chọn studentCode |
| GET | `/enrollments` | ADMIN xem mọi ghi danh |
| GET | `/enrollments/me` | Chỉ ghi danh thuộc user trong JWT |
| GET / PATCH | `/enrollments/:code` | Chủ ghi danh hoặc ADMIN: xem / đổi trạng thái |
| DELETE | `/enrollments/:code` | ADMIN: xóa ghi danh, cập nhật count |
| GET | `/admin/courses/:code/enrollments` | ADMIN: danh sách học viên của khóa |

Danh sách trả `{ items, total, page, limit }`; mặc định page 1, limit 20, tối đa 100. User lọc `search` (họ tên/email), `role`. Course lọc `search` (tên), `category`; Admin thêm `isPublished=true/false`, Public luôn chỉ trả khóa hiển thị. Enrollment lọc `courseCode`, `studentCode`, `status`, `search` (khóa/họ tên/email). `/enrollments/me` luôn áp dụng user ID từ token dù gửi studentCode khác.

Ví dụ body tạo khóa:

```json
{
  "name": "React thực chiến",
  "category": "Web Development",
  "instructor": "Nguyễn Hải",
  "shortDescription": "Làm ứng dụng React với TypeScript",
  "description": "Component, hooks, routing và REST API",
  "tuition": 2500000,
  "capacity": 20,
  "isPublished": true
}
```

Tạo User: `{ "fullName": "Student", "email": "student@example.com", "password": "Demo-password-123", "role": "STUDENT", "isActive": true }`; role mặc định Student và trạng thái mặc định hoạt động. PATCH chỉ nhận `fullName`, `email`, `role`, `isActive` và không nhận mật khẩu. Gửi `{ "isActive": false }` để khóa và thu hồi toàn bộ phiên; tài khoản khóa không thể đăng nhập hoặc tiếp tục gọi API. Admin không thể tự khóa, tự xóa hoặc tự đổi role. Không đổi role hoặc xóa user đã có Enrollment. Email Google không đổi qua API quản trị. Không trả passwordHash/googleId.

Tạo Enrollment: `{ "courseCode": "uuid" }` cho Student; Admin thêm `studentCode`. Chỉ Student được ghi danh. PATCH chỉ nhận `{ "status": "ENROLLED" }` hoặc `{ "status": "CANCELLED" }`; không đổi studentCode/courseCode. Một cặp student-course chỉ có một bản ghi; ghi danh đã hủy phải kích hoạt lại bằng PATCH.

`enrolledCount` chỉ đếm `ENROLLED`. API tạo/đổi trạng thái/xóa dùng transaction và khóa User → Course → Enrollment theo cùng thứ tự. Kích hoạt lại kiểm tra chỗ và khóa hiển thị; gọi PATCH cùng trạng thái không cộng/trừ count lần nữa. Khóa đầy/bị ẩn không nhận ghi danh mới. Hủy vẫn được phép khi khóa bị ẩn. Không cho client ghi enrolledCount. Giảm capacity phải >= count hiện tại và khóa Course cùng transaction. FK + unique + check constraint bảo vệ thêm ở database.

Course có lịch sử Enrollment (kể cả CANCELLED) không được xóa; dùng PATCH `isPublished=false`. User có lịch sử Enrollment cũng bị chặn xóa. DELETE Enrollment là thao tác quản trị xóa vĩnh viễn theo yêu cầu CRUD; nếu cần giữ lịch sử, dùng CANCELLED. Không cập nhật Enrollment trực tiếp bằng SQL ngoài seed vì sẽ bỏ qua logic đồng bộ count của service.

Timestamp lưu UTC; response Enrollment có `enrolledAt` ISO và `enrolledDate` dạng `YYYY-MM-DD` theo `Asia/Ho_Chi_Minh`. ERD tại `docs/erd.mmd`. Client có luồng ghi danh và “Khóa học của tôi”; Admin có CRUD và xem danh sách học viên theo từng khóa.

## Cấu trúc

Backend: `src/common/`, `config/`, `database/entities/`, `database/migrations/`, `database/seeds/`, `modules/auth/{dto,strategies}`, `modules/users/dto/`. Entity gom tại database để tránh khai báo trùng. JWT strategy đọc token từ HttpOnly cookie theo từng portal; login mật khẩu xử lý trong AuthService nên không tạo local.strategy không sử dụng.

Frontend: `src/components/{common,ui}`, `hooks/`, `layouts/`, `pages/home/components/`, `pages/auth/components/`, `routes/`, `services/`, `store/`, `styles/`, `types/`, `assets/`, `constants/`, `utils/`. Các thư mục chưa dùng giữ trống local, không tạo `.gitkeep`.
