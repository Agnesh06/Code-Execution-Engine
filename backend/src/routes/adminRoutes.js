const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');

const eventController = require('../controllers/eventController');
const roundController = require('../controllers/roundController');
const questionController = require('../controllers/questionController');
const teamController = require('../controllers/teamController');
const submissionController = require('../controllers/submissionController');

// All admin routes are strictly guarded by auth and ADMIN role (SEC-1, SEC-2, AR-3)
router.use(auth, requireRole('ADMIN'));

// Events (FR-5, S20)
router.post('/events', eventController.createEvent);
router.post('/events/:id/start', eventController.startEvent);
router.post('/events/:id/end', eventController.endEvent);

// Rounds (FR-13, RC-1, RC-2)
router.post('/rounds', roundController.createRound);
router.post('/rounds/:id/open', roundController.openRound);
router.post('/rounds/:id/close', roundController.closeRound);

// Questions (FR-10, QR-2)
router.post('/questions', questionController.createQuestion);
router.put('/questions/:id', questionController.updateQuestion);
router.delete('/questions/:id', questionController.deleteQuestion);
router.get('/questions', questionController.getAdminQuestions);

// Teams (FR-12)
router.get('/teams', teamController.getAllTeams);
router.get('/teams/:id', teamController.getTeamById);
router.delete('/teams/:id/members/:userId', teamController.removeTeamMember);

// Submissions monitoring & team progress (FR-11, SM-1, SM-2)
router.get('/submissions', submissionController.getAdminSubmissions);
router.get('/teams/:id/progress', submissionController.getTeamProgress);

module.exports = router;
