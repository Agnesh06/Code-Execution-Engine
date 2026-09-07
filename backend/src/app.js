const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const teamRoutes = require('./routes/teamRoutes');
const eventRoutes = require('./routes/eventRoutes');
const roundRoutes = require('./routes/roundRoutes');
const questionRoutes = require('./routes/questionRoutes');
const submissionRoutes = require('./routes/submissionRoutes');
const leaderboardRoutes = require('./routes/leaderboardRoutes');
const adminRoutes = require('./routes/adminRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/rounds', roundRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/admin', adminRoutes);

// Centralized error handling
app.use(errorHandler);

module.exports = app;
