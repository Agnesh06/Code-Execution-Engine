const Question = require('../models/Question');
const Round = require('../models/Round');
const Team = require('../models/Team');
const Submission = require('../models/Submission');
const { getCurrentQuestion } = require('../services/unlockService');
const { evaluate } = require('../services/evaluationService');
const { processSubmission } = require('../services/scoringService');

async function submitAnswer(req, res, next) {
  try {
    const { questionId, answer } = req.body;
    const user = req.user;

    if (!user.team) {
      return res.status(400).json({
        error: { code: 'NOT_ON_TEAM', message: 'User must belong to a team to submit answers' }
      });
    }

    if (!questionId || typeof answer !== 'string') {
      return res.status(400).json({
        error: { code: 'BAD_REQUEST', message: 'questionId and string answer are required' }
      });
    }

    const team = await Team.findById(user.team);
    if (!team) {
      return res.status(404).json({
        error: { code: 'TEAM_NOT_FOUND', message: 'Team not found' }
      });
    }

    const fullQuestion = await Question.findById(questionId);
    if (!fullQuestion) {
      return res.status(404).json({
        error: { code: 'QUESTION_NOT_FOUND', message: 'Question does not exist' }
      });
    }

    const round = await Round.findById(fullQuestion.round);
    if (!round || round.status !== 'OPEN') {
      return res.status(400).json({
        error: { code: 'ROUND_NOT_OPEN', message: 'Round is not open for submissions' }
      });
    }

    // Verify question is either currently unlocked OR already solved (PU-2, REL-2)
    const TeamQuestionStatus = require('../models/TeamQuestionStatus');
    const existingStatus = await TeamQuestionStatus.findOne({ team: team._id, question: questionId });
    const isAlreadySolved = existingStatus && existingStatus.status === 'SOLVED';

    const currentUnlocked = await getCurrentQuestion(team._id, round._id);
    const isCurrent = currentUnlocked && currentUnlocked._id.toString() === questionId.toString();

    if (!isCurrent && !isAlreadySolved) {
      return res.status(403).json({
        error: { code: 'QUESTION_LOCKED', message: 'Question is not currently unlocked for your team' }
      });
    }

    // Evaluate answer correctness
    const isCorrect = evaluate(fullQuestion, answer);

    // Process submission with atomic scoring and duplicate protection
    const result = await processSubmission({
      user,
      team,
      question: fullQuestion,
      answerText: answer,
      isCorrect
    });

    return res.json(result);
  } catch (err) {
    next(err);
  }
}

async function getMyTeamSubmissions(req, res, next) {
  try {
    if (!req.user.team) {
      return res.status(400).json({
        error: { code: 'NOT_ON_TEAM', message: 'User does not belong to a team' }
      });
    }

    const submissions = await Submission.find({ team: req.user.team })
      .populate('question', 'title type points unlockOrder')
      .populate('submittedBy', 'name email')
      .sort({ timestamp: -1 });

    return res.json({ submissions });
  } catch (err) {
    next(err);
  }
}

module.exports = { submitAnswer, getMyTeamSubmissions };
