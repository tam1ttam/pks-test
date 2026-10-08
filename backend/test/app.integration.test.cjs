const { before, after, test } = require('node:test');
const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const { NestFactory } = require('@nestjs/core');
const { JwtService } = require('@nestjs/jwt');
const { ConfigService } = require('@nestjs/config');
const { DataSource } = require('typeorm');
const bcrypt = require('bcryptjs');
const request = require('supertest');
const { AppModule } = require('../dist/app.module');
const { setupApp } = require('../dist/common/utils/setup-app');
const { AuthService } = require('../dist/modules/auth/auth.service');

let app, server, db, token, userId, otherId;
const marker = randomUUID();
const email = `integration-${marker}@example.com`;
const otherEmail = `other-${marker}@example.com`;
const googleEmail = `google-${marker}@example.com`;
const password = 'Integration-Password-123!';

before(async () => {
  app = await NestFactory.create(AppModule, { logger: false, abortOnError: false });
  setupApp(app);
  await app.listen(0, '127.0.0.1');
  server = app.getHttpServer();
  db = app.get(DataSource);
});

after(async () => {
  try {
    if (db?.isInitialized) await db.query('DELETE FROM users WHERE email = ANY($1::text[])', [[email, otherEmail, googleEmail]]);
  } finally { await app?.close(); }
});

test('connected database: register persists a bcrypt hash and hides secrets', async () => {
  const response = await request(server).post('/api/auth/register').send({ fullName: 'Integration User', email: email.toUpperCase(), password }).expect(201);
  userId = response.body.id;
  assert.equal(response.body.email, email);
  assert.equal(response.body.role, 'STUDENT');
  assert.equal(response.body.passwordHash, undefined);
  const [saved] = await db.query('SELECT password_hash FROM users WHERE id = $1', [userId]);
  assert.ok(await bcrypt.compare(password, saved.password_hash));
  assert.ok(bcrypt.getRounds(saved.password_hash) >= 10);
  console.log('[PASS] POST /api/auth/register -> 201; PostgreSQL row + bcrypt verified');
});

test('reject duplicate emails, invalid input and role escalation', async () => {
  await request(server).post('/api/auth/register').send({ fullName: 'Duplicate', email, password }).expect(409);
  await request(server).post('/api/auth/register').send({ fullName: 'Bad', email: 'invalid', password: 'short' }).expect(400);
  await request(server).post('/api/auth/register').send({ fullName: 'Bad Role', email: otherEmail, password, role: 'ADMIN' }).expect(400);
  await request(server).post('/api/auth/register').send({ fullName: 'Bad Bytes', email: otherEmail, password: 'ệ'.repeat(30) }).expect(400);
  console.log('[PASS] register errors -> 409/400');
});

test('login and me require a valid non-expired signed token', async () => {
  await request(server).post('/api/auth/login').send({ email, password: 'wrong-password' }).expect(401);
  const response = await request(server).post('/api/auth/login').send({ email, password }).expect(200);
  token = response.body.accessToken;
  const me = await request(server).get('/api/auth/me').auth(token, { type: 'bearer' }).expect(200);
  assert.equal(me.body.id, userId);
  assert.equal(me.body.passwordHash, undefined);
  await request(server).get('/api/users/me').expect(401);
  await request(server).get('/api/users/me').auth('invalid-token', { type: 'bearer' }).expect(401);
  const jwt = app.get(JwtService);
  const payload = jwt.decode(token);
  const expired = await jwt.signAsync({ sub: userId, sid: payload.sid }, { expiresIn: -1 });
  await request(server).get('/api/users/me').auth(expired, { type: 'bearer' }).expect(401);
  console.log('[PASS] login/me -> 200; wrong credentials/token -> 401');
});

test('profile updates persist and cannot modify another user or role', async () => {
  const other = await request(server).post('/api/auth/register').send({ fullName: 'Other User', email: otherEmail, password }).expect(201);
  otherId = other.body.id;
  await request(server).patch('/api/users/me').auth(token, { type: 'bearer' }).send({ fullName: 'Updated Name' }).expect(200);
  const me = await request(server).get('/api/users/me').auth(token, { type: 'bearer' }).expect(200);
  assert.equal(me.body.fullName, 'Updated Name');
  await request(server).patch('/api/users/me').auth(token, { type: 'bearer' }).send({ fullName: 'Intruder', id: otherId, role: 'ADMIN' }).expect(400);
  await request(server).patch('/api/users/me').auth(token, { type: 'bearer' }).send({ fullName: '  ' }).expect(400);
  await request(server).patch('/api/users/me').send({ fullName: 'Intruder' }).expect(401);
  const [saved] = await db.query('SELECT full_name, role FROM users WHERE id = $1', [otherId]);
  assert.equal(saved.full_name, 'Other User');
  assert.equal(saved.role, 'STUDENT');
  console.log('[PASS] PATCH /api/users/me -> 200; ownership/role validation verified');
});

test('Google login uses verified subject; existing email is never silently linked (provider stub)', async () => {
  const auth = app.get(AuthService);
  const config = app.get(ConfigService);
  const original = auth.google.verifyIdToken;
  const clientId = config.get('googleClientId');
  config.set('googleClientId', 'integration-client.apps.googleusercontent.com');
  let payload = { sub: marker, email: googleEmail, email_verified: true, name: 'Google Test' };
  auth.google.verifyIdToken = async options => {
    assert.equal(options.audience, 'integration-client.apps.googleusercontent.com');
    return { getPayload: () => payload };
  };
  try {
    const first = await request(server).post('/api/auth/google').send({ credential: 'provider-stub' }).expect(200);
    const second = await request(server).post('/api/auth/google').send({ credential: 'provider-stub' }).expect(200);
    assert.equal(first.body.user.id, second.body.user.id);
    assert.equal(first.body.user.role, 'STUDENT');
    payload = { ...payload, sub: randomUUID(), email };
    await request(server).post('/api/auth/google').send({ credential: 'provider-stub' }).expect(409);
    payload = { ...payload, email_verified: false };
    await request(server).post('/api/auth/google').send({ credential: 'provider-stub' }).expect(401);
    auth.google.verifyIdToken = async () => { throw new Error('Invalid signature'); };
    await request(server).post('/api/auth/google').send({ credential: 'invalid' }).expect(401);
  } finally {
    auth.google.verifyIdToken = original;
    config.set('googleClientId', clientId);
  }
  console.log('[PASS] Google provider-stub tests; live Google OAuth is not covered');
});

test('logout revokes this session on server and returns 204', async () => {
  await request(server).post('/api/auth/logout').auth(token, { type: 'bearer' }).expect(204);
  await request(server).get('/api/auth/me').auth(token, { type: 'bearer' }).expect(401);
  await request(server).get('/api/missing-route').expect(404);
  console.log('[PASS] logout -> 204; revoked token -> 401; unknown route -> 404');
});
