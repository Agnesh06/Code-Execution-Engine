const request = require('supertest');
const app = require('../src/app');
const { setupTestDB, teardownTestDB, clearTestDB } = require('./setup');
const Team = require('../src/models/Team');

beforeAll(async () => {
  await setupTestDB();
});

afterAll(async () => {
  await teardownTestDB();
});

afterEach(async () => {
  await clearTestDB();
});

describe('Leaderboard & Tie-Breaker Tests (leaderboard.test.js)', () => {
  test('Ranks teams by totalScore descending (LB-1, LB-3)', async () => {
    // Register participant to obtain token
    const regRes = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Spectator', email: 'spec@test.com', password: 'Password123!' });
    const token = regRes.body.token;

    // Create teams with different scores
    await Team.create({ name: 'Bronze Team', teamCode: 'BRONZE', totalScore: 30 });
    await Team.create({ name: 'Gold Team', teamCode: 'GOLDEN', totalScore: 100 });
    await Team.create({ name: 'Silver Team', teamCode: 'SILVER', totalScore: 60 });

    const res = await request(app)
      .get('/api/leaderboard')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.leaderboard).toHaveLength(3);
    expect(res.body.leaderboard[0].teamName).toBe('Gold Team');
    expect(res.body.leaderboard[0].rank).toBe(1);
    expect(res.body.leaderboard[1].teamName).toBe('Silver Team');
    expect(res.body.leaderboard[1].rank).toBe(2);
    expect(res.body.leaderboard[2].teamName).toBe('Bronze Team');
    expect(res.body.leaderboard[2].rank).toBe(3);
  });

  test('Tie-breaker: earliest completion time wins on score tie (LB-4, D-6)', async () => {
    const regRes = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Viewer', email: 'view@test.com', password: 'Password123!' });
    const token = regRes.body.token;

    const timeA = new Date('2026-09-07T10:00:00Z'); // 10:00 AM (earlier)
    const timeB = new Date('2026-09-07T10:15:00Z'); // 10:15 AM (later)

    // Both have 100 points, but Team Quick achieved it earlier than Team Slow
    await Team.create({
      name: 'Team Quick',
      teamCode: 'QUICK1',
      totalScore: 100,
      lastScoreUpdateAt: timeA
    });

    await Team.create({
      name: 'Team Slow',
      teamCode: 'SLOW01',
      totalScore: 100,
      lastScoreUpdateAt: timeB
    });

    const res = await request(app)
      .get('/api/leaderboard')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.leaderboard).toHaveLength(2);
    expect(res.body.leaderboard[0].teamName).toBe('Team Quick');
    expect(res.body.leaderboard[0].rank).toBe(1);
    expect(res.body.leaderboard[1].teamName).toBe('Team Slow');
    expect(res.body.leaderboard[1].rank).toBe(2);
  });
});
