const request = require('supertest');
const app = require('../src/app');
const { setupTestDB, teardownTestDB, clearTestDB } = require('./setup');
const User = require('../src/models/User');
const Event = require('../src/models/Event');
const Round = require('../src/models/Round');
const Question = require('../src/models/Question');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

beforeAll(async () => {
  await setupTestDB();
});

afterAll(async () => {
  await teardownTestDB();
});

afterEach(async () => {
  await clearTestDB();
});

async function setupFixtures() {
  // 1. Create Admin
  const adminPass = await bcrypt.hash('AdminPassword123!', 10);
  const admin = await User.create({
    name: 'Admin Test',
    email: 'admin@test.com',
    passwordHash: adminPass,
    role: 'ADMIN'
  });
  const adminToken = jwt.sign(
    { sub: admin._id, role: admin.role },
    process.env.JWT_SECRET || 'supersecretjwtkey_quizplatform_2026_secure'
  );

  // 2. Create Event & Open Round
  const event = await Event.create({ name: 'Winter Championship', status: 'ACTIVE' });
  const round = await Round.create({ event: event._id, name: 'Round 1', order: 1, status: 'OPEN' });

  // 3. Create Questions (unlockOrder 1, 2)
  const q1 = await Question.create({
    round: round._id,
    title: 'Question 1',
    description: 'Solve first',
    type: 'MCQ',
    options: ['A', 'B'],
    correctAnswer: 'A',
    points: 10,
    unlockOrder: 1
  });

  const q2 = await Question.create({
    round: round._id,
    title: 'Question 2',
    description: 'Solve second',
    type: 'RIDDLE',
    correctAnswer: 'secret',
    points: 20,
    unlockOrder: 2
  });

  // 4. Create Participant with Team
  const regRes = await request(app)
    .post('/api/auth/register')
    .send({ name: 'Hero', email: 'hero@test.com', password: 'Password123!' });
  const partToken = regRes.body.token;

  const teamRes = await request(app)
    .post('/api/teams')
    .set('Authorization', `Bearer ${partToken}`)
    .send({ name: 'Team Hero' });
  const team = teamRes.body.team;

  return { adminToken, partToken, team, q1, q2, round };
}

describe('Progressive Unlock Tests (unlock.test.js)', () => {
  test('Question 2 is hidden until Question 1 is solved (PU-1, PU-2)', async () => {
    const { partToken, q1, q2 } = await setupFixtures();

    // Initial query: should return Question 1
    const initialRes = await request(app)
      .get('/api/questions/current')
      .set('Authorization', `Bearer ${partToken}`);

    expect(initialRes.status).toBe(200);
    expect(initialRes.body.question).toBeDefined();
    expect(initialRes.body.question._id).toBe(q1._id.toString());
    // Ensure correctAnswer is stripped (SEC-18)
    expect(initialRes.body.question.correctAnswer).toBeUndefined();

    // Attempting to submit Question 2 while Question 1 is still unlocked should be 403 Forbidden
    const invalidSubRes = await request(app)
      .post('/api/submissions')
      .set('Authorization', `Bearer ${partToken}`)
      .send({ questionId: q2._id, answer: 'secret' });

    expect(invalidSubRes.status).toBe(403);
    expect(invalidSubRes.body.error.code).toBe('QUESTION_LOCKED');

    // Submit correct answer to Question 1
    const validSubRes = await request(app)
      .post('/api/submissions')
      .set('Authorization', `Bearer ${partToken}`)
      .send({ questionId: q1._id, answer: 'A' });

    expect(validSubRes.status).toBe(200);
    expect(validSubRes.body.isCorrect).toBe(true);

    // Re-query current question: should now return Question 2
    const nextRes = await request(app)
      .get('/api/questions/current')
      .set('Authorization', `Bearer ${partToken}`);

    expect(nextRes.status).toBe(200);
    expect(nextRes.body.question._id).toBe(q2._id.toString());
    expect(nextRes.body.question.correctAnswer).toBeUndefined();
  });

  test('When all questions in a round are solved, returns roundComplete: true (PU-1, PU-2, Section 14)', async () => {
    const { partToken, q1, q2 } = await setupFixtures();

    // Solve Question 1
    await request(app)
      .post('/api/submissions')
      .set('Authorization', `Bearer ${partToken}`)
      .send({ questionId: q1._id, answer: 'A' });

    // Solve Question 2
    await request(app)
      .post('/api/submissions')
      .set('Authorization', `Bearer ${partToken}`)
      .send({ questionId: q2._id, answer: 'secret' });

    // Query current question after all solved
    const finalRes = await request(app)
      .get('/api/questions/current')
      .set('Authorization', `Bearer ${partToken}`);

    expect(finalRes.status).toBe(200);
    expect(finalRes.body.question).toBeNull();
    expect(finalRes.body.roundComplete).toBe(true);
  });
});
