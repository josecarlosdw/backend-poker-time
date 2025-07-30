const express = require('express');
const { body } = require('express-validator');
const {
  createRoom,
  getRooms,
  getRoomById,
  joinRoomByCode,
  updateRoom,
  deleteRoom,
  getExternalTasks
} = require('../controllers/roomController');
const { auth } = require('../middleware/auth');
const validate = require('../middleware/validation');

const router = express.Router();

// Validation rules
const createRoomValidation = [
  body('name')
    .isLength({ min: 3, max: 100 })
    .withMessage('Room name must be between 3 and 100 characters'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters')
];

const joinRoomValidation = [
  body('inviteCode')
    .isLength({ min: 6, max: 6 })
    .withMessage('Invite code must be 6 characters long')
];

// All routes require authentication
router.use(auth);

// Routes
router.post('/', createRoomValidation, validate, createRoom);
router.get('/', getRooms);
router.get('/tasks', getExternalTasks);
router.get('/:roomId', getRoomById);
router.post('/join', joinRoomValidation, validate, joinRoomByCode);
router.put('/:roomId', createRoomValidation, validate, updateRoom);
router.delete('/:roomId', deleteRoom);

module.exports = router; 