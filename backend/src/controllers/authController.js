const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        error: { code: 'BAD_REQUEST', message: 'Name, email, and password are required' }
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        error: { code: 'INVALID_PASSWORD', message: 'Password must be at least 8 characters long' }
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(409).json({
        error: { code: 'EMAIL_ALREADY_IN_USE', message: 'A user with this email already exists' }
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      role: 'PARTICIPANT' // D-1: Public registration only creates PARTICIPANT
    });

    const secret = process.env.JWT_SECRET || 'supersecretjwtkey_quizplatform_2026_secure';
    const token = jwt.sign(
      { sub: user._id, role: user.role, teamId: null },
      secret,
      { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
    );

    return res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        team: null
      }
    });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: { code: 'BAD_REQUEST', message: 'Email and password are required' }
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).populate('team');
    if (!user) {
      return res.status(401).json({
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' }
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' }
      });
    }

    const secret = process.env.JWT_SECRET || 'supersecretjwtkey_quizplatform_2026_secure';
    const token = jwt.sign(
      { sub: user._id, role: user.role, teamId: user.team ? user.team._id : null },
      secret,
      { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
    );

    return res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        team: user.team
      }
    });
  } catch (err) {
    next(err);
  }
}

async function me(req, res, next) {
  try {
    const user = await User.findById(req.user._id).select('-passwordHash').populate('team');
    return res.json({ user });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, me };
