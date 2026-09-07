const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const auth = require('../middleware/auth');

router.get('/current', auth, eventController.getCurrentEvent);

module.exports = router;
