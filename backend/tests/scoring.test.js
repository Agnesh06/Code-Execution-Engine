const request = require('supertest');
const app = require('../src/app');
const { setupTestDB, teardownTestDB, clearTestDB } = require('./setup');
const Event = require('../src/models/Event');
const Round = require('../src/models/Round');
const Question = require('../src/models/Question');
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

async function setupScoringEnvironment() {
  // Create Event, Round, Question
  const event = await Event.create({ name: 'Championship', status: 'ACTIVE' });
  const round = await Round.create({ event: event._id, name: 'Round 1', order: 1, status: 'OPEN' });
  const question = await Question.create({
    round: round._id,
    title: 'Precision Riddle',
    description: 'What gets wetter as it dries?',
    type: 'RIDDLE',
    correctAnswer: 'a towel',
    points: 50,
    unlockOrder: 1
  });

  // Create Teammate 1
  const p1Res = await request(app)
    .post('/api/auth/register')
    .send({ name: 'Alice', email: 'alice@scoring.com', password: 'Password123!' });
  const token1 = p1Res.body.token;

  // Create Team
  const teamRes = await request(app)
    .post('/api/teams')
    .set('Authorization', `Bearer ${token1}`)
    .send({ name: 'Speedsters' });
  const team = teamRes.body.team;

  // Create Teammate 2 and join team
  const p2Res = await request(app)
    .post('/api/auth/register')
    .send({ name: 'Bob', email: 'bob@scoring.com', password: 'Password123!' });
  const token2 = p2Res.body.token;

  await request(app)
    .post('/api/teams/join')
    .set('Authorization', `Bearer ${token2}`)
    .send({ teamCode: team.teamCode });

  return { token1, token2, teamId: team._id, question, round };
}

describe('Scoring & Concurrency Tests (scoring.test.js)', () => {
  test('Correct answer awards points, incorrect awards 0 with retry allowed (EV-1, EV-2, D-7)', async () => {
    const { token1, teamId, question } = await setupScoringEnvironment();

    // 1. Submit incorrect answer
    const wrongRes = await request(app)
      .post('/api/submissions')
      .set('Authorization', `Bearer ${token1}`)
      .send({ questionId: question._id, answer: 'sponge' });

    expect(wrongRes.status).toBe(200);
    expect(wrongRes.body.isCorrect).toBe(false);
    expect(wrongRes.body.pointsAwarded).toBe(0);

    let teamDb = await Team.findById(teamId);
    expect(teamDb.totalScore).toBe(0);

    // 2. Retry with correct answer (case-insensitive + whitespace trimmed per D-9)
    const correctRes = await request(app)
      .post('/api/submissions')
      .set('Authorization', `Bearer ${token1}`)
      .send({ questionId: question._id, answer: '   A Towel  ' });

    expect(correctRes.status).toBe(200);
    expect(correctRes.body.isCorrect).toBe(true);
    expect(correctRes.body.pointsAwarded).toBe(50);

    teamDb = await Team.findById(teamId);
    expect(teamDb.totalScore).toBe(50);
    expect(teamDb.lastScoreUpdateAt).not.toBeNull();
  });

  test('Submitting already solved question awards 0 points and does not increment score (REL-2)', async () => {
    const { token1, teamId, question } = await setupScoringEnvironment();

    // First solve
    await request(app)
      .post('/api/submissions')
      .set('Authorization', `Bearer ${token1}`)
      .send({ questionId: question._id, answer: 'a towel' });

    // Second submission on same solved question
    const repeatRes = await request(app)
      .post('/api/submissions')
      .set('Authorization', `Bearer ${token1}`)
      .send({ questionId: question._id, answer: 'a towel' });

    expect(repeatRes.status).toBe(200);
    expect(repeatRes.body.isCorrect).toBe(true);
    expect(repeatRes.body.pointsAwarded).toBe(0);

    const teamDb = await Team.findById(teamId);
    expect(teamDb.totalScore).toBe(50); // Remained 50, not 100
  });

  test('Simulated concurrent duplicate submissions result in exactly ONE scoring event (REL-2)', async () => {
    const { token1, token2, teamId, question } = await setupScoringEnvironment();

    // Fire both teammates' correct submissions simultaneously in parallel
    const [res1, res2] = await Promise.all([
      request(app)
        .post('/api/submissions')
        .set('Authorization', `Bearer ${token1}`)
        .send({ questionId: question._id, answer: 'a towel' }),
      request(app)
        .post('/api/submissions')
        .set('Authorization', `Bearer ${token2}`)
        .send({ questionId: question._id, answer: 'a towel' })
    ]);

    expect(res1.status).toBe(200);
    expect(res2.status).toBe(200);

    // Sum of points awarded across the responses must equal 50 (one got 50, other got 0)
    const pointsSum = res1.body.pointsAwarded + res2.body.pointsAwarded;
    expect(pointsSum).toBe(50);

    // CRITICAL: Database total score must equal exactly question points (50), NEVER double (100)
    const teamDb = await Team.findById(teamId);
    expect(teamDb.totalScore).toBe(50);
  });
});
