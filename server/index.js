const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const admin = require('firebase-admin');
const logger = require('./utils/logger');

// Import routes
const authRoutes = require('./routes/auth');
const dataRoutes = require('./routes/data');
const calculationRoutes = require('./routes/calculations');
const methodologyRoutes = require('./routes/methodology');
const dataManagementRoutes = require('./routes/dataManagement');
const healthRoutes = require('./routes/healthRoutes');
const chatRoutes = require('./routes/chat');


const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Firebase Admin
if (!admin.apps.length) {
  try {
    // Validate required environment variables
    if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_PRIVATE_KEY || !process.env.FIREBASE_CLIENT_EMAIL) {
      throw new Error('Missing required Firebase environment variables. Please check your .env file.');
    }

    // Use service account credentials from environment variables
    const firebaseConfig = {
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL
      }),
      projectId: process.env.FIREBASE_PROJECT_ID
    };

    admin.initializeApp(firebaseConfig);
    logger.info('Firebase Admin initialized successfully');
    logger.info(`Connected to Firebase project: ${process.env.FIREBASE_PROJECT_ID}`);
  } catch (error) {
    logger.error('Firebase Admin initialization error:', error);
    logger.error('Please ensure FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, and FIREBASE_CLIENT_EMAIL are set in .env');
    process.exit(1); // Exit if Firebase fails to initialize
  }
}

// Initialize Gemini AI removed (moved to consumers)

// Validate GOOGLE_API_KEY at startup
if (!process.env.GOOGLE_API_KEY) {
  logger.warn('GOOGLE_API_KEY not set - AI chat features will be disabled');
}

// Input sanitization utility for security
const sanitizeInput = (input, maxLength = 2000) => {
  if (!input || typeof input !== 'string') return '';
  return input
    .slice(0, maxLength)
    .replace(/<[^>]*>/g, '')  // Remove HTML tags
    .replace(/[\x00-\x1F\x7F]/g, '')  // Remove control characters
    .trim();
};

// CORS configuration with origin whitelist
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173,http://localhost:3000')
  .split(',')
  .map(origin => origin.trim());

// Middleware
app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.) in development
    if (!origin && process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      logger.warn(`CORS blocked request from origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);



// Routes

// Health check routes (detailed endpoints)
app.use('/api/health', healthRoutes);

// Authentication routes
app.use('/api/auth', authRoutes);

// Data routes
app.use('/api/data', dataRoutes);

// Calculation routes
app.use('/api/calculations', calculationRoutes);

// Methodology routes
app.use('/api/methodology', methodologyRoutes);

// Data management routes (comprehensive multi-file processing)
app.use('/api/data-management', dataManagementRoutes);

// Chat routes
app.use('/api/chat', chatRoutes);

// Routes moved to controllers

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Create HTTP server
const http = require('http');
const server = http.createServer(app);

// Initialize WebSocket
const { initializeWebSocket } = require('./websocket');
const io = initializeWebSocket(server);

// Start server
server.listen(PORT, () => {
  logger.info(`🚀 Valuact server running on port ${PORT}`);
  logger.info(`📊 Health check: http://localhost:${PORT}/api/health`);
  logger.info(`🤖 AI Chat: http://localhost:${PORT}/api/chat`);

  logger.info(`🔌 WebSocket: ws://localhost:${PORT}`);
});

module.exports = app;
