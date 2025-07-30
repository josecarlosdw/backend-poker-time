require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const connectDB = require('./config/database');
const logger = require('./utils/logger');
const authRoutes = require('./routes/auth');
const roomRoutes = require('./routes/rooms');
const sessionRoutes = require('./routes/sessions');

const app = express();
const server = http.createServer(app);

// Socket.IO setup
const io = socketIO(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:4200",
    methods: ["GET", "POST"]
  }
});

// Connect to MongoDB
connectDB();

// Security middleware
app.use(helmet());
app.use(compression());

// CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:4200",
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Logging
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/sessions', sessionRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Socket.IO connection handling
const connectedUsers = new Map();
const roomUsers = new Map();

io.on('connection', (socket) => {
  logger.info(`User connected: ${socket.id}`);

  // Join room
  socket.on('joinRoom', ({ roomId, username }) => {
    socket.join(roomId);
    connectedUsers.set(socket.id, { username, roomId });
    
    if (!roomUsers.has(roomId)) {
      roomUsers.set(roomId, new Set());
    }
    roomUsers.get(roomId).add(username);

    io.to(roomId).emit('userJoined', { username, roomId });
    logger.info(`User ${username} joined room ${roomId}`);
  });

  // Vote
  socket.on('vote', ({ roomId, username, card }) => {
    io.to(roomId).emit('voteReceived', { username, card });
    logger.info(`Vote received from ${username} in room ${roomId}: ${card}`);
  });

  // Reveal votes
  socket.on('revealVotes', ({ roomId }) => {
    io.to(roomId).emit('votesRevealed');
    logger.info(`Votes revealed in room ${roomId}`);
  });

  // Chat message
  socket.on('chatMessage', ({ roomId, username, message }) => {
    io.to(roomId).emit('chatMessage', { username, message, timestamp: new Date() });
    logger.info(`Chat message from ${username} in room ${roomId}`);
  });

  // Disconnect
  socket.on('disconnect', () => {
    const userData = connectedUsers.get(socket.id);
    if (userData) {
      const { username, roomId } = userData;
      connectedUsers.delete(socket.id);
      
      if (roomUsers.has(roomId)) {
        roomUsers.get(roomId).delete(username);
        if (roomUsers.get(roomId).size === 0) {
          roomUsers.delete(roomId);
        }
      }

      io.to(roomId).emit('userLeft', { username, roomId });
      logger.info(`User ${username} disconnected from room ${roomId}`);
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV}`);
}); 