const express = require('express');
const router = express.Router();
const teamController = require('../controllers/teamController');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');

const submissionController = require('../controllers/submissionController');

router.post('/', auth, requireRole('PARTICIPANT'), teamController.createTeam);
router.post('/join', auth, requireRole('PARTICIPANT'), teamController.joinTeam);
router.get('/me', auth, requireRole('PARTICIPANT'), teamController.getMyTeam);
router.get('/me/submissions', auth, requireRole('PARTICIPANT'), submissionController.getMyTeamSubmissions);

module.exports = router;
