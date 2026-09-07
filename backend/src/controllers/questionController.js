const Question = require('../models/Question');
const Round = require('../models/Round');
const Event = require('../models/Event');
const { getCurrentQuestion } = require('../services/unlockService');

async function createQuestion(req, res, next) {
  try {
    const { roundId, title, description, type, options, correctAnswer, points, unlockOrder } = req.body;

    if (!roundId || !title || !description || !type || !correctAnswer || points === undefined || unlockOrder === undefined) {
      return res.status(400).json({
        error: { code: 'BAD_REQUEST', message: 'Missing required question fields' }
      });
    }

    if (!['MCQ', 'RIDDLE'].includes(type)) {
      return res.status(400).json({
        error: { code: 'INVALID_TYPE', message: 'Type must be MCQ or RIDDLE' }
      });
    }

    if (type === 'MCQ' && (!Array.isArray(options) || options.length < 2)) {
      return res.status(400).json({
        error: { code: 'INVALID_OPTIONS', message: 'MCQ questions require an array of at least 2 options' }
      });
    }

    const question = await Question.create({
      round: roundId,
      title: title.trim(),
      description: description.trim(),
      type,
      options: type === 'MCQ' ? options.map(o => String(o).trim()) : undefined,
      correctAnswer: correctAnswer.trim(),
      points: Number(points),
      unlockOrder: Number(unlockOrder)
    });

    return res.status(201).json({ question });
  } catch (err) {
    next(err);
  }
}

async function updateQuestion(req, res, next) {
  try {
    const { id } = req.params;
    const { title, description, type, options, correctAnswer, points, unlockOrder, roundId } = req.body;

    const updateData = {};
    if (title) updateData.title = title.trim();
    if (description) updateData.description = description.trim();
    if (type) updateData.type = type;
    if (options && type === 'MCQ') updateData.options = options.map(o => String(o).trim());
    if (correctAnswer) updateData.correctAnswer = correctAnswer.trim();
    if (points !== undefined) updateData.points = Number(points);
    if (unlockOrder !== undefined) updateData.unlockOrder = Number(unlockOrder);
    if (roundId) updateData.round = roundId;

    const question = await Question.findByIdAndUpdate(id, updateData, { new: true });
    if (!question) {
      return res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'Question not found' }
      });
    }

    return res.json({ question });
  } catch (err) {
    next(err);
  }
}

async function deleteQuestion(req, res, next) {
  try {
    const { id } = req.params;
    const question = await Question.findByIdAndDelete(id);
    if (!question) {
      return res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'Question not found' }
      });
    }

    return res.json({ message: 'Question deleted successfully', id });
  } catch (err) {
    next(err);
  }
}

async function getAdminQuestions(req, res, next) {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, parseInt(req.query.limit) || 20);
    const roundId = req.query.roundId;

    const query = {};
    if (roundId) query.round = roundId;

    const total = await Question.countDocuments(query);
    const questions = await Question.find(query)
      .populate('round', 'name order status')
      .sort({ round: 1, unlockOrder: 1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return res.json({
      questions,
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

async function getCurrentUnlockedQuestion(req, res, next) {
  try {
    if (!req.user.team) {
      return res.status(400).json({
        error: { code: 'NOT_ON_TEAM', message: 'User must be part of a team to access questions' }
      });
    }

    // Determine current open round
    let round = await Round.findOne({ status: 'OPEN' }).sort({ order: 1 });
    if (!round) {
      return res.status(400).json({
        error: { code: 'NO_OPEN_ROUND', message: 'There is currently no active open round' }
      });
    }

    const question = await getCurrentQuestion(req.user.team, round._id);

    if (!question) {
      return res.json({
        question: null,
        message: 'All questions in this round are completed!',
        roundComplete: true
      });
    }

    return res.json({ question });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createQuestion,
  updateQuestion,
  deleteQuestion,
  getAdminQuestions,
  getCurrentUnlockedQuestion
};
