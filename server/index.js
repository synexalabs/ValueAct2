const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { GoogleGenerativeAI } = require('@google/generative-ai');
const admin = require('firebase-admin');
const logger = require('./utils/logger');

// Import routes
const authRoutes = require('./routes/auth');
const dataRoutes = require('./routes/data');
const calculationRoutes = require('./routes/calculations');
const methodologyRoutes = require('./routes/methodology');
const dataManagementRoutes = require('./routes/dataManagement');
const healthRoutes = require('./routes/healthRoutes');


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

const db = admin.firestore();

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
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

// Solutions will be stored in Firestore

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

// Chat with Gemini AI
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Require valid API key
    if (!process.env.GOOGLE_API_KEY) {
      return res.status(500).json({
        error: 'AI service not configured. Please set GOOGLE_API_KEY environment variable.'
      });
    }

    // Use Gemini AI
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `You are AxiomAI, an expert actuarial co-pilot specializing in life insurance actuarial practice. 
    You have deep knowledge across all areas of life insurance actuarial work including:
    
    CORE KNOWLEDGE AREAS:
    - Life Insurance Fundamentals: Product types, mortality tables, valuation principles, policyholder behavior
    - IFRS 17: GMM, PAA, VFA models, CSM mechanics, risk adjustments, implementation challenges
    - Solvency II: SCR/MCR calculations, internal models, capital management, risk frameworks
    - Pricing & Product Development: GLM modeling, profit testing, product design, market analysis
    - Risk Management & ALM: Asset-liability management, interest rate risk, longevity risk, hedging strategies
    - Regulatory & Compliance: Global frameworks, reporting standards, compliance management
    
    User question: ${message}
    
    Provide a comprehensive, professional response that:
    1. Answers the technical question with actuarial accuracy
    2. Provides practical business context and implications
    3. Offers strategic insights where relevant
    4. Suggests additional resources or considerations
    5. Maintains a professional, educational tone
    
    Focus on practical application and real-world relevance. Keep responses detailed but accessible.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.json({ response: text });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({
      error: 'Failed to process chat request',
      response: "I'm experiencing technical difficulties. Please try again in a moment."
    });
  }
});

// Submit solution
app.post('/api/solutions', async (req, res) => {
  try {
    const solutionData = {
      ...req.body,
      id: Date.now().toString(),
      submittedAt: new Date().toISOString(),
      userId: req.body.userId || `user_${Date.now()}`
    };

    // Store in Firestore
    await db.collection('solutions').add(solutionData);

    res.json({
      success: true,
      solutionId: solutionData.id,
      message: 'Solution submitted successfully'
    });
  } catch (error) {
    console.error('Solution submission error:', error);
    res.status(500).json({ error: 'Failed to submit solution' });
  }
});

// Get user solutions
app.get('/api/solutions/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Get solutions from Firestore
    const solutionsSnapshot = await db.collection('solutions')
      .where('userId', '==', userId)
      .orderBy('submittedAt', 'desc')
      .get();

    const userSolutions = solutionsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json({ solutions: userSolutions });
  } catch (error) {
    console.error('Get solutions error:', error);
    res.status(500).json({ error: 'Failed to retrieve solutions' });
  }
});

// Analyze solution with AI
app.post('/api/analyze-solution', async (req, res) => {
  try {
    const { solutionData } = req.body;

    if (!solutionData) {
      return res.status(400).json({ error: 'Solution data is required' });
    }

    // Require valid API key
    if (!process.env.GOOGLE_API_KEY) {
      return res.status(500).json({
        error: 'AI service not configured. Please set GOOGLE_API_KEY environment variable.'
      });
    }

    // Use Gemini AI for analysis
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `As an expert actuarial mentor, analyze this student solution:

    Module: ${solutionData.moduleName}
    Analysis: ${solutionData.analysis}
    Code: ${solutionData.code}
    Conclusion: ${solutionData.conclusion}
    Recommendations: ${solutionData.recommendations}

    Provide a comprehensive analysis including:
    1. Technical accuracy (score 0-100)
    2. Strategic thinking (score 0-100)
    3. Constructive feedback
    4. Key strengths
    5. Areas for improvement

    Format as JSON with scores, feedback, strengths, and improvements arrays.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Try to parse JSON response, fallback to mock if parsing fails
    try {
      const analysis = JSON.parse(text);
      res.json({ analysis });
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      res.status(500).json({
        error: 'Failed to parse AI analysis response',
        analysis: {
          technicalScore: 0,
          strategicScore: 0,
          feedback: "Analysis failed due to parsing error.",
          strengths: [],
          improvements: ["Please try again"]
        }
      });
    }
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({
      error: 'Failed to analyze solution'
    });
  }
});

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
  console.log(`🚀 Valuact server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🤖 AI Chat: http://localhost:${PORT}/api/chat`);
  console.log(`💾 Solutions: http://localhost:${PORT}/api/solutions`);
  console.log(`🔌 WebSocket: ws://localhost:${PORT}`);
});

module.exports = app;
