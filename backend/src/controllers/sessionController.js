const Session = require('../models/Session');
const Room = require('../models/Room');
const logger = require('../utils/logger');

// Create a new session
const createSession = async (req, res) => {
  try {
    const { roomId, title, description } = req.body;
    const userId = req.user._id;

    // Check if user has access to the room
    const room = await Room.findOne({
      _id: roomId,
      $or: [
        { owner: userId },
        { 'participants.user': userId }
      ]
    });

    if (!room) {
      return res.status(404).json({ message: 'Room not found or access denied' });
    }

    const session = new Session({
      room: roomId,
      title,
      description,
      createdBy: userId
    });

    await session.save();

    res.status(201).json({
      message: 'Session created successfully',
      session
    });
  } catch (error) {
    logger.error('Create session error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get sessions for a room
const getSessionsByRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.user._id;

    // Check if user has access to the room
    const room = await Room.findOne({
      _id: roomId,
      $or: [
        { owner: userId },
        { 'participants.user': userId }
      ]
    });

    if (!room) {
      return res.status(404).json({ message: 'Room not found or access denied' });
    }

    const sessions = await Session.find({ room: roomId })
      .populate('createdBy', 'username')
      .sort({ createdAt: -1 });

    // Adicionar relatedTask do Room em cada sessão
    const relatedTask = room.relatedTask || null;
    const sessionsSanitized = sessions.map(session => {
      const s = session.toObject();
      s.relatedTask = relatedTask;
      if (session.status !== 'revealed') {
        s.votes = session.votes.map(vote => ({ user: vote.user, votedAt: vote.votedAt }));
      }
      return s;
    });

    res.json({ sessions: sessionsSanitized });
  } catch (error) {
    logger.error('Get sessions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get session by ID
const getSessionById = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user._id;

    const session = await Session.findById(sessionId)
      .populate('room')
      .populate('createdBy', 'username')
      .populate('votes.user', 'username');

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    // Check if user has access to the room
    const room = await Room.findOne({
      _id: session.room._id,
      $or: [
        { owner: userId },
        { 'participants.user': userId }
      ]
    });

    if (!room) {
      return res.status(404).json({ message: 'Access denied' });
    }

    // Ocultar votos se status não for 'revealed'
    let sessionSanitized = session;
    if (session.status !== 'revealed') {
      sessionSanitized = session.toObject();
      sessionSanitized.votes = sessionSanitized.votes.map(vote => ({ user: vote.user, votedAt: vote.votedAt }));
    }

    res.json({ session: sessionSanitized });
  } catch (error) {
    logger.error('Get session by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Submit a vote
const submitVote = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { card } = req.body;
    const userId = req.user._id;

    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    if (session.status !== 'voting') {
      return res.status(400).json({ message: 'Session is not in voting mode' });
    }

    // Check if user already voted
    const existingVote = session.votes.find(
      vote => vote.user.toString() === userId.toString()
    );

    if (existingVote) {
      // Update existing vote
      existingVote.card = card;
      existingVote.votedAt = new Date();
    } else {
      // Add new vote
      session.votes.push({
        user: userId,
        card,
        votedAt: new Date()
      });
    }

    await session.save();

    res.json({
      message: 'Vote submitted successfully',
      session
    });
  } catch (error) {
    logger.error('Submit vote error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Start voting
const startVoting = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user._id;

    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    // Check if user is moderator or owner
    const room = await Room.findOne({
      _id: session.room,
      $or: [
        { owner: userId },
        { 'participants.user': userId, 'participants.role': 'moderator' }
      ]
    });

    if (!room) {
      return res.status(403).json({ message: 'Access denied. Moderator only.' });
    }

    session.status = 'voting';
    await session.save();

    res.json({
      message: 'Voting started',
      session
    });
  } catch (error) {
    logger.error('Start voting error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Reveal votes
const revealVotes = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user._id;

    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    // Check if user is moderator or owner
    const room = await Room.findOne({
      _id: session.room,
      $or: [
        { owner: userId },
        { 'participants.user': userId, 'participants.role': 'moderator' }
      ]
    });

    if (!room) {
      return res.status(403).json({ message: 'Access denied. Moderator only.' });
    }

    session.status = 'revealed';
    session.endedAt = new Date();
    await session.save();

    res.json({
      message: 'Votes revealed',
      session
    });
  } catch (error) {
    logger.error('Reveal votes error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Complete session
const completeSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user._id;

    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    // Check if user is moderator or owner
    const room = await Room.findOne({
      _id: session.room,
      $or: [
        { owner: userId },
        { 'participants.user': userId, 'participants.role': 'moderator' }
      ]
    });

    if (!room) {
      return res.status(403).json({ message: 'Access denied. Moderator only.' });
    }

    session.status = 'completed';
    await session.save();

    res.json({
      message: 'Session completed',
      session
    });
  } catch (error) {
    logger.error('Complete session error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createSession,
  getSessionsByRoom,
  getSessionById,
  submitVote,
  startVoting,
  revealVotes,
  completeSession
}; 