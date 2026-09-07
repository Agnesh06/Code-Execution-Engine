const express = require('express');
const router = express.Router();
const teamController = require('../controllers/teamController');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');

router.post('/', auth, requireRole('PARTICIPANT'), teamController.createTeam);
router.post('/join', auth, requireRole('PARTICIPANT'), teamController.joinTeam);
router.get('/me', auth, requireRole('PARTICIPANT'), teamController.getMyTeam);

module.exports = router;
