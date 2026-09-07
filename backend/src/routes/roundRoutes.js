const express = require('express');
const router = express.Router();
const roundController = require('../controllers/roundController');
const auth = require('../middleware/auth');

router.get('/current', auth, roundController.getCurrentRound);

module.exports = router;
