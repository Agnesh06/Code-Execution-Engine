const Event = require('../models/Event');

async function createEvent(req, res, next) {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({
        error: { code: 'BAD_REQUEST', message: 'Event name is required' }
      });
    }

    const event = await Event.create({
      name: name.trim(),
      status: 'DRAFT'
    });

    return res.status(201).json({ event });
  } catch (err) {
    next(err);
  }
}

async function startEvent(req, res, next) {
  try {
    const { id } = req.params;
    const event = await Event.findByIdAndUpdate(
      id,
      { status: 'ACTIVE' },
      { new: true }
    );

    if (!event) {
      return res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'Event not found' }
      });
    }

    return res.json({ event });
  } catch (err) {
    next(err);
  }
}

async function endEvent(req, res, next) {
  try {
    const { id } = req.params;
    const event = await Event.findByIdAndUpdate(
      id,
      { status: 'ENDED' },
      { new: true }
    );

    if (!event) {
      return res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'Event not found' }
      });
    }

    return res.json({ event });
  } catch (err) {
    next(err);
  }
}

async function getCurrentEvent(req, res, next) {
  try {
    // Return the active event, or fallback to the latest created event
    let event = await Event.findOne({ status: 'ACTIVE' });
    if (!event) {
      event = await Event.findOne().sort({ createdAt: -1 });
    }

    return res.json({ event });
  } catch (err) {
    next(err);
  }
}

module.exports = { createEvent, startEvent, endEvent, getCurrentEvent };
