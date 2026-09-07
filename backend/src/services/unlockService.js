const Question = require('../models/Question');
const TeamQuestionStatus = require('../models/TeamQuestionStatus');

/**
 * Get current unlocked question — unlockService.js (PU-1, PU-2, D-3)
 * Implements Section 9.1 core algorithm
 */
async function getCurrentQuestion(teamId, roundId) {
  // Fetch all questions for this round ordered sequentially by unlockOrder
  const questions = await Question.find({ round: roundId }).sort({ unlockOrder: 1 });
  if (!questions || questions.length === 0) {
    return null;
  }

  const questionIds = questions.map(q => q._id);

  // Fetch all solved questions for this team in this round
  const solved = await TeamQuestionStatus.find({
    team: teamId,
    question: { $in: questionIds }
  }).select('question');

  const solvedSet = new Set(solved.map(s => s.question.toString()));

  // Find first question in sequence that is not solved
  for (const q of questions) {
    if (!solvedSet.has(q._id.toString())) {
      const qObj = q.toObject();
      delete qObj.correctAnswer; // stripCorrectAnswer: never leak correctAnswer to participant
      return qObj;
    }
  }

  // All questions in this round solved
  return null;
}

module.exports = { getCurrentQuestion };
