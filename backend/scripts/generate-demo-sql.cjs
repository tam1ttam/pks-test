// Regenerate only when intentionally changing the demo seed definition.
const fs = require('node:fs');
const path = require('node:path');
const bcrypt = require('bcryptjs');
const hash = bcrypt.hashSync('PksDemo@123', 10);
const sql = `-- PKS demo seed. Run TypeORM migrations first: npm run db:migrate
-- Execute against pkstest using a SQL client, or: npm run db:seed
-- Demo-only password for the four new accounts below: PksDemo@123
-- Idempotent: existing IDs are kept; passwords/profile changes are never reset.
-- A duplicate email belonging to another ID aborts the transaction, not overwrite it.
BEGIN;
SELECT pg_advisory_xact_lock(1791460800);

INSERT INTO users (id, code, full_name, email, password_hash, role) VALUES
('10000000-0000-4000-8000-000000000001', 'USR-DEMOADMIN001', 'PKS Admin', 'admin@pks.demo', '${hash}', 'ADMIN'),
('10000000-0000-4000-8000-000000000003', 'USR-DEMOSTUDENT1', 'Nguyễn Minh Anh', 'student1@pks.demo', '${hash}', 'STUDENT'),
('10000000-0000-4000-8000-000000000004', 'USR-DEMOSTUDENT2', 'Trần Hoàng Nam', 'student2@pks.demo', '${hash}', 'STUDENT'),
('10000000-0000-4000-8000-000000000005', 'USR-DEMOSTUDENT3', 'Lê Ngọc Linh', 'student3@pks.demo', '${hash}', 'STUDENT')
ON CONFLICT (id) DO NOTHING;

-- Match API lock order: students -> courses -> enrollments.
SELECT id FROM users WHERE id IN (
 '10000000-0000-4000-8000-000000000003',
 '10000000-0000-4000-8000-000000000004',
 '10000000-0000-4000-8000-000000000005'
) ORDER BY id FOR UPDATE;

DO $$ BEGIN
 IF EXISTS (SELECT 1 FROM users WHERE id IN (
  '10000000-0000-4000-8000-000000000003',
  '10000000-0000-4000-8000-000000000004',
  '10000000-0000-4000-8000-000000000005'
 ) AND role <> 'STUDENT') THEN
  RAISE EXCEPTION 'Demo student IDs have been assigned a different role; seed aborted';
 END IF;
END $$;

INSERT INTO courses (id, code, name, category, instructor, short_description, description, tuition, capacity, is_published) VALUES
('20000000-0000-4000-8000-000000000001', 'CRS-DEMOCOURSE01', 'React thực chiến', 'Web Development', 'Nguyễn Hải', 'Xây dựng ứng dụng React với TypeScript.', 'Component, hooks, routing và tích hợp REST API qua một dự án thực tế.', 2500000, 20, true),
('20000000-0000-4000-8000-000000000002', 'CRS-DEMOCOURSE02', 'MOS Excel căn bản', 'MOS', 'Trần Mai', 'Làm chủ bảng tính Excel.', 'Thao tác bảng tính, công thức và trình bày báo cáo theo chuẩn MOS.', 1500000, 1, true),
('20000000-0000-4000-8000-000000000003', 'CRS-DEMOCOURSE03', 'NestJS và PostgreSQL', 'Web Development', 'Lê Dũng', 'Xây dựng backend với NestJS.', 'REST API, xác thực, cơ sở dữ liệu và transaction. Khóa đang ở trạng thái ẩn.', 3000000, 15, false)
ON CONFLICT (id) DO NOTHING;

SELECT id FROM courses WHERE id IN (
 '20000000-0000-4000-8000-000000000001',
 '20000000-0000-4000-8000-000000000002',
 '20000000-0000-4000-8000-000000000003'
) ORDER BY id FOR UPDATE;

INSERT INTO enrollments (id, code, student_id, course_id, status, enrolled_at) VALUES
('30000000-0000-4000-8000-000000000001', 'ENR-DEMOENROLL01', '10000000-0000-4000-8000-000000000003', '20000000-0000-4000-8000-000000000001', 'ENROLLED', '2026-10-08T02:00:00Z'),
('30000000-0000-4000-8000-000000000002', 'ENR-DEMOENROLL02', '10000000-0000-4000-8000-000000000004', '20000000-0000-4000-8000-000000000002', 'ENROLLED', '2026-10-08T03:00:00Z'),
('30000000-0000-4000-8000-000000000003', 'ENR-DEMOENROLL03', '10000000-0000-4000-8000-000000000005', '20000000-0000-4000-8000-000000000001', 'CANCELLED', '2026-10-08T04:00:00Z')
ON CONFLICT (student_id, course_id) DO NOTHING;

-- Include all active enrollments, even those created through the API after first seed.
UPDATE courses c SET enrolled_count = (
 SELECT count(*)::integer FROM enrollments e WHERE e.course_id = c.id AND e.status = 'ENROLLED'
) WHERE c.id IN (
 '20000000-0000-4000-8000-000000000001',
 '20000000-0000-4000-8000-000000000002',
 '20000000-0000-4000-8000-000000000003'
);
COMMIT;
`;
fs.writeFileSync(path.resolve(__dirname, '../migration.sql'), sql, 'utf8');
console.log('Generated backend/migration.sql with bcrypt cost 10 demo hashes.');
