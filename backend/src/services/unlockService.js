const Question = require('../models/Question');
const TeamQuestionStatus = require('../models/TeamQuestionStatus');

/**
 * Resolves the currently unlocked question for a given team within a round.
 * Fulfills PU-1, PU-2, D-3, D-5, S16
 */
async function getCurrentQuestion(teamId, roundId) {
  // Fetch all questions for this round ordered sequentially
  const questions = await Question.find({ round: roundId }).sort({ unlockOrder: 1 });
  if (!questions || questions.length === 0) {
    return null;
  }

  const questionIds = questions.map(q => q._id);

  // Fetch all recorded status entries for this team in this round
  const statuses = await TeamQuestionStatus.find({
    team: teamId,
    question: { $in: questionIds }
  });

  const statusMap = new Map();
  statuses.forEach(s => {
    statusMap.set(s.question.toString(), s);
  });

  // 1. Check if there is an explicitly UNLOCKED question that hasn't been SOLVED
  for (const q of questions) {
    const qId = q._id.toString();
    const st = statusMap.get(qId);
    if (st && st.status === 'UNLOCKED') {
      const qObj = q.toObject();
      delete qObj.correctAnswer;
      return qObj;
    }
  }

  // 2. Otherwise find the first question in sequence that is NOT solved
  for (const q of questions) {
    const qId = q._id.toString();
    const st = statusMap.get(qId);
    if (!st || st.status !== 'SOLVED') {
      const qObj = q.toObject();
      delete qObj.correctAnswer;
      return qObj;
    }
  }

  // All questions in this round are solved
  return null;
}

module.exports = { getCurrentQuestion };
