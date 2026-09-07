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

async function createParticipant(name, email) {
  const res = await request(app)
    .post('/api/auth/register')
    .send({ name, email, password: 'Password123!' });
  return { token: res.body.token, user: res.body.user };
}

describe('Team Management Tests (team.test.js)', () => {
  test('Team creation generates unique 6-character code (TR-1, TR-2)', async () => {
    const p1 = await createParticipant('Lead User', 'lead@test.com');

    const res = await request(app)
      .post('/api/teams')
      .set('Authorization', `Bearer ${p1.token}`)
      .send({ name: 'Alpha Squad' });

    expect(res.status).toBe(201);
    expect(res.body.team).toBeDefined();
    expect(res.body.team.name).toBe('Alpha Squad');
    expect(res.body.team.teamCode).toHaveLength(6);
    expect(res.body.team.members).toHaveLength(1);
    expect(res.body.team.totalScore).toBe(0);
  });

  test('Joining team with code works (TR-3)', async () => {
    const p1 = await createParticipant('Leader', 'leader@test.com');
    const p2 = await createParticipant('Member', 'member@test.com');

    // p1 creates team
    const createRes = await request(app)
      .post('/api/teams')
      .set('Authorization', `Bearer ${p1.token}`)
      .send({ name: 'Beta Squad' });
    const code = createRes.body.team.teamCode;

    // p2 joins using code
    const joinRes = await request(app)
      .post('/api/teams/join')
      .set('Authorization', `Bearer ${p2.token}`)
      .send({ teamCode: code });

    expect(joinRes.status).toBe(200);
    expect(joinRes.body.team.members).toHaveLength(2);
  });

  test('Joining while already on a team fails with 409 (D-2)', async () => {
    const p1 = await createParticipant('Player 1', 'p1@test.com');
    const p2 = await createParticipant('Player 2', 'p2@test.com');

    // Both create their own teams
    const team1Res = await request(app)
      .post('/api/teams')
      .set('Authorization', `Bearer ${p1.token}`)
      .send({ name: 'Team One' });

    await request(app)
      .post('/api/teams')
      .set('Authorization', `Bearer ${p2.token}`)
      .send({ name: 'Team Two' });

    // p2 tries to join Team One while already belonging to Team Two
    const joinRes = await request(app)
      .post('/api/teams/join')
      .set('Authorization', `Bearer ${p2.token}`)
      .send({ teamCode: team1Res.body.team.teamCode });

    expect(joinRes.status).toBe(409);
    expect(joinRes.body.error.code).toBe('ALREADY_ON_TEAM');
  });

  test('Joining with invalid/non-existent code fails with 404', async () => {
    const p = await createParticipant('Solo Player', 'solo@test.com');

    const joinRes = await request(app)
      .post('/api/teams/join')
      .set('Authorization', `Bearer ${p.token}`)
      .send({ teamCode: 'INVALID' });

    expect(joinRes.status).toBe(404);
    expect(joinRes.body.error.code).toBe('TEAM_NOT_FOUND');
  });
});
