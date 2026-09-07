require('dotenv').config();
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const { connectDB, disconnectDB } = require('../src/config/db');

const User = require('../src/models/User');
const Event = require('../src/models/Event');
const Round = require('../src/models/Round');
const Question = require('../src/models/Question');

async function seedDatabase() {
  const adminEmail = 'admin@example.com';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'ChangeMe123!';

  let admin = await User.findOne({ email: adminEmail });
  if (!admin) {
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    admin = await User.create({
      name: 'Tournament Admin',
      email: adminEmail,
      passwordHash,
      role: 'ADMIN'
    });
    console.log(`[Seed] Created ADMIN user: ${adminEmail}`);
  } else {
    console.log(`[Seed] ADMIN user already exists: ${adminEmail}`);
  }

  let event = await Event.findOne({ status: 'ACTIVE' });
  if (!event) {
    event = await Event.create({
      name: 'Grand Championship Quiz & Riddle Tournament 2026',
      status: 'ACTIVE'
    });
    console.log(`[Seed] Created ACTIVE event: ${event.name}`);
  } else {
    console.log(`[Seed] ACTIVE event exists: ${event.name}`);
  }

  let round = await Round.findOne({ event: event._id, order: 1 });
  if (!round) {
    round = await Round.create({
      event: event._id,
      name: 'Round 1: Speed & Logic',
      order: 1,
      status: 'OPEN'
    });
    console.log(`[Seed] Created OPEN Round 1: ${round.name}`);
  } else {
    console.log(`[Seed] Round 1 exists: ${round.name}`);
  }

  const questionCount = await Question.countDocuments({ round: round._id });
  if (questionCount === 0) {
    await Question.create([
      {
        round: round._id,
        title: 'Binary Foundations (MCQ)',
        description: 'What is the decimal equivalent of the 8-bit binary number 00101010?',
        type: 'MCQ',
        options: ['32', '42', '52', '64'],
        correctAnswer: '42',
        points: 10,
        unlockOrder: 1
      },
      {
        round: round._id,
        title: 'Algorithmic Riddle (RIDDLE)',
        description: 'I speak without a mouth and hear without ears. I have no body, but I come alive with wind. What am I?',
        type: 'RIDDLE',
        correctAnswer: 'an echo',
        points: 20,
        unlockOrder: 2
      },
      {
        round: round._id,
        title: 'Data Structures Mastery (MCQ)',
        description: 'Which data structure operates on a Last-In, First-Out (LIFO) basis?',
        type: 'MCQ',
        options: ['Queue', 'Stack', 'Linked List', 'Binary Tree'],
        correctAnswer: 'Stack',
        points: 30,
        unlockOrder: 3
      }
    ]);
    console.log('[Seed] Created 3 initial questions (2 MCQ, 1 RIDDLE)');
  } else {
    console.log(`[Seed] Questions already seeded (${questionCount} questions found)`);
  }
}

async function runStandalone() {
  try {
    await connectDB();
    console.log('[Seed] Starting database seed...');
    await seedDatabase();
    console.log('[Seed] Database seeding completed successfully.');
  } catch (err) {
    console.error('[Seed] Error during seed:', err);
    process.exit(1);
  } finally {
    await disconnectDB();
  }
}

if (require.main === module) {
  runStandalone();
}

module.exports = { seedDatabase };
