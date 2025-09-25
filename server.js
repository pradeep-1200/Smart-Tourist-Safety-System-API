require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoose = require('mongoose');
const connectDB = require('./src/config/database');
const logger = require('./src/utils/logger');

const app = express();

// Connect to MongoDB Atlas
connectDB();

// CORS Configuration - Allow all origins for production
const corsOptions = {
  origin: true, // Allow all origins in production
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
  optionsSuccessStatus: 200
};

// Middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors(corsOptions));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API Routes
app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/locations', require('./src/routes/locations'));
app.use('/api/alerts', require('./src/routes/alerts'));

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: '🚀 Smart Tourist Safety API is Live!',
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      login: '/api/auth/login',
      docs: '/api/docs'
    }
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'Smart Tourist Safety API',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'production',
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    uptime: process.uptime()
  });
});

// API Documentation endpoint
app.get('/api/docs', (req, res) => {
  res.json({
    service: 'Smart Tourist Safety API',
    version: '1.0.0',
    description: 'Backend API for Smart Tourist Safety Monitoring System',
    endpoints: {
      auth: {
        'POST /api/auth/login': 'Tourist login with DTID and passport'
      },
      locations: {
        'POST /api/locations/update': 'Update tourist location'
      },
      alerts: {
        'POST /api/alerts/panic': 'Create panic alert'
      },
      system: {
        'GET /api/health': 'Health check',
        'GET /api/docs': 'API documentation'
      }
    },
    sample_login: {
      dtid: 'TID0001',
      passport_no: 'P987654321'
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl,
    timestamp: new Date().toISOString()
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production'
      ? 'Something went wrong!'
      : err.message,
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Smart Tourist Safety API is running on port ${PORT}!`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'production'}`);
  console.log(`🔗 Visit: https://your-app.onrender.com/api/health`);
});
