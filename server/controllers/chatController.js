const { GoogleGenerativeAI } = require('@google/generative-ai');
const logger = require('../utils/logger');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

// Input sanitization utility for security
const sanitizeInput = (input, maxLength = 2000) => {
    if (!input || typeof input !== 'string') return '';
    return input
        .slice(0, maxLength)
        .replace(/<[^>]*>/g, '')  // Remove HTML tags
        .replace(/[\x00-\x1F\x7F]/g, '')  // Remove control characters
        .trim();
};

class ChatController {
    async handleChat(req, res) {
        try {
            // Sanitize input to prevent XSS and injection attacks
            const message = sanitizeInput(req.body.message);

            if (!message || message.length < 2) {
                return res.status(400).json({ error: 'Message is required (minimum 2 characters)' });
            }

            // Require valid API key
            if (!process.env.GOOGLE_API_KEY) {
                return res.status(503).json({
                    error: 'AI service is currently unavailable.'
                });
            }

            // Use Gemini AI
            const model = genAI.getGenerativeModel({ model: "gemini-pro" });

            const prompt = `You are an expert actuarial co-pilot specializing in life insurance actuarial practice. 
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
            logger.error('Chat error:', error);
            res.status(500).json({
                error: 'Failed to process chat request',
                response: "I'm experiencing technical difficulties. Please try again in a moment."
            });
        }
    }
}

module.exports = new ChatController();
