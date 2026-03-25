const axios = require('axios');
const logger = require('../utils/logger');
const Joi = require('joi');

// Validation schemas (Type Safety)
const policySchema = Joi.object({
    policyId: Joi.string().required(),
    issueDate: Joi.string().isoDate().required(),
    faceAmount: Joi.number().min(0).required(),
    premium: Joi.number().min(0).required(),
    policyType: Joi.string().default('TERM'),
    gender: Joi.string().valid('M', 'F').default('M'),
    issueAge: Joi.number().integer().min(0).max(120).default(45),
    sumAssured: Joi.number().min(0),
    premiumTerm: Joi.number().integer().min(1).default(20)
}).unknown(true);

const assumptionSchema = Joi.object({
    discountRate: Joi.number().min(-0.1).max(0.5).default(0.035),
    lapseRate: Joi.number().min(0).max(1).default(0.05),
    mortalityTable: Joi.string().default('DAV_2008_T')
}).unknown(true);

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
                    issue_date: p.issueDate || p.issue_date || new Date().toISOString().slice(0, 10),
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
                    mortality_table: assumptions.mortalityTable || assumptions.mortality_table || 'DAV_2008_T',
                    expense_inflation: parseFloat(assumptions.expenseInflation || assumptions.expense_inflation || 0.02),
                    risk_adjustment_factor: parseFloat(assumptions.riskAdjustmentFactor || assumptions.risk_adjustment_factor || 0.06),
                    expense_loading: parseFloat(assumptions.expenseLoading || assumptions.expense_loading || 0.05),
                    tax_rate: parseFloat(assumptions.taxRate || assumptions.tax_rate || 0.21),
                    confidence_level: parseFloat(assumptions.confidenceLevel || assumptions.confidence_level || 0.75),
                    ra_method: assumptions.raMethod || assumptions.ra_method || 'factor',
                    use_eiopa_yield_curve: assumptions.useEiopaYieldCurve ?? assumptions.use_eiopa_yield_curve ?? false,
                    include_va: assumptions.includeVa ?? assumptions.include_va ?? false,
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
                    issue_date: p.issueDate || p.issue_date || new Date().toISOString().slice(0, 10),
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
     * Calculate CSM roll-forward (Überleitung) for a reporting period
     */
    async calculateCsmRollforward(openingBalance, newBusiness, assumptions, economicData = {}) {
        if (!this.canMakeRequest()) {
            throw new Error('Python engine circuit breaker is OPEN - service temporarily unavailable');
        }
        try {
            const payload = {
                opening_balance: openingBalance,
                new_business: newBusiness || [],
                assumptions: {
                    discount_rate: parseFloat(assumptions.discountRate || assumptions.discount_rate || 0.035),
                    coverage_units_current: parseFloat(assumptions.coverageUnitsCurrent || assumptions.coverage_units_current || 0),
                    coverage_units_future: parseFloat(assumptions.coverageUnitsFuture || assumptions.coverage_units_future || 1),
                    delta_estimates: parseFloat(assumptions.deltaEstimates || assumptions.delta_estimates || 0),
                    experience_adjustments: parseFloat(assumptions.experienceAdjustments || assumptions.experience_adjustments || 0),
                    fx_impact: parseFloat(assumptions.fxImpact || assumptions.fx_impact || 0),
                },
                economic_data: economicData,
            };
            const response = await axios.post(
                `${PYTHON_ENGINE_URL}/api/v1/calculate/csm-rollforward`,
                payload,
                { timeout: this.CALCULATION_TIMEOUT }
            );
            this.recordSuccess();
            return response.data;
        } catch (error) {
            this.recordFailure();
            logger.error('CSM rollforward calculation error:', error.message);
            throw new Error(`Python engine error: ${error.message}`);
        }
    }

    /**
     * Run sensitivity analysis across multiple scenarios
     * @param {string} calculationType - 'ifrs17' or 'solvency'
     * @param {Array} portfolio - List of policies
     * @param {Object} baseAssumptions - Base actuarial assumptions
     * @param {Array} scenarios - Array of scenario objects with name and shocks
     * @returns {Promise<Object>} Sensitivity analysis results
     */
    async runSensitivityAnalysis(calculationType, portfolio, baseAssumptions, scenarios) {
        const startTime = Date.now();
        logger.info(`Starting sensitivity analysis with ${scenarios.length} scenarios`);

        try {
            const results = await Promise.all(
                scenarios.map(async (scenario) => {
                    const shockedAssumptions = { ...baseAssumptions };

                    // Apply shocks
                    Object.entries(scenario.shocks || {}).forEach(([key, value]) => {
                        if (typeof value === 'number') {
                            // Check if it's a multiplier (for lapse, mortality)
                            if (key.includes('Multiplier') || key.includes('multiplier')) {
                                const baseKey = key.replace('Multiplier', '').replace('multiplier', '');
                                shockedAssumptions[baseKey] = (shockedAssumptions[baseKey] || 0) * value;
                            } else {
                                shockedAssumptions[key] = value;
                            }
                        }
                    });

                    // Input Validation before calling engine
                    if (scenarios.length < 50) { // Only validate for smaller batches to safe perf
                        try {
                            Joi.attempt(shockedAssumptions, assumptionSchema);
                        } catch (validationErr) {
                            logger.warn(`Assumption validation warning for scenario ${scenario.name}: ${validationErr.message}`);
                        }
                    }

                    const result = calculationType === 'ifrs17'
                        ? await this.calculateIFRS17(portfolio, shockedAssumptions)
                        : await this.calculateSolvency(portfolio, shockedAssumptions);

                    return {
                        scenario: scenario.name,
                        shocks: scenario.shocks,
                        results: result.aggregate_results || result,
                    };
                })
            );

            const duration = Date.now() - startTime;
            logger.info(`Sensitivity analysis completed in ${duration}ms`);

            return {
                base_scenario: 'Base',
                scenarios: results,
                generated_at: new Date().toISOString(),
                duration_ms: duration,
            };
        } catch (error) {
            logger.error('Sensitivity analysis error:', error.message);
            throw new Error(`Sensitivity analysis failed: ${error.message}`);
        }
    }

    /**
     * Get available mortality tables from Python engine
     * @returns {Promise<Array>} List of available mortality tables
     */
    async getMortalityTables() {
        if (!this.canMakeRequest()) {
            throw new Error('Python engine circuit breaker is OPEN - service temporarily unavailable');
        }

        try {
            const response = await axios.get(
                `${PYTHON_ENGINE_URL}/api/v1/mortality-tables`,
                { timeout: 10000 }
            );
            this.recordSuccess();
            return response.data;
        } catch (error) {
            this.recordFailure();
            logger.error('Get mortality tables error:', error.message);
            // Return default tables if endpoint not available
            return {
                tables: ['DAV_2008_T', 'DAV_2004_R', 'DAV_2008_T_MALE', 'DAV_2008_T_FEMALE', 'DAV_2004_R_MALE', 'DAV_2004_R_FEMALE'],
                error: 'Could not fetch from engine, returning defaults',
            };
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
