const Round = require('../models/Round');
const Event = require('../models/Event');

async function createRound(req, res, next) {
  try {
    const { eventId, name, order } = req.body;

    if (!eventId || !name || order === undefined) {
      return res.status(400).json({
        error: { code: 'BAD_REQUEST', message: 'eventId, name, and order are required' }
      });
    }

    const round = await Round.create({
      event: eventId,
      name: name.trim(),
      order: Number(order),
      status: 'LOCKED'
    });

    return res.status(201).json({ round });
  } catch (err) {
    next(err);
  }
}

async function openRound(req, res, next) {
  try {
    const { id } = req.params;

    const round = await Round.findByIdAndUpdate(
      id,
      { status: 'OPEN' },
      { new: true }
    );

    if (!round) {
      return res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'Round not found' }
      });
    }

    return res.json({ round });
  } catch (err) {
    next(err);
  }
}

async function closeRound(req, res, next) {
  try {
    const { id } = req.params;

    const round = await Round.findByIdAndUpdate(
      id,
      { status: 'CLOSED' },
      { new: true }
    );

    if (!round) {
      return res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'Round not found' }
      });
    }

    return res.json({ round });
  } catch (err) {
    next(err);
  }
}

async function getCurrentRound(req, res, next) {
  try {
    // Find active event first
    let activeEvent = await Event.findOne({ status: 'ACTIVE' });
    let query = { status: 'OPEN' };
    if (activeEvent) {
      query.event = activeEvent._id;
    }

    let round = await Round.findOne(query).sort({ order: 1 });
    if (!round) {
      // Fallback: any open round
      round = await Round.findOne({ status: 'OPEN' }).sort({ order: 1 });
    }

    return res.json({ round });
  } catch (err) {
    next(err);
  }
}

module.exports = { createRound, openRound, closeRound, getCurrentRound };
