const { before, after, test } = require('node:test');
const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const { NestFactory } = require('@nestjs/core');
const { DataSource } = require('typeorm');
const bcrypt = require('bcryptjs');
const request = require('supertest');
const { AppModule } = require('../dist/app.module');
const { setupApp } = require('../dist/common/utils/setup-app');
const { Course } = require('../dist/database/entities/course.entity');
const { vietnamDate } = require('../dist/common/utils/date');

let app, server, db;
const marker = randomUUID();
const password = 'Crud-test-password-123!';
const users = {};
const cookies = {};
const userIds = [];
const courseCodes = [];
const courseBody = (name, overrides = {}) => ({ name: `${marker} ${name}`, category: 'Web', instructor: 'Integration Teacher', shortDescription: 'Test summary', description: 'Integration test course', tuition: 2500000, capacity: 3, ...overrides });
const call = (method, path, actor = 'admin') => {
  const req = request(server)[method](`/api${path}`);
  if (!actor) return req;
  req.set('Cookie', cookies[actor]);
  if (actor === 'admin') req.set('X-PKS-Portal', 'admin');
  return req;
};
async function createCourse(name, overrides = {}) {
  const response = await call('post', '/admin/courses').send(courseBody(name, overrides)).expect(201);
  const [stored] = await db.query('SELECT id FROM courses WHERE code = $1', [response.body.code]);
  courseCodes.push(stored.id);
  return response.body;
}
async function countMatches() {
  const rows = await db.query(`SELECT c.id, c.capacity, c.enrolled_count,
    count(e.id) FILTER (WHERE e.status = 'ENROLLED')::integer AS actual
    FROM courses c LEFT JOIN enrollments e ON e.course_id = c.id
    WHERE c.id = ANY($1::uuid[]) GROUP BY c.id`, [courseCodes]);
  for (const row of rows) {
    assert.equal(row.enrolled_count, row.actual);
    assert.ok(row.actual >= 0 && row.actual <= row.capacity);
  }
}

before(async () => {
  app = await NestFactory.create(AppModule, { logger: false, abortOnError: false });
  setupApp(app);
  await app.listen(0, '127.0.0.1');
  server = app.getHttpServer(); db = app.get(DataSource);
  const hash = await bcrypt.hash(password, 10);
  for (const [key, role] of [['admin', 'ADMIN'], ['s1', 'STUDENT'], ['s2', 'STUDENT'], ['s3', 'STUDENT']]) {
    const id = randomUUID(); const code = `USR-${randomUUID().replaceAll('-', '').slice(0, 12).toUpperCase()}`; const email = `crud-${key}-${marker}@example.com`;
    await db.query('INSERT INTO users(id, code, full_name, email, password_hash, role) VALUES($1,$2,$3,$4,$5,$6)', [id, code, `CRUD ${key}`, email, hash, role]);
    userIds.push(id); users[key] = { id, code, email };
    const login = await request(server).post('/api/auth/login').send({ email, password, portal: role === 'ADMIN' ? 'ADMIN' : 'CLIENT' }).expect(200);
    cookies[key] = login.headers['set-cookie'][0].split(';')[0];
  }
});

after(async () => {
  try {
    if (db?.isInitialized) {
      await db.transaction(async manager => {
        await manager.query('DELETE FROM enrollments WHERE student_id = ANY($1::uuid[]) OR course_id = ANY($2::uuid[])', [userIds, courseCodes]);
        await manager.query('DELETE FROM courses WHERE id = ANY($1::uuid[])', [courseCodes]);
        await manager.query('DELETE FROM users WHERE id = ANY($1::uuid[])', [userIds]);
      });
    }
  } finally { await app?.close(); }
});

test('User CRUD: admin only, safe responses, unique email, validation and session revocation', async () => {
  await call('get', '/admin/users', null).expect(401);
  await call('get', '/admin/users', 's1').expect(403);
  await call('post', '/admin/users', 's1').send({}).expect(403);
  const email = `crud-created-${marker}@example.com`;
  const created = await call('post', '/admin/users').send({ fullName: 'Created Student', email: email.toUpperCase(), password }).expect(201);
  userIds.push((await db.query('SELECT id FROM users WHERE code = $1', [created.body.code]))[0].id);
  assert.equal(created.body.email, email);
  assert.equal(created.body.role, 'STUDENT');
  assert.equal(created.body.passwordHash, undefined);
  await call('post', '/admin/users').send({ fullName: 'Duplicate', email, password }).expect(409);
  await call('post', '/admin/users').send({ fullName: 'Invalid', email: 'bad', password: 'short' }).expect(400);
  await call('post', '/admin/users').send({ fullName: 'Old role', email: `staff-${marker}@example.com`, password, role: 'STAFF' }).expect(400);
  const list = await call('get', `/admin/users?search=${marker}&role=STUDENT&page=1&limit=2`).expect(200);
  assert.equal(list.body.items.length, 2);
  assert.equal(list.body.total, 4);
  assert.ok(!JSON.stringify(list.body).includes('passwordHash'));
  await call('get', '/admin/users/not-a-code').expect(404);
  await call('get', `/admin/users/${randomUUID()}`).expect(404);
  await call('patch', `/admin/users/${created.body.code}`).send({ fullName: null }).expect(400);
  const login = await request(server).post('/api/auth/login').send({ email, password }).expect(200);
  const locked = await call('patch', `/admin/users/${created.body.code}`).send({ isActive: false }).expect(200);
  assert.equal(locked.body.isActive, false);
  await request(server).get('/api/auth/me').set('Cookie', login.headers['set-cookie'][0].split(';')[0]).expect(401);
  await request(server).post('/api/auth/login').send({ email, password }).expect(401);
  const activeAgain = await call('patch', `/admin/users/${created.body.code}`).send({ isActive: true }).expect(200);
  assert.equal(activeAgain.body.isActive, true);
  const loginAfterUnlock = await request(server).post('/api/auth/login').send({ email, password }).expect(200);
  await call('patch', `/admin/users/${created.body.code}`).send({ password: 'Updated-password-123!' }).expect(400);
  const updated = await call('patch', `/admin/users/${created.body.code}`).send({ fullName: 'Updated Student', role: 'ADMIN' }).expect(200);
  assert.equal(updated.body.role, 'ADMIN');
  await request(server).get('/api/auth/me').set('Cookie', loginAfterUnlock.headers['set-cookie'][0].split(';')[0]).expect(401);
  await call('patch', `/admin/users/${users.admin.code}`).send({ role: 'STUDENT' }).expect(409);
  await call('patch', `/admin/users/${users.admin.code}`).send({ isActive: false }).expect(409);
  await call('delete', `/admin/users/${users.admin.code}`).expect(409);
  await call('delete', `/admin/users/${created.body.code}`).expect(204);
  await call('get', `/admin/users/${created.body.code}`).expect(404);
  console.log('[PASS] admin User CRUD, validation, protected roles and revoked sessions');
});

test('Course CRUD: public filtering, admin writes, hide, delete and DTO validation', async () => {
  await call('post', '/admin/courses', null).send(courseBody('Denied')).expect(401);
  await call('post', '/admin/courses', 's1').send(courseBody('Denied')).expect(403);
  await call('post', '/admin/courses').send(courseBody('Bad', { capacity: 0 })).expect(400);
  await call('post', '/admin/courses').send(courseBody('Bad', { tuition: -1 })).expect(400);
  await call('post', '/admin/courses').send(courseBody('Bad', { enrolledCount: 1 })).expect(400);
  const created = await createCourse('Public Course');
  assert.equal(created.tuition, 2500000);
  assert.equal(created.enrolledCount, 0);
  assert.equal(created.availability, 'AVAILABLE');
  const categories = await call('get', '/categories', null).expect(200);
  assert.ok(categories.body.items.some(category => category.code === created.categoryCode));
  const list = await call('get', `/courses?search=${marker}&category=web&limit=1`, null).expect(200);
  assert.equal(list.body.total, 1);
  assert.equal(list.body.items[0].code, created.code);
  await call('get', '/courses?page=-1', null).expect(400);
  await call('get', '/courses?isPublished=garbage', null).expect(400);
  await call('get', `/courses/${created.code}`, null).expect(200);
  await call('patch', `/admin/courses/${created.code}`).send({ isPublished: false }).expect(200);
  await call('get', `/courses/${created.code}`, null).expect(404);
  const hidden = await call('get', `/courses?search=${marker}&isPublished=false`, null).expect(200);
  assert.equal(hidden.body.total, 0);
  const adminList = await call('get', `/admin/courses?search=${marker}&isPublished=false`).expect(200);
  assert.equal(adminList.body.items[0].code, created.code);
  await call('patch', `/admin/courses/${created.code}`).send({ capacity: null }).expect(400);
  await call('delete', `/admin/courses/${created.code}`).expect(204);
  await call('delete', `/admin/courses/${created.code}`).expect(404);
  console.log('[PASS] Course CRUD, publication, pagination/search/category, input validation');
});

test('Image upload endpoint rejects a missing multipart file before contacting Cloudinary', async () => {
  const response = await call('post', '/uploads/image', 's1').expect(400);
  assert.match(JSON.stringify(response.body), /file|tệp|image/i);
  console.log('[PASS] image upload validates the multipart file before external upload');
});

test('Enrollment CRUD: ownership, counts, cancellation, restoration, protected history', async () => {
  const course = await createCourse('Enrollment Course', { capacity: 1 });
  await call('post', '/enrollments', 's1').send({ courseCode: course.code, studentCode: users.s2.code }).expect(403);
  const created = await call('post', '/enrollments', 's1').send({ courseCode: course.code }).expect(201);
  const id = created.body.code;
  assert.equal(created.body.studentCode, users.s1.code);
  assert.equal(created.body.course.enrolledCount, 1);
  assert.match(created.body.enrolledDate, /^\d{4}-\d{2}-\d{2}$/);
  assert.equal(vietnamDate(new Date('2026-10-07T18:30:00Z')), '2026-10-08');
  await call('post', '/enrollments', 's1').send({ courseCode: course.code }).expect(409);
  await call('post', '/enrollments', 's2').send({ courseCode: course.code }).expect(409);
  await call('get', `/enrollments/${id}`, 's2').expect(404);
  await call('patch', `/enrollments/${id}`, 's2').send({ status: 'CANCELLED' }).expect(404);
  await call('get', '/enrollments', 's1').expect(403);
  await call('delete', `/enrollments/${id}`, 's1').expect(403);
  const mine = await call('get', `/enrollments/me?studentCode=${users.s2.code}`, 's1').expect(200);
  assert.ok(mine.body.items.every(item => item.studentCode === users.s1.code));
  const roster = await call('get', `/admin/courses/${course.code}/enrollments`).expect(200);
  assert.equal(roster.body.items[0].student.email, users.s1.email);
  assert.equal(roster.body.items[0].course.name, course.name);
  await call('get', `/admin/courses/${randomUUID()}/enrollments`).expect(404);
  await call('delete', `/admin/courses/${course.code}`).expect(409);
  await call('delete', `/admin/users/${users.s1.code}`).expect(409);
  await call('patch', `/admin/users/${users.s1.code}`).send({ role: 'ADMIN' }).expect(409);
  await call('patch', `/enrollments/${id}`, 's1').send({ status: 'CANCELLED', courseCode: randomUUID() }).expect(400);
  await call('patch', `/enrollments/${id}`, 's1').send({ status: 'INVALID' }).expect(400);
  await call('post', `/enrollments/${id}/cancel-request`, 's1').expect(201);
  const pending = await call('get', `/enrollments/${id}`, 's1').expect(200);
  assert.equal(pending.body.status, 'CANCEL_REQUESTED');
  await call('patch', `/enrollments/${id}`).send({ status: 'CANCELLED' }).expect(200);
  await call('patch', `/enrollments/${id}`).send({ status: 'CANCELLED' }).expect(200);
  assert.equal((await call('get', `/courses/${course.code}`, null)).body.enrolledCount, 0);
  await call('patch', `/admin/courses/${course.code}`).send({ isPublished: false }).expect(200);
  await call('patch', `/enrollments/${id}`).send({ status: 'ENROLLED' }).expect(409);
  await call('get', `/enrollments/${id}`, 's1').expect(200);
  await call('patch', `/admin/courses/${course.code}`).send({ isPublished: true }).expect(200);
  await call('patch', `/enrollments/${id}`).send({ status: 'ENROLLED' }).expect(200);
  await call('patch', `/enrollments/${id}`).send({ status: 'ENROLLED' }).expect(200);
  await call('delete', `/enrollments/${id}`).expect(204);
  await call('get', `/enrollments/${id}`).expect(404);
  assert.equal((await call('get', `/courses/${course.code}`, null)).body.enrolledCount, 0);
  await call('delete', `/admin/courses/${course.code}`).expect(204);
  console.log('[PASS] Enrollment lifecycle and ownership, history restrictions, VN date');
});

test('Enrollment race: only one student can take the last seat', async () => {
  const course = await createCourse('Last Seat', { capacity: 1 });
  const results = await Promise.all(['s1', 's2', 's3'].map(actor => call('post', '/enrollments', actor).send({ courseCode: course.code })));
  assert.deepEqual(results.map(result => result.status).sort(), [201, 409, 409]);
  await countMatches();
  console.log('[PASS] 3 simultaneous students -> exactly one successful last-seat enrollment');
});

test('Student can re-enroll one minute after an approved cancellation', async () => {
  const course = await createCourse('Re-enrollment cooldown', { capacity: 2 });
  const created = await call('post', '/enrollments', 's2').send({ courseCode: course.code }).expect(201);
  await call('post', `/enrollments/${created.body.code}/cancel-request`, 's2').expect(201);
  await call('patch', `/enrollments/${created.body.code}`).send({ status: 'CANCELLED' }).expect(200);
  await call('post', `/enrollments/${created.body.code}/reenroll`, 's2').expect(409);
  await db.query(`UPDATE enrollments SET updated_at = now() - interval '61 seconds' WHERE code = $1`, [created.body.code]);
  const restored = await call('post', `/enrollments/${created.body.code}/reenroll`, 's2').expect(201);
  assert.equal(restored.body.status, 'ENROLLED');
  assert.equal((await call('get', `/courses/${course.code}`, null)).body.enrolledCount, 1);
  console.log('[PASS] cancelled enrollment enforces a one-minute re-enrollment cooldown');
});

test('Duplicate requests and simultaneous capacity change preserve constraints', async () => {
  const course = await createCourse('Duplicate Race', { capacity: 2 });
  const results = await Promise.all([1, 2].map(() => call('post', '/enrollments', 's1').send({ courseCode: course.code })));
  assert.deepEqual(results.map(result => result.status).sort(), [201, 409]);
  const races = await Promise.all([
    call('post', '/enrollments', 's2').send({ courseCode: course.code }),
    call('patch', `/admin/courses/${course.code}`).send({ capacity: 1 }),
  ]);
  assert.ok(races.every(result => [200, 201, 409].includes(result.status)));
  assert.equal(races.filter(result => result.status === 409).length, 1);
  await countMatches();
  console.log('[PASS] duplicate request and capacity/enrollment race maintain exact count');
});

test('Hidden/missing courses and non-student enrollment are rejected', async () => {
  const hidden = await createCourse('Hidden Enrollment', { isPublished: false });
  await call('post', '/enrollments', 's1').send({ courseCode: hidden.code }).expect(409);
  await call('post', '/enrollments', 's1').send({ courseCode: 'CRS-FFFFFFFFFFFF' }).expect(404);
  await call('post', '/enrollments').send({ courseCode: hidden.code }).expect(400);
  await call('post', '/enrollments').send({ courseCode: hidden.code, studentCode: users.admin.code }).expect(400);
  await call('post', '/enrollments').send({ courseCode: hidden.code, studentCode: 'USR-FFFFFFFFFFFF' }).expect(404);
  const visible = await createCourse('Admin Enrollment');
  await call('post', '/enrollments').send({ courseCode: visible.code, studentCode: users.s3.code }).expect(201);
  const roster = await call('get', `/enrollments?courseCode=${visible.code}&studentCode=${users.s3.code}&status=ENROLLED`).expect(200);
  assert.equal(roster.body.total, 1);
  await countMatches();
  console.log('[PASS] hidden/missing course, student-only targets, admin enrollment and filters');
});

test('Injected failure after enrollment insert rolls back both enrollment and count', async () => {
  const course = await createCourse('Rollback');
  const transaction = db.transaction;
  db.transaction = function (callback) {
    return transaction.call(db, async manager => {
      const save = manager.save.bind(manager);
      manager.save = async (...args) => {
        if (args[0] instanceof Course) throw new Error('Integration fault injection before count save');
        return save(...args);
      };
      return callback(manager);
    });
  };
  try { await call('post', '/enrollments', 's1').send({ courseCode: course.code }).expect(500); }
  finally { db.transaction = transaction; }
  const [{ total }] = await db.query('SELECT count(*)::integer AS total FROM enrollments e JOIN courses c ON c.id = e.course_id WHERE c.code = $1', [course.code]);
  assert.equal(total, 0);
  assert.equal((await call('get', `/courses/${course.code}`, null)).body.enrolledCount, 0);
  await countMatches();
  console.log('[PASS] transaction rollback verified after real enrollment insert');
});

test('Concurrent cancellation/deletion does not decrement count twice', async () => {
  const course = await createCourse('Cancel Race');
  const created = await call('post', '/enrollments', 's3').send({ courseCode: course.code }).expect(201);
  await call('post', `/enrollments/${created.body.code}/cancel-request`, 's3').expect(201);
  const results = await Promise.all([
    call('patch', `/enrollments/${created.body.code}`).send({ status: 'CANCELLED' }),
    call('delete', `/enrollments/${created.body.code}`),
  ]);
  assert.ok(results.every(response => [200, 204, 404].includes(response.status)));
  await countMatches();
  assert.equal((await call('get', `/courses/${course.code}`, null)).body.enrolledCount, 0);
  console.log('[PASS] concurrent cancel/delete leaves enrolledCount=0');
});
