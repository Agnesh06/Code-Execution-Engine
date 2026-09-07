const mongoose = require('mongoose');

const roundSchema = new mongoose.Schema({
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  order: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['LOCKED', 'OPEN', 'CLOSED'],
    default: 'LOCKED'
  }
});

module.exports = mongoose.model('Round', roundSchema);
