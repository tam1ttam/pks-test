# Tài liệu kiểm thử và bài nộp

Đã có Auth/Profile và CRUD User/Course/Enrollment với PostgreSQL thật. Collection tài khoản nằm ở `pks-auth.postman_collection.json`; collection CRUD tại `pks-crud.postman_collection.json`. ERD ở `erd.mmd` (Mermaid). Chưa có ảnh kiểm thử Postman; cần chạy Postman thật và chụp request/response khi hoàn thiện bài nộp.

Với CRUD Collection: chạy `npm run db:migrate`, `npm run db:seed` trong backend, bật backend rồi chạy collection theo thứ tự. Collection dùng tài khoản demo local, tự giữ token/ID; tạo User/Course/Enrollment test và xóa ở nhóm cuối. Nếu dừng giữa chừng, có thể còn dữ liệu Postman test; không chạy đồng thời hai lượt cùng collection variables. Google chỉ nằm trong Auth Collection và cần token Google thật. Xóa token khỏi variables trước khi export/chia sẻ.

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

Chạy `npm run test:integration` từ root ứng dụng sau khi cấu hình DB và chạy migration. 14 nhóm test đã bao phủ Auth/Profile, User/Course/Enrollment CRUD, phân quyền, validation, ngày Việt Nam, duplicate enrollment, capacity concurrency, rollback và cancel/delete đồng thời. Test tự dọn fixture, không xóa/reset toàn database. Google dùng provider stub, không phải kiểm thử OAuth trực tiếp.
