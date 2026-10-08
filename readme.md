# PKS Course & Enrollment Portal

React + TypeScript + Vite trong `frontend/`, NestJS + TypeORM + PostgreSQL trong `backend/`. Đã có đăng ký, đăng nhập bằng mật khẩu, tích hợp Google Sign-In, xem/sửa họ tên và đăng xuất. Trang chủ chỉ có ô tài khoản; chưa triển khai khóa học/ghi danh.

## Yêu cầu

Node.js >= 22.12 và npm. Mở terminal tại thư mục chứa `frontend/` và `backend/`. Hai project cài dependency độc lập, mỗi bên có `node_modules` và `package-lock.json` riêng.

## Chạy frontend

Terminal thứ nhất:

```powershell
cd frontend
npm install
if (!(Test-Path .env)) { Copy-Item .env.example .env }
npm run dev
```

Truy cập http://localhost:5173. `VITE_API_URL=http://localhost:3000/api` phải trỏ đúng backend. FE dùng Axios, Zustand và sessionStorage cho phiên đăng nhập trong cùng tab; tải lại trang sẽ xác minh phiên với API.

## Chạy backend

Terminal thứ hai, bắt đầu từ thư mục gốc dự án:

```powershell
cd backend
npm install
if (!(Test-Path .env)) { Copy-Item .env.example .env }
```

Điền `.env` trước khi chạy. Local đang dùng PostgreSQL tại `localhost:5432`, database `pkstest`, user `postgres`; mật khẩu nằm trong `.env` đã bị Git ignore. Nếu cài máy mới, tạo database `pkstest` bằng công cụ PostgreSQL và điền `DB_PASSWORD` của máy đó. Dùng PostgreSQL 17 hoặc tương thích; backend không tự tạo database.

Tạo JWT secret bằng `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`, lưu vào `JWT_SECRET` (ít nhất 32 ký tự). Giữ `FRONTEND_URL=http://localhost:5173` khi chạy Vite mặc định.

```powershell
npm run db:check
npm run db:migrate
npm run start:dev
```

Migration tạo `users` và `auth_sessions`; `synchronize` và tự chạy migration khi startup đều tắt để tránh thay schema ngoài ý muốn. Migration đã chạy sẽ không chạy lại. Không sửa migration đã áp dụng, thêm migration mới khi đổi entity.

Backend chạy ở http://localhost:3000/api. `PORT` trong `.env` điều khiển cổng; `GET /api` giữ response mẫu `Hello World!`.

Nhấn `Ctrl+C` trong terminal tương ứng để dừng. Sau lần cài đầu, chỉ cần chạy lệnh khởi động trong từng thư mục. Trên clone có lockfile, dùng `npm ci` để cài đúng phiên bản đã khóa.

## Kiểm tra và build

Tại thư mục gốc:

```powershell
npm --prefix frontend run typecheck
npm --prefix frontend run build
npm --prefix backend run typecheck
npm --prefix backend run build
npm --prefix backend run test:integration
```

Integration test dùng database được cấu hình trong `.env`, cần chạy migration trước. Test tự mở NestJS trên cổng ngẫu nhiên, tạo tài khoản với email UUID rồi dọn đúng những tài khoản đó; không reset database. Các nhóm kiểm tra: đăng ký + bcrypt lưu DB, validation/email trùng/nâng role, login/token hết hạn, sửa hồ sơ/quyền sở hữu, Google với provider stub, logout thu hồi phiên. Không cần bật backend trước. Nên dùng database local hoặc DB test riêng, không dùng production. Provider stub không thay thế kiểm thử Google trực tiếp bằng Client ID thật.

Xem bản build frontend bằng `npm --prefix frontend run preview`. Chạy backend đã build bằng `npm --prefix backend run start:prod`.

## Google Sign-In

Tạo OAuth Client ID loại **Web application** trên Google Cloud, cấu hình consent screen và thêm test user nếu ứng dụng ở chế độ Testing. Khai báo Authorized JavaScript origins là `http://localhost:5173` (thêm origin khác nếu dùng). Luồng này dùng Google Identity Services popup/ID token, không cần Client Secret hoặc route redirect callback.

Điền cùng một Client ID vào:

```dotenv
# backend/.env
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
# frontend/.env
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

Restart FE/BE sau khi đổi env. Nút Google chỉ hiện khi FE có Client ID; backend xác minh chữ ký, audience, issuer/expiry qua google-auth-library và kiểm tra email đã xác minh. Backend nhận diện Google bằng `sub`. Email đã có tài khoản mật khẩu sẽ được yêu cầu đăng nhập bằng mật khẩu; không tự liên kết tài khoản theo email. Chưa có chức năng liên kết tài khoản.

Google SSO chưa thể kiểm thử thực tế khi chưa cung cấp Client ID. Hướng dẫn chính thức: [tạo Client ID](https://developers.google.com/identity/gsi/web/guides/get-google-api-clientid), [xác minh ID token](https://developers.google.com/identity/gsi/web/guides/verify-google-id-token).

## API hiện có

| Method | Endpoint | Quyền |
| --- | --- | --- |
| POST | `/api/auth/register` | Public: fullName, email, password |
| POST | `/api/auth/login` | Public: email, password |
| POST | `/api/auth/google` | Public: credential Google ID token |
| GET | `/api/auth/me` | Bearer JWT |
| GET | `/api/users/me` | Bearer JWT |
| PATCH | `/api/users/me` | Bearer JWT, chỉ fullName |
| POST | `/api/auth/logout` | Bearer JWT, trả 204 và thu hồi phiên hiện tại |

Email được chuẩn hóa chữ thường; đăng ký công khai chỉ tạo STUDENT. Mật khẩu tối thiểu 8 ký tự, tối đa 72 byte UTF-8, bcrypt cost 10. JWT mặc định 1 giờ; phiên được lưu trong DB và kiểm tra mỗi request. Email/role/mật khẩu không sửa qua API hồ sơ. Auth có rate limit theo IP (10 request/phút/endpoint); giới hạn chung 120 request/phút/endpoint, dùng bộ nhớ process cho môi trường local.

Collection hiện tại: `docs/pks-auth.postman_collection.json`. Tài khoản demo chưa seed; có thể tự đăng ký Student trên UI. Guards role đã chuẩn bị, chưa có chức năng quản trị/khóa học. Không đưa secret hoặc token thật vào collection/ảnh test.

## Cấu trúc

Backend: `src/common/`, `config/`, `database/entities/`, `database/migrations/`, `database/seeds/`, `modules/auth/{dto,strategies}`, `modules/users/dto/`. Entity gom tại database để tránh khai báo trùng. JWT strategy xử lý Bearer; login mật khẩu xử lý trong AuthService nên không tạo local.strategy không sử dụng.

Frontend: `src/components/{common,ui}`, `hooks/`, `layouts/`, `pages/home/components/`, `pages/auth/components/`, `routes/`, `services/`, `store/`, `styles/`, `types/`, `assets/`, `constants/`, `utils/`. Các thư mục chưa dùng giữ trống local, không tạo `.gitkeep`.
