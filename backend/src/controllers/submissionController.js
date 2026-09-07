const Question = require('../models/Question');
const Round = require('../models/Round');
const Team = require('../models/Team');
const Submission = require('../models/Submission');
const TeamQuestionStatus = require('../models/TeamQuestionStatus');
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

    // Verify question is currently unlocked OR already solved (PU-2, REL-2)
    const existingSolved = await TeamQuestionStatus.findOne({ team: team._id, question: questionId });
    if (!existingSolved) {
      const currentUnlocked = await getCurrentQuestion(team._id, round._id);
      const isCurrent = currentUnlocked && currentUnlocked._id.toString() === questionId.toString();

      if (!isCurrent) {
        const justSolved = await TeamQuestionStatus.findOne({ team: team._id, question: questionId });
        if (!justSolved) {
          return res.status(403).json({
            error: { code: 'QUESTION_LOCKED', message: 'Question is not currently unlocked for your team' }
          });
        }
      }
    }

    // Evaluate answer correctness (EV-1, EV-2, D-9)
    const isCorrect = evaluate(fullQuestion, answer);

    // Process submission with atomic scoring and duplicate protection (REL-1, REL-2)
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

async function getAdminSubmissions(req, res, next) {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, parseInt(req.query.limit) || 20);
    const { team, question } = req.query;

    const query = {};
    if (team) query.team = team;
    if (question) query.question = question;

    const total = await Submission.countDocuments(query);
    const submissions = await Submission.find(query)
      .populate('team', 'name teamCode')
      .populate('question', 'title type points')
      .populate('submittedBy', 'name email')
      .sort({ timestamp: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return res.json({
      submissions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    next(err);
  }
}

async function getTeamProgress(req, res, next) {
  try {
    const { id: teamId } = req.params;

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'Team not found' }
      });
    }

    const solvedList = await TeamQuestionStatus.find({ team: teamId })
      .populate('question', 'title type points unlockOrder round');

    const submissionsCount = await Submission.countDocuments({ team: teamId });
    const correctCount = await Submission.countDocuments({ team: teamId, isCorrect: true });

    return res.json({
      team: {
        id: team._id,
        name: team.name,
        score: team.totalScore,
        lastScoreUpdateAt: team.lastScoreUpdateAt
      },
      questionStatuses: solvedList,
      stats: {
        totalSubmissions: submissionsCount,
        correctSubmissions: correctCount
      }
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  submitAnswer,
  getMyTeamSubmissions,
  getAdminSubmissions,
  getTeamProgress
};
