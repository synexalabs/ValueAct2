const axios = require('axios');
const logger = require('../utils/logger');

const PYTHON_ENGINE_URL = process.env.PYTHON_ENGINE_URL || 'http://localhost:8000';

class PythonEngineService {
    constructor() {
        this.circuitState = {
            failures: 0,
            lastFailure: null,
            state: 'CLOSED', // CLOSED, OPEN, HALF_OPEN
        };
        this.FAILURE_THRESHOLD = 3;
        this.RESET_TIMEOUT = 30000; // 30 seconds
        this.CALCULATION_TIMEOUT = parseInt(process.env.CALCULATION_TIMEOUT) || 300000;
    }

    /**
     * Check if circuit should allow request
     */
    canMakeRequest() {
        if (this.circuitState.state === 'CLOSED') return true;
        if (this.circuitState.state === 'OPEN') {
            if (Date.now() - this.circuitState.lastFailure > this.RESET_TIMEOUT) {
                this.circuitState.state = 'HALF_OPEN';
                return true;
            }
            return false;
        }
        return true; // HALF_OPEN allows one request
    }

    /**
     * Record successful request
     */
    recordSuccess() {
        this.circuitState.failures = 0;
        this.circuitState.state = 'CLOSED';
    }

    /**
     * Record failed request
     */
    recordFailure() {
        this.circuitState.failures++;
        this.circuitState.lastFailure = Date.now();
        if (this.circuitState.failures >= this.FAILURE_THRESHOLD) {
            this.circuitState.state = 'OPEN';
        }
    }

    /**
     * Calculate IFRS 17 metrics
     * @param {Array} portfolio - List of policies
     * @param {Object} assumptions - Actuarial assumptions
     * @returns {Promise<Object>} Calculation results
     */
    async calculateIFRS17(portfolio, assumptions) {
        if (!this.canMakeRequest()) {
            throw new Error('Python engine circuit breaker is OPEN - service temporarily unavailable');
        }

        try {
            logger.info(`Sending IFRS 17 calculation request to ${PYTHON_ENGINE_URL}`);

            // Map data to Python engine expected format if needed
            // Assuming direct pass-through for now as per plan, but ensuring structure matches
            const payload = {
                policies: portfolio.map(p => ({
                    policy_id: p.policyId || p.policy_id,
                    issue_date: p.issueDate || p.issue_date,
                    face_amount: parseFloat(p.faceAmount || p.face_amount || 0),
                    premium: parseFloat(p.premium || 0),
                    policy_type: p.policyType || p.policy_type || 'TERM',
                    gender: p.gender || 'M',
                    issue_age: parseInt(p.issueAge || p.issue_age || 45),
                    sum_assured: parseFloat(p.sumAssured || p.sum_assured || p.faceAmount || 0),
                    premium_term: parseInt(p.premiumTerm || p.premium_term || 20),
                })),
                assumptions: {
                    discount_rate: parseFloat(assumptions.discountRate || assumptions.discount_rate || 0.035),
                    lapse_rate: parseFloat(assumptions.lapseRate || assumptions.lapse_rate || 0.05),
                    mortality_table: assumptions.mortalityTable || assumptions.mortality_table || 'CSO_2017',
                    expense_inflation: parseFloat(assumptions.expenseInflation || assumptions.expense_inflation || 0.02),
                    risk_adjustment_factor: parseFloat(assumptions.riskAdjustmentFactor || assumptions.risk_adjustment_factor || 0.06),
                    expense_loading: parseFloat(assumptions.expenseLoading || assumptions.expense_loading || 0.05),
                    tax_rate: parseFloat(assumptions.taxRate || assumptions.tax_rate || 0.21),
                }
            };

            const response = await axios.post(
                `${PYTHON_ENGINE_URL}/api/v1/calculate/ifrs17`,
                payload,
                { timeout: this.CALCULATION_TIMEOUT }
            );

            this.recordSuccess();
            return response.data;
        } catch (error) {
            this.recordFailure();
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
        if (!this.canMakeRequest()) {
            throw new Error('Python engine circuit breaker is OPEN - service temporarily unavailable');
        }

        try {
            logger.info(`Sending Solvency calculation request to ${PYTHON_ENGINE_URL}`);

            const payload = {
                policies: portfolio.map(p => ({
                    policy_id: p.policyId || p.policy_id,
                    issue_date: p.issueDate || p.issue_date,
                    face_amount: parseFloat(p.faceAmount || p.face_amount || 0),
                    premium: parseFloat(p.premium || 0),
                    policy_type: p.policyType || p.policy_type || 'TERM',
                    gender: p.gender || 'M',
                    issue_age: parseInt(p.issueAge || p.issue_age || 45),
                    sum_assured: parseFloat(p.sumAssured || p.sum_assured || p.faceAmount || 0),
                    premium_term: parseInt(p.premiumTerm || p.premium_term || 20),
                })),
                assumptions: {
                    confidence_level: parseFloat(assumptions.confidenceLevel || assumptions.confidence_level || 0.995),
                    time_horizon: parseInt(assumptions.timeHorizon || assumptions.time_horizon || 1),
                    market_risk_factor: parseFloat(assumptions.marketRiskFactor || assumptions.market_risk_factor || 0.15),
                    credit_risk_factor: parseFloat(assumptions.creditRiskFactor || assumptions.credit_risk_factor || 0.10),
                    underwriting_risk_factor: parseFloat(assumptions.underwritingRiskFactor || assumptions.underwriting_risk_factor || 0.12),
                    operational_risk_factor: parseFloat(assumptions.operationalRiskFactor || assumptions.operational_risk_factor || 0.03),
                }
            };

            const response = await axios.post(
                `${PYTHON_ENGINE_URL}/api/v1/calculate/solvency`,
                payload,
                { timeout: this.CALCULATION_TIMEOUT }
            );

            this.recordSuccess();
            return response.data;
        } catch (error) {
            this.recordFailure();
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
            const response = await axios.get(`${PYTHON_ENGINE_URL}/health`, { timeout: 5000 });
            return { status: 'healthy', ...response.data };
        } catch (error) {
            logger.error('Python engine health check failed:', error.message);
            return { status: 'unhealthy', error: error.message };
        }
    }

    /**
     * Get circuit breaker status
     */
    getCircuitStatus() {
        return { ...this.circuitState };
    }
}

module.exports = new PythonEngineService();
