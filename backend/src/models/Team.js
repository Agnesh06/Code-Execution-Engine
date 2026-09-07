const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  teamCode: {
    type: String,
    required: true,
    unique: true,
    index: true,
    uppercase: true,
    trim: true
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  totalScore: {
    type: Number,
    default: 0
  },
  lastScoreUpdateAt: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Team', teamSchema);
