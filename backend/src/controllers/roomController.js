const Room = require('../models/Room');
const Session = require('../models/Session');
const logger = require('../utils/logger');

// Create a new room
const createRoom = async (req, res) => {
  try {
    const { name, description, isPrivate, settings, relatedTask, invitedUsers } = req.body;
    const userId = req.user._id;

    const participants = [
      { user: userId, role: 'moderator' },
      ...(Array.isArray(invitedUsers) ? invitedUsers.filter(id => id !== userId).map(id => ({ user: id, role: 'participant' })) : [])
    ];

    const room = new Room({
      name,
      description,
      owner: userId,
      isPrivate,
      settings,
      relatedTask,
      participants
    });

    await room.save();

    res.status(201).json({
      message: 'Room created successfully',
      room
    });
  } catch (error) {
    logger.error('Create room error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all rooms for a user
const getRooms = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const rooms = await Room.find({
      $or: [
        { owner: userId },
        { 'participants.user': userId }
      ]
    }).populate('owner', 'username email');

    res.json({ rooms });
  } catch (error) {
    logger.error('Get rooms error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get room by ID
const getRoomById = async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.user._id;

    const room = await Room.findOne({
      _id: roomId,
      $or: [
        { owner: userId },
        { 'participants.user': userId }
      ]
    }).populate('owner', 'username email')
      .populate('participants.user', 'username email');

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    res.json({ room });
  } catch (error) {
    logger.error('Get room by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Join room by invite code
const joinRoomByCode = async (req, res) => {
  try {
    const { inviteCode } = req.body;
    const userId = req.user._id;

    const room = await Room.findOne({ inviteCode, isActive: true });
    
    if (!room) {
      return res.status(404).json({ message: 'Invalid invite code' });
    }

    // Check if user is already a participant
    const isParticipant = room.participants.some(
      p => p.user.toString() === userId.toString()
    );

    if (isParticipant) {
      return res.status(400).json({ message: 'Already a participant in this room' });
    }

    // Add user as participant
    room.participants.push({
      user: userId,
      role: 'participant'
    });

    await room.save();

    res.json({
      message: 'Joined room successfully',
      room
    });
  } catch (error) {
    logger.error('Join room error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update room settings
const updateRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { name, description, settings, relatedTask } = req.body;
    const userId = req.user._id;

    const room = await Room.findOne({
      _id: roomId,
      owner: userId
    });

    if (!room) {
      return res.status(404).json({ message: 'Room not found or access denied' });
    }

    if (name) room.name = name;
    if (description !== undefined) room.description = description;
    if (settings) room.settings = { ...room.settings, ...settings };
    if (relatedTask !== undefined) room.relatedTask = relatedTask;

    await room.save();

    res.json({
      message: 'Room updated successfully',
      room
    });
  } catch (error) {
    logger.error('Update room error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete room
const deleteRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.user._id;

    const room = await Room.findOne({
      _id: roomId,
      owner: userId
    });

    if (!room) {
      return res.status(404).json({ message: 'Room not found or access denied' });
    }

    // Delete associated sessions
    await Session.deleteMany({ room: roomId });
    
    // Delete room
    await room.deleteOne();

    res.json({ message: 'Room deleted successfully' });
  } catch (error) {
    logger.error('Delete room error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Mock: Buscar tarefas externas (Consultmappr)
const getExternalTasks = async (req, res) => {
  // Simulação de tarefas externas
  const tasks = [
    { id: 'T-101', title: 'Implementar login social', status: 'To Do' },
    { id: 'T-102', title: 'Refatorar API de exportação', status: 'In Progress' },
    { id: 'T-103', title: 'Ajustar responsividade do dashboard', status: 'To Do' },
    { id: 'T-104', title: 'Criar testes automatizados', status: 'Review' },
    { id: 'T-105', title: 'Deploy contínuo', status: 'Done' }
  ];
  res.json({ tasks });
};

module.exports = {
  createRoom,
  getRooms,
  getRoomById,
  joinRoomByCode,
  updateRoom,
  deleteRoom,
  getExternalTasks
}; 