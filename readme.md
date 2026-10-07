# PKS Course & Enrollment Portal

Base React + TypeScript + Vite trong `frontend/` và Node.js + NestJS trong `backend/`. Hiện chưa triển khai nghiệp vụ hoặc database.

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

Truy cập http://localhost:5173. Biến `VITE_API_URL` trong template dành cho tích hợp API sau này.

## Chạy backend

Terminal thứ hai, bắt đầu từ thư mục gốc dự án:

```powershell
cd backend
npm install
if (!(Test-Path .env)) { Copy-Item .env.example .env }
npm run start:dev
```

Truy cập http://localhost:3000; endpoint mặc định trả `Hello World!`. Cổng được cấu hình bằng `PORT` trong `.env`.

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

Integration test tự khởi động NestJS trên cổng ngẫu nhiên, kiểm tra HTTP 200/404 và in kết quả console; không cần bật backend trước.

Xem bản build frontend bằng `npm --prefix frontend run preview`. Chạy backend đã build bằng `npm --prefix backend run start:prod`.

## Database và tài khoản demo

Base hiện chưa cần database. Chưa có schema, migration, seed hoặc tài khoản demo; hướng dẫn cấu hình và tài khoản Student/Admin sẽ được bổ sung khi các chức năng này được triển khai.
