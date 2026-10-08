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
const tokens = {};
const userIds = [];
const courseIds = [];
const courseBody = (name, overrides = {}) => ({ name: `${marker} ${name}`, category: 'Web', instructor: 'Integration Teacher', shortDescription: 'Test summary', description: 'Integration test course', tuition: 2500000, capacity: 3, ...overrides });
const call = (method, path, actor = 'admin') => {
  const req = request(server)[method](`/api${path}`);
  return actor ? req.auth(tokens[actor], { type: 'bearer' }) : req;
};
async function createCourse(name, overrides = {}) {
  const response = await call('post', '/admin/courses').send(courseBody(name, overrides)).expect(201);
  courseIds.push(response.body.id);
  return response.body;
}
async function countMatches() {
  const rows = await db.query(`SELECT c.id, c.capacity, c.enrolled_count,
    count(e.id) FILTER (WHERE e.status = 'ENROLLED')::integer AS actual
    FROM courses c LEFT JOIN enrollments e ON e.course_id = c.id
    WHERE c.id = ANY($1::uuid[]) GROUP BY c.id`, [courseIds]);
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
    const id = randomUUID(); const email = `crud-${key}-${marker}@example.com`;
    await db.query('INSERT INTO users(id, full_name, email, password_hash, role) VALUES($1,$2,$3,$4,$5)', [id, `CRUD ${key}`, email, hash, role]);
    userIds.push(id); users[key] = { id, email };
    const login = await request(server).post('/api/auth/login').send({ email, password }).expect(200);
    tokens[key] = login.body.accessToken;
  }
});

after(async () => {
  try {
    if (db?.isInitialized) {
      await db.transaction(async manager => {
        await manager.query('DELETE FROM enrollments WHERE student_id = ANY($1::uuid[]) OR course_id = ANY($2::uuid[])', [userIds, courseIds]);
        await manager.query('DELETE FROM courses WHERE id = ANY($1::uuid[])', [courseIds]);
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
  userIds.push(created.body.id);
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
  await call('get', '/admin/users/not-uuid').expect(400);
  await call('get', `/admin/users/${randomUUID()}`).expect(404);
  await call('patch', `/admin/users/${created.body.id}`).send({ fullName: null }).expect(400);
  const login = await request(server).post('/api/auth/login').send({ email, password }).expect(200);
  const locked = await call('patch', `/admin/users/${created.body.id}`).send({ isActive: false }).expect(200);
  assert.equal(locked.body.isActive, false);
  await request(server).get('/api/auth/me').auth(login.body.accessToken, { type: 'bearer' }).expect(401);
  await request(server).post('/api/auth/login').send({ email, password }).expect(401);
  const activeAgain = await call('patch', `/admin/users/${created.body.id}`).send({ isActive: true }).expect(200);
  assert.equal(activeAgain.body.isActive, true);
  const loginAfterUnlock = await request(server).post('/api/auth/login').send({ email, password }).expect(200);
  const updated = await call('patch', `/admin/users/${created.body.id}`).send({ fullName: 'Updated Student', role: 'ADMIN', password: 'Updated-password-123!' }).expect(200);
  assert.equal(updated.body.role, 'ADMIN');
  await request(server).get('/api/auth/me').auth(loginAfterUnlock.body.accessToken, { type: 'bearer' }).expect(401);
  await call('patch', `/admin/users/${users.admin.id}`).send({ role: 'STUDENT' }).expect(409);
  await call('patch', `/admin/users/${users.admin.id}`).send({ isActive: false }).expect(409);
  await call('delete', `/admin/users/${users.admin.id}`).expect(409);
  await call('delete', `/admin/users/${created.body.id}`).expect(204);
  await call('get', `/admin/users/${created.body.id}`).expect(404);
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
  const list = await call('get', `/courses?search=${marker}&category=web&limit=1`, null).expect(200);
  assert.equal(list.body.total, 1);
  assert.equal(list.body.items[0].id, created.id);
  await call('get', '/courses?page=-1', null).expect(400);
  await call('get', '/courses?isPublished=garbage', null).expect(400);
  await call('get', `/courses/${created.id}`, null).expect(200);
  await call('patch', `/admin/courses/${created.id}`).send({ isPublished: false }).expect(200);
  await call('get', `/courses/${created.id}`, null).expect(404);
  const hidden = await call('get', `/courses?search=${marker}&isPublished=false`, null).expect(200);
  assert.equal(hidden.body.total, 0);
  const adminList = await call('get', `/admin/courses?search=${marker}&isPublished=false`).expect(200);
  assert.equal(adminList.body.items[0].id, created.id);
  await call('patch', `/admin/courses/${created.id}`).send({ capacity: null }).expect(400);
  await call('delete', `/admin/courses/${created.id}`).expect(204);
  await call('delete', `/admin/courses/${created.id}`).expect(404);
  console.log('[PASS] Course CRUD, publication, pagination/search/category, input validation');
});

test('Enrollment CRUD: ownership, counts, cancellation, restoration, protected history', async () => {
  const course = await createCourse('Enrollment Course', { capacity: 1 });
  await call('post', '/enrollments', 's1').send({ courseId: course.id, studentId: users.s2.id }).expect(403);
  const created = await call('post', '/enrollments', 's1').send({ courseId: course.id }).expect(201);
  const id = created.body.id;
  assert.equal(created.body.studentId, users.s1.id);
  assert.equal(created.body.course.enrolledCount, 1);
  assert.match(created.body.enrolledDate, /^\d{4}-\d{2}-\d{2}$/);
  assert.equal(vietnamDate(new Date('2026-10-07T18:30:00Z')), '2026-10-08');
  await call('post', '/enrollments', 's1').send({ courseId: course.id }).expect(409);
  await call('post', '/enrollments', 's2').send({ courseId: course.id }).expect(409);
  await call('get', `/enrollments/${id}`, 's2').expect(404);
  await call('patch', `/enrollments/${id}`, 's2').send({ status: 'CANCELLED' }).expect(404);
  await call('get', '/enrollments', 's1').expect(403);
  await call('delete', `/enrollments/${id}`, 's1').expect(403);
  const mine = await call('get', `/enrollments/me?studentId=${users.s2.id}`, 's1').expect(200);
  assert.ok(mine.body.items.every(item => item.studentId === users.s1.id));
  const roster = await call('get', `/admin/courses/${course.id}/enrollments`).expect(200);
  assert.equal(roster.body.items[0].student.email, users.s1.email);
  assert.equal(roster.body.items[0].course.name, course.name);
  await call('get', `/admin/courses/${randomUUID()}/enrollments`).expect(404);
  await call('delete', `/admin/courses/${course.id}`).expect(409);
  await call('delete', `/admin/users/${users.s1.id}`).expect(409);
  await call('patch', `/admin/users/${users.s1.id}`).send({ role: 'ADMIN' }).expect(409);
  await call('patch', `/enrollments/${id}`, 's1').send({ status: 'CANCELLED', courseId: randomUUID() }).expect(400);
  await call('patch', `/enrollments/${id}`, 's1').send({ status: 'INVALID' }).expect(400);
  await call('patch', `/enrollments/${id}`, 's1').send({ status: 'CANCELLED' }).expect(200);
  await call('patch', `/enrollments/${id}`, 's1').send({ status: 'CANCELLED' }).expect(200);
  assert.equal((await call('get', `/courses/${course.id}`, null)).body.enrolledCount, 0);
  await call('patch', `/admin/courses/${course.id}`).send({ isPublished: false }).expect(200);
  await call('patch', `/enrollments/${id}`, 's1').send({ status: 'ENROLLED' }).expect(409);
  await call('get', `/enrollments/${id}`, 's1').expect(200);
  await call('patch', `/admin/courses/${course.id}`).send({ isPublished: true }).expect(200);
  await call('patch', `/enrollments/${id}`, 's1').send({ status: 'ENROLLED' }).expect(200);
  await call('patch', `/enrollments/${id}`, 's1').send({ status: 'ENROLLED' }).expect(200);
  await call('delete', `/enrollments/${id}`).expect(204);
  await call('get', `/enrollments/${id}`).expect(404);
  assert.equal((await call('get', `/courses/${course.id}`, null)).body.enrolledCount, 0);
  await call('delete', `/admin/courses/${course.id}`).expect(204);
  console.log('[PASS] Enrollment lifecycle and ownership, history restrictions, VN date');
});

test('Enrollment race: only one student can take the last seat', async () => {
  const course = await createCourse('Last Seat', { capacity: 1 });
  const results = await Promise.all(['s1', 's2', 's3'].map(actor => call('post', '/enrollments', actor).send({ courseId: course.id })));
  assert.deepEqual(results.map(result => result.status).sort(), [201, 409, 409]);
  await countMatches();
  console.log('[PASS] 3 simultaneous students -> exactly one successful last-seat enrollment');
});

test('Duplicate requests and simultaneous capacity change preserve constraints', async () => {
  const course = await createCourse('Duplicate Race', { capacity: 2 });
  const results = await Promise.all([1, 2].map(() => call('post', '/enrollments', 's1').send({ courseId: course.id })));
  assert.deepEqual(results.map(result => result.status).sort(), [201, 409]);
  const races = await Promise.all([
    call('post', '/enrollments', 's2').send({ courseId: course.id }),
    call('patch', `/admin/courses/${course.id}`).send({ capacity: 1 }),
  ]);
  assert.ok(races.every(result => [200, 201, 409].includes(result.status)));
  assert.equal(races.filter(result => result.status === 409).length, 1);
  await countMatches();
  console.log('[PASS] duplicate request and capacity/enrollment race maintain exact count');
});

test('Hidden/missing courses and non-student enrollment are rejected', async () => {
  const hidden = await createCourse('Hidden Enrollment', { isPublished: false });
  await call('post', '/enrollments', 's1').send({ courseId: hidden.id }).expect(409);
  await call('post', '/enrollments', 's1').send({ courseId: randomUUID() }).expect(404);
  await call('post', '/enrollments').send({ courseId: hidden.id }).expect(400);
  await call('post', '/enrollments').send({ courseId: hidden.id, studentId: users.admin.id }).expect(400);
  await call('post', '/enrollments').send({ courseId: hidden.id, studentId: randomUUID() }).expect(404);
  const visible = await createCourse('Admin Enrollment');
  await call('post', '/enrollments').send({ courseId: visible.id, studentId: users.s3.id }).expect(201);
  const roster = await call('get', `/enrollments?courseId=${visible.id}&studentId=${users.s3.id}&status=ENROLLED`).expect(200);
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
  try { await call('post', '/enrollments', 's1').send({ courseId: course.id }).expect(500); }
  finally { db.transaction = transaction; }
  const [{ total }] = await db.query('SELECT count(*)::integer AS total FROM enrollments WHERE course_id = $1', [course.id]);
  assert.equal(total, 0);
  assert.equal((await call('get', `/courses/${course.id}`, null)).body.enrolledCount, 0);
  await countMatches();
  console.log('[PASS] transaction rollback verified after real enrollment insert');
});

test('Concurrent cancellation/deletion does not decrement count twice', async () => {
  const course = await createCourse('Cancel Race');
  const created = await call('post', '/enrollments', 's3').send({ courseId: course.id }).expect(201);
  const results = await Promise.all([
    call('patch', `/enrollments/${created.body.id}`, 's3').send({ status: 'CANCELLED' }),
    call('delete', `/enrollments/${created.body.id}`),
  ]);
  assert.ok(results.every(response => [200, 204, 404].includes(response.status)));
  await countMatches();
  assert.equal((await call('get', `/courses/${course.id}`, null)).body.enrolledCount, 0);
  console.log('[PASS] concurrent cancel/delete leaves enrolledCount=0');
});
