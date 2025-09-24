require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { connectDB, isDBConnected } = require('./src/config/database');
const logger = require('./src/utils/logger');

const app = express();

// Connect to MongoDB Atlas
connectDB();

// CORS Configuration - FIXED FOR FLUTTER WEB
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, postman)
    if (!origin) return callback(null, true);
    
    // Allow all localhost and 127.0.0.1 origins for development
    const allowedOrigins = [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://localhost:5000',
      'http://127.0.0.1:5000',
      'http://localhost:8080',
      'http://127.0.0.1:8080',
      'http://localhost:5283',  // Your current Flutter web port
      'http://127.0.0.1:5283',
      // Add common Flutter dev server ports
      /^http:\/\/localhost:\d+$/,
      /^http:\/\/127\.0\.0\.1:\d+$/,
    ];
    
    // For development, allow any localhost origin
    if (process.env.NODE_ENV !== 'production') {
      if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
        return callback(null, true);
      }
    }
    
    // Check exact matches
    if (allowedOrigins.some(allowed => {
      if (allowed instanceof RegExp) {
        return allowed.test(origin);
      }
      return allowed === origin;
    })) {
      callback(null, true);
    } else if (process.env.NODE_ENV === 'production') {
      callback(new Error('Not allowed by CORS'));
    } else {
      // For development, allow all origins
      callback(null, true);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
  optionsSuccessStatus: 200 // For legacy browser support
};

// Middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors(corsOptions));
app.use(morgan('combined', { stream: logger.stream }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API Routes
app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/locations', require('./src/routes/locations'));
app.use('/api/alerts', require('./src/routes/alerts'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'Smart Tourist Safety API',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    database: {
      connected: isDBConnected(),
      status: isDBConnected() ? 'Connected to MongoDB Atlas' : 'MongoDB connection failed - using fallback mode'
    }
  });
});

// API Documentation endpoint
app.get('/api/docs', (req, res) => {
  res.json({
    service: 'Smart Tourist Safety API',
    version: '1.0.0',
    endpoints: {
      auth: {
        'POST /api/auth/login': 'Tourist login with DTID and passport',
        'POST /api/auth/register': 'Register new tourist (staff only)',
        'GET /api/auth/profile/:id': 'Get tourist profile'
      },
      locations: {
        'POST /api/locations/update': 'Update tourist location',
        'GET /api/locations/history/:tourist_id': 'Get location history',
        'GET /api/locations/latest/:tourist_id': 'Get latest location',
        'GET /api/locations/nearby': 'Find nearby tourists'
      },
      alerts: {
        'POST /api/alerts/panic': 'Create panic alert',
        'GET /api/alerts/:tourist_id': 'Get tourist alerts'
      },
      system: {
        'GET /api/health': 'Health check',
        'GET /api/docs': 'API documentation'
      }
    },
    sample_data: {
      login: {
        dtid: 'TID0001',
        passport_no: 'P987654321'
      }
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  logger.warn('404 - Route not found', {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip
  });
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// Global error handler
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', {
    error: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip
  });
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
  logger.info(`🚀 Smart Tourist Safety API started`, {
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
  console.log(`\n🚀 Smart Tourist Safety API is running!`);
  console.log(`📊 Server: http://localhost:${PORT}`);
  console.log(`🏥 Health: http://localhost:${PORT}/api/health`);
  console.log(`📚 Docs: http://localhost:${PORT}/api/docs`);
  console.log(`🔐 Sample Login: POST /api/auth/login with DTID: TID0001, Passport: P987654321`);
  console.log(`\n📝 Logs are saved in the 'logs/' directory`);
  console.log(`🌐 CORS: Allowing all localhost origins for development`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});
