const Team = require('../models/Team');

/**
 * Calculates real-time leaderboard rankings with tie-breaker logic.
 * Fulfills LB-1, LB-2, LB-3, LB-4, D-6
 */
async function getLeaderboard() {
  const teams = await Team.find()
    .sort({
      totalScore: -1,
      lastScoreUpdateAt: 1,
      createdAt: 1
    })
    .select('name totalScore lastScoreUpdateAt');

  return teams.map((t, index) => ({
    rank: index + 1,
    teamId: t._id,
    teamName: t.name,
    score: t.totalScore,
    lastScoreUpdateAt: t.lastScoreUpdateAt
  }));
}

module.exports = { getLeaderboard };
