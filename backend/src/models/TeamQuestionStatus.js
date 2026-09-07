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
  solvedAt: {
    type: Date,
    default: Date.now
  }
});

// UNIQUE COMPOUND INDEX: { team: 1, question: 1 } -> REL-2 duplicate-scoring guard
teamQuestionStatusSchema.index({ team: 1, question: 1 }, { unique: true });

module.exports = mongoose.model('TeamQuestionStatus', teamQuestionStatusSchema);
