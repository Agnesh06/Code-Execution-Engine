const express = require('express');
const router = express.Router();
const submissionController = require('../controllers/submissionController');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');

router.post('/', auth, requireRole('PARTICIPANT'), submissionController.submitAnswer);
router.get('/me/submissions', auth, requireRole('PARTICIPANT'), submissionController.getMyTeamSubmissions);

module.exports = router;
