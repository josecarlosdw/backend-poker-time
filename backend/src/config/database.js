const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
  try {
    // Skip MongoDB connection if URI is not provided
    if (!process.env.MONGODB_URI) {
      logger.warn('MongoDB URI not provided, running in memory mode');
      return;
    }

    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    logger.info(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      logger.warn('MongoDB connection failed, running in memory mode');
      logger.warn('To use MongoDB, install and start MongoDB service');
    } else {
      logger.error('Error connecting to MongoDB:', error);
      process.exit(1);
    }
  }
};

module.exports = connectDB; 