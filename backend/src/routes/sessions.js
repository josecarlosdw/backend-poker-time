const express = require('express');
const { body } = require('express-validator');
const {
  createSession,
  getSessionsByRoom,
  getSessionById,
  submitVote,
  startVoting,
  revealVotes,
  completeSession
} = require('../controllers/sessionController');
const { auth } = require('../middleware/auth');
const validate = require('../middleware/validation');

const router = express.Router();

// Validation rules
const createSessionValidation = [
  body('title')
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters'),
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Description must be less than 1000 characters')
];

const submitVoteValidation = [
  body('card')
    .notEmpty()
    .withMessage('Card is required')
];

// All routes require authentication
router.use(auth);

// Routes
router.post('/', createSessionValidation, validate, createSession);
router.get('/room/:roomId', getSessionsByRoom);
router.get('/:sessionId', getSessionById);
router.post('/:sessionId/vote', submitVoteValidation, validate, submitVote);
router.post('/:sessionId/start', startVoting);
router.post('/:sessionId/reveal', revealVotes);
router.post('/:sessionId/complete', completeSession);

module.exports = router; 