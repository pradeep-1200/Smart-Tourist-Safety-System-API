const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
  try {
    // Remove all deprecated options
    const conn = await mongoose.connect(process.env.MONGODB_URI);

    logger.info(`✅ MongoDB Connected: ${conn.connection.host}`, {
      database: conn.connection.name,
      port: conn.connection.port,
      service: 'tourist-safety-api'
    });

  } catch (error) {
    logger.error('❌ Database connection failed:', {
      message: error.message,
      stack: error.stack,
      service: 'tourist-safety-api'
    });
    
    logger.info('⚠️ Server will continue without MongoDB (some features may not work)', {
      service: 'tourist-safety-api'
    });
  }
};

module.exports = connectDB;
