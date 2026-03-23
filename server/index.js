const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const admin = require('firebase-admin');
const logger = require('./utils/logger');

// Import routes
const authRoutes = require('./routes/auth');
const calculationRoutes = require('./routes/calculations');
const methodologyRoutes = require('./routes/methodology');
const healthRoutes = require('./routes/healthRoutes');
const chatRoutes = require('./routes/chat');
const stripeRoutes = require('./routes/stripe');

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Firebase Admin
if (!admin.apps.length) {
  try {
    if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_PRIVATE_KEY || !process.env.FIREBASE_CLIENT_EMAIL) {
      throw new Error('Missing required Firebase environment variables. Please check your .env file.');
    }

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL
      }),
      projectId: process.env.FIREBASE_PROJECT_ID
    });
    logger.info('Firebase Admin initialized successfully');
    logger.info(`Connected to Firebase project: ${process.env.FIREBASE_PROJECT_ID}`);
  } catch (error) {
    logger.error('Firebase Admin initialization error:', error);
    process.exit(1);
  }
}

if (!process.env.GOOGLE_API_KEY) {
  logger.warn('GOOGLE_API_KEY not set - AI chat features will be disabled');
}

// CORS configuration
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173,http://localhost:3000')
  .split(',')
  .map(origin => origin.trim());

app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
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
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Free tier: 3 calculations per day
const calculationLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000,
  max: 3,
  message: { error: 'Tageslimit erreicht. Upgraden Sie auf Professional für unbegrenzte Berechnungen.' },
  keyGenerator: (req) => req.user?.id || req.ip,
  skip: (req) => req.user?.plan === 'pro'
});

// Routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/calculations', calculationLimiter, calculationRoutes);
app.use('/api/methodology', methodologyRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/stripe', stripeRoutes);

// Error handling
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  logger.info(`Valuact server running on port ${PORT}`);
  logger.info(`Health check: http://localhost:${PORT}/api/health`);
});

module.exports = app;
