const Team = require('../models/Team');
const User = require('../models/User');
const Question = require('../models/Question');
const Submission = require('../models/Submission');
const TeamQuestionStatus = require('../models/TeamQuestionStatus');

async function getAllTeams(req, res, next) {
  try {
    const teams = await Team.find()
      .populate('members', 'name email')
      .sort({ totalScore: -1, createdAt: 1 });

    return res.json({ teams });
  } catch (err) {
    next(err);
  }
}

async function getTeamById(req, res, next) {
  try {
    const { id } = req.params;
    const team = await Team.findById(id).populate('members', 'name email');
    if (!team) {
      return res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'Team not found' }
      });
    }

    return res.json({ team });
  } catch (err) {
    next(err);
  }
}

async function removeTeamMember(req, res, next) {
  try {
    const { id, userId } = req.params;

    const team = await Team.findById(id);
    if (!team) {
      return res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'Team not found' }
      });
    }

    team.members = team.members.filter(m => m.toString() !== userId);
    await team.save();

    await User.findByIdAndUpdate(userId, { team: null });

    return res.json({ message: 'Member removed successfully', team });
  } catch (err) {
    next(err);
  }
}

/**
 * Manual Question Unlock for a specific Team (RC-3, S16)
 * Unlocks a question without scoring or marking it as SOLVED
 */
async function manualUnlockQuestion(req, res, next) {
  try {
    const { id: teamId } = req.params;
    const { questionId } = req.body;

    if (!questionId) {
      return res.status(400).json({
        error: { code: 'BAD_REQUEST', message: 'questionId is required' }
      });
    }

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'Team not found' }
      });
    }

    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'Question not found' }
      });
    }

    // Upsert TeamQuestionStatus with status UNLOCKED and unlockedBy ADMIN_OVERRIDE
    // (Only if not already SOLVED)
    const existing = await TeamQuestionStatus.findOne({ team: teamId, question: questionId });
    if (existing && existing.status === 'SOLVED') {
      return res.status(400).json({
        error: { code: 'ALREADY_SOLVED', message: 'This question has already been solved by the team' }
      });
    }

    const statusRecord = await TeamQuestionStatus.findOneAndUpdate(
      { team: teamId, question: questionId },
      {
        $set: {
          status: 'UNLOCKED',
          unlockedBy: 'ADMIN_OVERRIDE',
          unlockedAt: new Date()
        }
      },
      { upsert: true, new: true }
    );

    return res.json({
      message: 'Question manually unlocked for team',
      teamId,
      questionId,
      statusRecord
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

    const statuses = await TeamQuestionStatus.find({ team: teamId })
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
      questionStatuses: statuses,
      stats: {
        totalSubmissions: submissionsCount,
        correctSubmissions: correctCount
      }
    });
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

module.exports = {
  getAllTeams,
  getTeamById,
  removeTeamMember,
  manualUnlockQuestion,
  getTeamProgress,
  getAdminSubmissions
};
