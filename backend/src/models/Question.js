const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  round: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Round',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['MCQ', 'RIDDLE'],
    required: true
  },
  options: {
    type: [String],
    default: undefined // Only present for MCQ
  },
  correctAnswer: {
    type: String,
    required: true,
    trim: true
  },
  points: {
    type: Number,
    required: true,
    min: 0
  },
  unlockOrder: {
    type: Number,
    required: true,
    index: true
  }
});

module.exports = mongoose.model('Question', questionSchema);
