const Team = require('../models/Team');
const Submission = require('../models/Submission');
const TeamQuestionStatus = require('../models/TeamQuestionStatus');
const { broadcastLeaderboard } = require('../sockets');

/**
 * Handles answer submission, atomic scoring, and audit logging.
 * Fulfills SU-1, EV-1, EV-2, REL-1, REL-2, D-7
 * Implements Section 9.2
 */
async function processSubmission({ user, team, question, answerText, isCorrect }) {
  const teamId = team._id;
  const questionId = question._id;
  const now = new Date();
  let pointsAwarded = 0;

  if (isCorrect) {
    try {
      // Atomic guard — DB unique index on (team, question) rejects duplicates (REL-2)
      await TeamQuestionStatus.create({
        team: teamId,
        question: questionId,
        solvedAt: now
      });

      pointsAwarded = question.points;

      // Increment score atomically
      await Team.updateOne(
        { _id: teamId },
        {
          $inc: { totalScore: pointsAwarded },
          $set: { lastScoreUpdateAt: now }
        }
      );

      // Broadcast real-time leaderboard update (RT-1)
      await broadcastLeaderboard();
    } catch (err) {
      if (err.code === 11000) {
        // Another concurrent request already scored this team+question — do nothing (REL-2)
        pointsAwarded = 0;
      } else {
        throw err;
      }
    }
  }

  // Always log the attempt (SU-1), regardless of outcome
  const submission = await Submission.create({
    team: teamId,
    question: questionId,
    submittedBy: user._id,
    answer: answerText,
    isCorrect,
    pointsAwarded,
    timestamp: now
  });

  return {
    isCorrect,
    pointsAwarded,
    submissionId: submission._id
  };
}

module.exports = { processSubmission };
