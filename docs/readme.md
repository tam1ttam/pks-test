# Tài liệu kiểm thử và bài nộp

Đã có API tài khoản và hồ sơ, kết nối PostgreSQL thật, migration và integration test console. Collection tài khoản nằm ở `pks-auth.postman_collection.json`; import vào Postman, điền biến password và email test của bạn rồi chạy Register → Login → Me → Update → Logout. Login tự lưu accessToken vào collection variable; xóa token trước khi export/chia sẻ. Google request chỉ chạy khi có Client ID và Google ID token thật. Các API khóa học/ghi danh chưa được triển khai; collection này chưa phải bộ bài nộp đầy đủ. Chưa có ảnh kiểm thử Postman hoặc ERD toàn bộ bài.

## Những file cần bổ sung theo tiến độ

| Artifact | Vị trí đề xuất | Thời điểm |
| --- | --- | --- |
| ERD | `docs/erd.svg` hoặc `docs/erd.png` | Sau task database |
| Collection export từ Postman | `docs/pks.postman_collection.json` | Cập nhật trong từng task API |
| Environment mẫu không chứa secret | `docs/local.postman_environment.json` | Khi bắt đầu Postman |
| Ảnh request và response | `docs/screenshots/` | Sau khi chạy mỗi luồng thực tế |

## Ma trận kiểm thử tối thiểu khi có nghiệp vụ

| Nhóm | Thành công | Lỗi quan trọng |
| --- | --- | --- |
| Register | Tạo Student | Email trùng, dữ liệu thiếu/sai, không nâng role qua request |
| Login | Cấp JWT có hạn | Sai mật khẩu, token hết hạn |
| Courses | List/detail, tạo/sửa/ẩn hoặc xóa | 400 validation, 401 không token, 403 Student, 404 không tồn tại |
| Capacity | Sửa capacity hợp lệ | Giảm thấp hơn số đã ghi danh |
| Enrollment | Tạo ghi danh, My Courses | Trùng, hết chỗ, chỉ đọc dữ liệu của mình |
| Admin enrollment list | Đúng khóa, đủ trường | 401/403/404 |
| Đồng thời | Chỉ một người lấy được suất cuối | Count không vượt capacity, rollback nhất quán |

Ảnh phải thể hiện method, URL, body cần thiết và response/status. Không chụp secret thật hoặc token còn dùng trong môi trường khác. Console log của integration test là hỗ trợ, không thay thế ảnh Postman bắt buộc. Test đồng thời nên tự động hóa; các request gửi tuần tự trong Postman chưa chứng minh được chống race condition.

Chạy `npm run test:integration` từ root ứng dụng sau khi cấu hình DB và chạy migration trong backend. Test đã bao phủ register/login/profile/logout, quyền sửa hồ sơ và Google bằng provider stub. Các ca khóa học/ghi danh ở bảng trên còn phải triển khai.
