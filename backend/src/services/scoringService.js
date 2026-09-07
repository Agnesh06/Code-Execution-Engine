const Team = require('../models/Team');
const Submission = require('../models/Submission');
const TeamQuestionStatus = require('../models/TeamQuestionStatus');
const { broadcastLeaderboard } = require('../sockets');

/**
 * Handles answer submission, atomic scoring, and audit logging.
 * Fulfills SU-1, EV-1, EV-2, REL-1, REL-2, D-7
 */
async function processSubmission({ user, team, question, answerText, isCorrect }) {
  const teamId = team._id;
  const questionId = question._id;
  const now = new Date();

  // If answer is incorrect, log attempt with 0 points and return
  if (!isCorrect) {
    const submission = await Submission.create({
      team: teamId,
      question: questionId,
      submittedBy: user._id,
      answer: answerText,
      isCorrect: false,
      pointsAwarded: 0,
      timestamp: now
    });

    return {
      isCorrect: false,
      pointsAwarded: 0,
      submissionId: submission._id
    };
  }

  // Answer is correct - Check if already solved
  const existingStatus = await TeamQuestionStatus.findOne({ team: teamId, question: questionId });
  if (existingStatus && existingStatus.status === 'SOLVED') {
    const submission = await Submission.create({
      team: teamId,
      question: questionId,
      submittedBy: user._id,
      answer: answerText,
      isCorrect: true,
      pointsAwarded: 0,
      timestamp: now
    });

    return {
      isCorrect: true,
      pointsAwarded: 0,
      alreadySolved: true,
      submissionId: submission._id
    };
  }

  let pointsAwarded = 0;

  // Atomic write ordering: Attempt to write/update TeamQuestionStatus FIRST
  try {
    const result = await TeamQuestionStatus.findOneAndUpdate(
      { team: teamId, question: questionId, status: { $ne: 'SOLVED' } },
      { 
        $set: { 
          status: 'SOLVED', 
          solvedAt: now 
        },
        $setOnInsert: {
          unlockedBy: 'AUTO',
          unlockedAt: now
        }
      },
      { upsert: true, new: true }
    );

    // If we reached here without duplicate key error, points can be awarded
    pointsAwarded = question.points;

    // Increment score atomically
    await Team.updateOne(
      { _id: teamId },
      {
        $inc: { totalScore: pointsAwarded },
        $set: { lastScoreUpdateAt: now }
      }
    );

    // Broadcast real-time leaderboard update
    await broadcastLeaderboard();
  } catch (err) {
    if (err.code === 11000) {
      // Caught race condition where concurrent request already inserted or updated status
      pointsAwarded = 0;
    } else {
      throw err;
    }
  }

  // Always log submission attempt
  const submission = await Submission.create({
    team: teamId,
    question: questionId,
    submittedBy: user._id,
    answer: answerText,
    isCorrect: true,
    pointsAwarded,
    timestamp: now
  });

  return {
    isCorrect: true,
    pointsAwarded,
    submissionId: submission._id
  };
}

module.exports = { processSubmission };
