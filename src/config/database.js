const mongoose = require('mongoose');
const logger = require('../utils/logger');

let isConnected = false;

const connectDB = async () => {
  try {
    // Updated connection options for latest MongoDB driver
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      bufferMaxEntries: 0, // Disable mongoose buffering
      bufferCommands: false, // Disable mongoose buffering
    });

    isConnected = true;
    logger.info(`✅ MongoDB Connected: ${conn.connection.host}`, {
      database: conn.connection.name,
      port: conn.connection.port
    });

    // Connection event listeners
    mongoose.connection.on('connected', () => {
      isConnected = true;
      logger.info('✅ Mongoose connected to MongoDB Atlas');
    });

    mongoose.connection.on('error', (err) => {
      isConnected = false;
      logger.error('❌ Mongoose connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      isConnected = false;
      logger.warn('⚠️ Mongoose disconnected from MongoDB');
    });

    // Handle application termination
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      logger.info('MongoDB connection closed through app termination');
      process.exit(0);
    });

  } catch (error) {
    isConnected = false;
    logger.error('❌ Database connection failed:', error);
    logger.info('⚠️ Server will continue without MongoDB (some features may not work)');
    // Don't exit - continue running for development
  }
};

// Function to check connection status
const isDBConnected = () => {
  return isConnected && mongoose.connection.readyState === 1;
};

module.exports = { connectDB, isDBConnected };
