const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');

const eventController = require('../controllers/eventController');
const roundController = require('../controllers/roundController');
const questionController = require('../controllers/questionController');
const adminController = require('../controllers/adminController');

// All admin routes are strictly guarded by auth and ADMIN role (SEC-1, SEC-2, AR-3)
router.use(auth, requireRole('ADMIN'));

// Events
router.post('/events', eventController.createEvent);
router.post('/events/:id/start', eventController.startEvent);
router.post('/events/:id/end', eventController.endEvent);

// Rounds
router.get('/rounds', roundController.getAdminRounds);
router.post('/rounds', roundController.createRound);
router.post('/rounds/:id/open', roundController.openRound);
router.post('/rounds/:id/close', roundController.closeRound);

// Questions
router.post('/questions', questionController.createQuestion);
router.put('/questions/:id', questionController.updateQuestion);
router.delete('/questions/:id', questionController.deleteQuestion);
router.get('/questions', questionController.getAdminQuestions);

// Teams & Manual Unlock
router.get('/teams', adminController.getAllTeams);
router.get('/teams/:id', adminController.getTeamById);
router.delete('/teams/:id/members/:userId', adminController.removeTeamMember);
router.post('/teams/:id/unlock', adminController.manualUnlockQuestion); // Manual question unlock (RC-3, S16)
router.get('/teams/:id/progress', adminController.getTeamProgress);

// Submissions monitoring
router.get('/submissions', adminController.getAdminSubmissions);

module.exports = router;
