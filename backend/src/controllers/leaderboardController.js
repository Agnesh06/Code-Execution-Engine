const { getLeaderboard } = require('../services/leaderboardService');

async function getLeaderboardHandler(req, res, next) {
  try {
    const leaderboard = await getLeaderboard();
    return res.json({ leaderboard });
  } catch (err) {
    next(err);
  }
}

module.exports = { getLeaderboardHandler };
