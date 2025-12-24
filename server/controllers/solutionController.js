const { GoogleGenerativeAI } = require('@google/generative-ai');
const logger = require('../utils/logger');
const firestoreService = require('../services/firestoreService');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

class SolutionController {

    /**
     * Submit a new solution
     */
    async submitSolution(req, res) {
        try {
            const solutionData = {
                ...req.body,
                id: Date.now().toString(),
                submittedAt: new Date().toISOString(),
                userId: req.body.userId || `user_${Date.now()}`
            };

            // Store in Firestore using service
            // Note: firestoreService.addDocument returns a ref, but the original code used add() and returned a generated ID or used the one provided?
            // Original code:
            // await db.collection('solutions').add(solutionData); 
            // This creates a document with auto-generated ID, but the solutionData also has an 'id' field.
            // I will stick to the service.

            const docRef = await firestoreService.addDocument('solutions', solutionData);

            res.json({
                success: true,
                solutionId: solutionData.id,
                firestoreId: docRef.id,
                message: 'Solution submitted successfully'
            });
        } catch (error) {
            logger.error('Solution submission error:', error);
            res.status(500).json({ error: 'Failed to submit solution' });
        }
    }

    /**
     * Get solutions for a user
     */
    async getUserSolutions(req, res) {
        try {
            const { userId } = req.params;

            // Get solutions from Firestore using service
            // queryCollection(collection, whereClauses, orderBy, orderDirection)
            const solutions = await firestoreService.queryCollection(
                'solutions',
                [{ field: 'userId', operator: '==', value: userId }],
                'submittedAt',
                'desc'
            );

            res.json({ solutions });
        } catch (error) {
            logger.error('Get solutions error:', error);
            res.status(500).json({ error: 'Failed to retrieve solutions' });
        }
    }

    /**
     * Analyze a solution using AI
     */
    async analyzeSolution(req, res) {
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

      Do NOT return markdown formatting like \`\`\`json. Return ONLY valid raw JSON.
      Format as JSON with keys: technicalScore, strategicScore, feedback, strengths, improvements.`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            // Try to parse JSON response, with cleanup for markdown code blocks
            try {
                let jsonStr = text;
                // Remove markdown code blocks if present
                if (text.includes('```')) {
                    jsonStr = text.replace(/```json/g, '').replace(/```/g, '');
                }
                const analysis = JSON.parse(jsonStr);
                res.json({ analysis });
            } catch (parseError) {
                logger.error('Failed to parse AI response:', parseError);
                logger.error('Raw AI response:', text);

                res.status(500).json({
                    error: 'Failed to parse AI analysis response',
                    analysis: {
                        technicalScore: 0,
                        strategicScore: 0,
                        feedback: "Analysis failed due to parsing error. Please try again.",
                        strengths: [],
                        improvements: ["Please try again"]
                    }
                });
            }
        } catch (error) {
            logger.error('Analysis error:', error);
            res.status(500).json({
                error: 'Failed to analyze solution'
            });
        }
    }
}

module.exports = new SolutionController();
