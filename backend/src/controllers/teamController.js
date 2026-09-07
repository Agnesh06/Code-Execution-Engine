const Team = require('../models/Team');
const User = require('../models/User');
const generateTeamCode = require('../utils/generateTeamCode');

async function createTeam(req, res, next) {
  try {
    const { name } = req.body;
    const userId = req.user._id;

    if (!name || !name.trim()) {
      return res.status(400).json({
        error: { code: 'BAD_REQUEST', message: 'Team name is required' }
      });
    }

    // Check if user already on a team (D-2)
    if (req.user.team) {
      return res.status(409).json({
        error: { code: 'ALREADY_ON_TEAM', message: 'User is already part of a team' }
      });
    }

    // Generate unique team code with collision retry
    let teamCode = generateTeamCode(6);
    let attempts = 0;
    while (attempts < 5) {
      const existing = await Team.findOne({ teamCode });
      if (!existing) break;
      teamCode = generateTeamCode(6);
      attempts++;
    }

    const team = await Team.create({
      name: name.trim(),
      teamCode,
      members: [userId],
      totalScore: 0
    });

    // Link user to team
    await User.findByIdAndUpdate(userId, { team: team._id });
    req.user.team = team._id;

    const populatedTeam = await Team.findById(team._id).populate('members', 'name email');

    return res.status(201).json({ team: populatedTeam });
  } catch (err) {
    next(err);
  }
}

async function joinTeam(req, res, next) {
  try {
    const { teamCode } = req.body;
    const userId = req.user._id;

    if (!teamCode || !teamCode.trim()) {
      return res.status(400).json({
        error: { code: 'BAD_REQUEST', message: 'Team code is required' }
      });
    }

    // Check if user already on a team (D-2)
    if (req.user.team) {
      return res.status(409).json({
        error: { code: 'ALREADY_ON_TEAM', message: 'User is already part of a team' }
      });
    }

    const team = await Team.findOne({ teamCode: teamCode.trim().toUpperCase() });
    if (!team) {
      return res.status(404).json({
        error: { code: 'TEAM_NOT_FOUND', message: 'Invalid team code: Team not found' }
      });
    }

    // Add member if not already present
    if (!team.members.includes(userId)) {
      team.members.push(userId);
      await team.save();
    }

    // Link user to team
    await User.findByIdAndUpdate(userId, { team: team._id });
    req.user.team = team._id;

    const populatedTeam = await Team.findById(team._id).populate('members', 'name email');

    return res.json({ team: populatedTeam });
  } catch (err) {
    next(err);
  }
}

async function getMyTeam(req, res, next) {
  try {
    if (!req.user.team) {
      return res.status(404).json({
        error: { code: 'NOT_ON_TEAM', message: 'Participant does not belong to any team' }
      });
    }

    const team = await Team.findById(req.user.team).populate('members', 'name email');
    if (!team) {
      return res.status(404).json({
        error: { code: 'TEAM_NOT_FOUND', message: 'Team not found' }
      });
    }

    return res.json({ team });
  } catch (err) {
    next(err);
  }
}

async function getAllTeams(req, res, next) {
  try {
    const teams = await Team.find()
      .populate('members', 'name email')
      .sort({ totalScore: -1, createdAt: 1 });

    return res.json({ teams });
  } catch (err) {
    next(err);
  }
}

async function getTeamById(req, res, next) {
  try {
    const { id } = req.params;
    const team = await Team.findById(id).populate('members', 'name email');
    if (!team) {
      return res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'Team not found' }
      });
    }

    return res.json({ team });
  } catch (err) {
    next(err);
  }
}

async function removeTeamMember(req, res, next) {
  try {
    const { id, userId } = req.params;

    const team = await Team.findById(id);
    if (!team) {
      return res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'Team not found' }
      });
    }

    team.members = team.members.filter(m => m.toString() !== userId);
    await team.save();

    await User.findByIdAndUpdate(userId, { team: null });

    return res.json({ message: 'Member removed successfully', team });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createTeam,
  joinTeam,
  getMyTeam,
  getAllTeams,
  getTeamById,
  removeTeamMember
};
