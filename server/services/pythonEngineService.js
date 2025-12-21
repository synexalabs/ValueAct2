const axios = require('axios');
const logger = require('../utils/logger');

const PYTHON_ENGINE_URL = process.env.PYTHON_ENGINE_URL || 'http://localhost:8000';

class PythonEngineService {
    /**
     * Calculate IFRS 17 metrics
     * @param {Array} portfolio - List of policies
     * @param {Object} assumptions - Actuarial assumptions
     * @returns {Promise<Object>} Calculation results
     */
    async calculateIFRS17(portfolio, assumptions) {
        try {
            logger.info(`Sending IFRS 17 calculation request to ${PYTHON_ENGINE_URL}`);
            const response = await axios.post(
                `${PYTHON_ENGINE_URL}/api/v1/calculate/ifrs17`,
                { policies: portfolio, assumptions },
                { timeout: 120000 } // 2 minute timeout for large portfolios
            );
            return response.data;
        } catch (error) {
            logger.error('IFRS 17 calculation error:', error.message);
            throw new Error(`Python engine error: ${error.message}`);
        }
    }

    /**
     * Calculate Solvency II SCR
     * @param {Array} portfolio - List of policies
     * @param {Object} assumptions - Actuarial assumptions
     * @returns {Promise<Object>} Calculation results
     */
    async calculateSolvency(portfolio, assumptions) {
        try {
            logger.info(`Sending Solvency calculation request to ${PYTHON_ENGINE_URL}`);
            const response = await axios.post(
                `${PYTHON_ENGINE_URL}/api/v1/calculate/solvency`,
                { policies: portfolio, assumptions },
                { timeout: 120000 }
            );
            return response.data;
        } catch (error) {
            logger.error('Solvency calculation error:', error.message);
            throw new Error(`Python engine error: ${error.message}`);
        }
    }

    /**
     * Check health of Python engine
     * @returns {Promise<Object>} Health status
     */
    async healthCheck() {
        try {
            const response = await axios.get(`${PYTHON_ENGINE_URL}/health`);
            return response.data;
        } catch (error) {
            logger.error('Python engine health check failed:', error.message);
            return { status: 'down', error: error.message };
        }
    }
}

module.exports = new PythonEngineService();
