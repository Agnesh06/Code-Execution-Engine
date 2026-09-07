const mongoose = require('mongoose');

const teamQuestionStatusSchema = new mongoose.Schema({
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true
  },
  question: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true
  },
  status: {
    type: String,
    enum: ['LOCKED', 'UNLOCKED', 'SOLVED'],
    default: 'UNLOCKED'
  },
  unlockedBy: {
    type: String,
    enum: ['AUTO', 'ADMIN_OVERRIDE'],
    default: 'AUTO'
  },
  unlockedAt: {
    type: Date,
    default: Date.now
  },
  solvedAt: {
    type: Date,
    default: null
  }
});

// Enforce single status record per (team, question) pair
teamQuestionStatusSchema.index({ team: 1, question: 1 }, { unique: true });

module.exports = mongoose.model('TeamQuestionStatus', teamQuestionStatusSchema);
