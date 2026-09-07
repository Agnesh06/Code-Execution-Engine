const express = require('express');
const router = express.Router();
const questionController = require('../controllers/questionController');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');

router.get('/current', auth, requireRole('PARTICIPANT'), questionController.getCurrentUnlockedQuestion);

module.exports = router;
