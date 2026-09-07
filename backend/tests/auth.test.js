const request = require('supertest');
const app = require('../src/app');
const { setupTestDB, teardownTestDB, clearTestDB } = require('./setup');
const User = require('../src/models/User');

beforeAll(async () => {
  await setupTestDB();
});

afterAll(async () => {
  await teardownTestDB();
});

afterEach(async () => {
  await clearTestDB();
});

describe('Authentication & RBAC Tests (auth.test.js)', () => {
  test('Register creates PARTICIPANT only, even if role ADMIN is passed (D-1, FR-1)', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Alice Participant',
        email: 'alice@test.com',
        password: 'Password123!',
        role: 'ADMIN' // Trying to spoof admin role
      });

    expect(res.status).toBe(201);
    expect(res.body.user).toBeDefined();
    expect(res.body.user.role).toBe('PARTICIPANT');

    const dbUser = await User.findOne({ email: 'alice@test.com' });
    expect(dbUser.role).toBe('PARTICIPANT');
  });

  test('Login succeeds with correct credentials and rejects wrong password (FR-2, AR-1)', async () => {
    // Register participant first
    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Bob Participant',
        email: 'bob@test.com',
        password: 'Password123!'
      });

    // Attempt login with wrong password
    const wrongRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'bob@test.com',
        password: 'WrongPassword999!'
      });
    expect(wrongRes.status).toBe(401);
    expect(wrongRes.body.error.code).toBe('INVALID_CREDENTIALS');

    // Attempt login with correct password
    const correctRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'bob@test.com',
        password: 'Password123!'
      });
    expect(correctRes.status).toBe(200);
    expect(correctRes.body.token).toBeDefined();
    expect(correctRes.body.user.email).toBe('bob@test.com');
  });

  test('Protected route rejects missing or invalid token (AR-3)', async () => {
    // No token provided
    const noTokenRes = await request(app).get('/api/auth/me');
    expect(noTokenRes.status).toBe(401);
    expect(noTokenRes.body.error.code).toBe('UNAUTHORIZED');

    // Invalid token provided
    const invalidTokenRes = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer invalid.token.value');
    expect(invalidTokenRes.status).toBe(401);
    expect(invalidTokenRes.body.error.code).toBe('INVALID_TOKEN');
  });

  test('Participant accounts are rejected with 403 on admin routes (SEC-1, SEC-2)', async () => {
    // Register participant
    const regRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Charlie Participant',
        email: 'charlie@test.com',
        password: 'Password123!'
      });
    const token = regRes.body.token;

    // Try accessing admin routes
    const adminRes = await request(app)
      .get('/api/admin/teams')
      .set('Authorization', `Bearer ${token}`);

    expect(adminRes.status).toBe(403);
    expect(adminRes.body.error.code).toBe('FORBIDDEN');
  });
});
