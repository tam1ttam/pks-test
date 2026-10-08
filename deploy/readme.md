# Deploy tối giản lên VPS

Đích triển khai:

- Client: `https://cellvany.id.vn/enrol/pks-test/`
- Admin: `https://cellvany.id.vn/enrol/pks-test/admin/`
- API: `https://cellvany.id.vn/enrol/pks-test/api/`

Stack PKS độc lập gồm Web Nginx, NestJS và PostgreSQL. Database dùng image `pgvector/pgvector:pg16` đã có trên VPS nhưng chạy bằng container và volume riêng, không dùng hoặc sửa dữ liệu PC Store. Chỉ gateway `127.0.0.1:13030` được publish ra host.

## 1. Đưa source lên VPS

Sau khi push branch cần deploy lên GitHub:

```bash
ssh -i "$env:USERPROFILE\.ssh\pcstore_vps" deploy@163.61.183.137
```

Trên VPS:

```bash
cd ~/pks-test
git clone https://github.com/tam1ttam/pks-test.git .
cp deploy/.env.production.example deploy/.env.production
nano deploy/.env.production
```

Nếu repository đã có source:

```bash
cd ~/pks-test
git pull --ff-only
```

Trong `deploy/.env.production`, đổi cả `DB_PASSWORD` và `POSTGRES_PASSWORD` thành cùng một mật khẩu mạnh. Đổi `JWT_SECRET` thành chuỗi ngẫu nhiên:

```bash
openssl rand -hex 32
```

Không commit file `deploy/.env.production`.

## 2. Build và chạy

```bash
cd ~/pks-test
docker compose -f compose.prod.yml config --quiet
docker compose -f compose.prod.yml up -d --build
docker compose -f compose.prod.yml ps
docker compose -f compose.prod.yml logs --tail=100 backend
```

Backend tự chạy TypeORM migration trước khi khởi động. Nạp tài khoản và dữ liệu demo một lần:

```bash
set -a
source deploy/.env.production
set +a
docker compose -f compose.prod.yml exec -T db \
  psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" < backend/migration.sql
```

Kiểm tra nội bộ:

```bash
curl -i http://127.0.0.1:13030/enrol/pks-test/api/
curl -I http://127.0.0.1:13030/enrol/pks-test/
curl -I http://127.0.0.1:13030/enrol/pks-test/admin/
```

## 3. Nối vào Nginx đang phục vụ domain

Mở cấu hình hiện tại:

```bash
sudo nano /etc/nginx/sites-available/cellvany
```

Sao chép nội dung `deploy/host-nginx-location.conf` vào bên trong `server` HTTPS của `cellvany.id.vn`, đặt **trước** `location /` đang proxy PC Store. `proxy_pass` không có dấu `/` cuối để giữ nguyên `/enrol/pks-test/...`.

```bash
sudo nginx -t
sudo systemctl reload nginx
```

Sau đó mở ba URL ở đầu tài liệu.

## 4. Vận hành

```bash
# Xem log
docker compose -f compose.prod.yml logs -f --tail=100

# Cập nhật thủ công sau khi push GitHub
git pull --ff-only
docker compose -f compose.prod.yml up -d --build

# Xóa build cache để tiết kiệm dung lượng, không xóa image/container đang dùng
docker builder prune -f

# Dừng stack PKS
docker compose -f compose.prod.yml down
```

Không dùng `docker system prune -a` vì VPS đang có image của PC Store và các dự án khác.
