const calculationService = require('../services/calculationService');
const logger = require('../utils/logger');

/**
 * Calculation controller for handling calculation-related requests
 */
class CalculationController {

  /**
   * Start calculation
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  async startCalculation(req, res) {
    try {
      const { datasetId, calculationType, inputParams } = req.body;
      const userId = req.user.id;
      const metadata = {
        requestId: req.headers['x-request-id'],
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip || req.connection.remoteAddress
      };

      // Phase 1 Integration: Connect to Python Engine
      const pythonEngine = require('../services/pythonEngineService');
      const firestore = require('../services/firestoreService'); // Assuming this exists or will be needed for persistence

      let result;
      if (calculationType === 'ifrs17') {
        // Transform inputParams to match Python engine expectation if necessary
        // specific structure depends on inputParams vs python engine requirements
        // For now pass inputParams.portfolio and inputParams.assumptions
        result = await pythonEngine.calculateIFRS17(inputParams.portfolio, inputParams.assumptions);
      } else if (calculationType === 'solvency') {
        result = await pythonEngine.calculateSolvency(inputParams.portfolio, inputParams.assumptions);
      } else {
        // Fallback or legacy handling via calculationService
        result = await calculationService.startCalculation({
          userId,
          datasetId,
          calculationType,
          inputParams,
          metadata
        });
      }

      // If result comes from Python engine, structure the response
      if (calculationType === 'ifrs17' || calculationType === 'solvency') {
        // Persist result (Mocking persistence for now if firestoreService not fully aligned)
        // In a real flow we would save this to firestore here or in the service

        return res.status(201).json({
          success: true,
          message: 'Calculation completed successfully',
          calculation: {
            id: `calc_${Date.now()}`, // Temporary ID generation
            status: 'completed',
            results: result,
            executionTime: 0 // Placeholder
          }
        });
      }

      res.status(201).json({
        success: true,
        message: 'Calculation started successfully',
        calculation: {
          id: result.calculationId,
          status: result.status,
          results: result.results,
          executionTime: result.executionTime
        }
      });

    } catch (error) {
      logger.error('Start calculation error:', error);

      if (error.message.includes('validation failed')) {
        return res.status(400).json({
          success: false,
          error: error.message
        });
      }

      res.status(500).json({
        success: false,
        error: 'Failed to start calculation'
      });
    }
  }

  /**
   * Get calculation status
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  async getCalculationStatus(req, res) {
    try {
      const { calculationId } = req.params;
      const userId = req.user.id;

      const status = await calculationService.getCalculationStatus(calculationId, userId);

      res.json({
        success: true,
        status
      });

    } catch (error) {
      logger.error('Get calculation status error:', error);

      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          error: error.message
        });
      }

      if (error.message.includes('Access denied')) {
        return res.status(403).json({
          success: false,
          error: error.message
        });
      }

      res.status(500).json({
        success: false,
        error: 'Failed to get calculation status'
      });
    }
  }

  /**
   * Cancel calculation
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  async cancelCalculation(req, res) {
    try {
      const { calculationId } = req.params;
      const userId = req.user.id;

      const result = await calculationService.cancelCalculation(calculationId, userId);

      res.json({
        success: true,
        message: result.message
      });

    } catch (error) {
      logger.error('Cancel calculation error:', error);

      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          error: error.message
        });
      }

      if (error.message.includes('Access denied')) {
        return res.status(403).json({
          success: false,
          error: error.message
        });
      }

      if (error.message.includes('Cannot cancel')) {
        return res.status(400).json({
          success: false,
          error: error.message
        });
      }

      res.status(500).json({
        success: false,
        error: 'Failed to cancel calculation'
      });
    }
  }

  /**
   * Get calculation history
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  async getCalculationHistory(req, res) {
    try {
      const userId = req.user.id;
      const filters = req.query;

      const result = await calculationService.getCalculationHistory(userId, filters);

      res.json({
        success: true,
        ...result
      });

    } catch (error) {
      logger.error('Get calculation history error:', error);

      res.status(500).json({
        success: false,
        error: 'Failed to get calculation history'
      });
    }
  }

  /**
   * Get calculation results
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  async getCalculationResults(req, res) {
    try {
      const { calculationId } = req.params;
      const userId = req.user.id;

      // This will be implemented in Phase 2 when we have the full calculation service
      const calculation = await calculationService.getCalculationStatus(calculationId, userId);

      if (calculation.status !== 'completed') {
        return res.status(400).json({
          success: false,
          error: 'Calculation not completed yet'
        });
      }

      res.json({
        success: true,
        results: calculation.results
      });

    } catch (error) {
      logger.error('Get calculation results error:', error);

      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          error: error.message
        });
      }

      if (error.message.includes('Access denied')) {
        return res.status(403).json({
          success: false,
          error: error.message
        });
      }

      res.status(500).json({
        success: false,
        error: 'Failed to get calculation results'
      });
    }
  }

  /**
   * Run sensitivity analysis
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  async runSensitivityAnalysis(req, res) {
    try {
      const { calculationType, portfolio, baseAssumptions, scenarios } = req.body;

      // Validate inputs
      if (!calculationType || !['ifrs17', 'solvency'].includes(calculationType)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid calculation type. Must be "ifrs17" or "solvency"'
        });
      }

      if (!portfolio || !Array.isArray(portfolio) || portfolio.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Portfolio is required and must be a non-empty array'
        });
      }

      if (!baseAssumptions) {
        return res.status(400).json({
          success: false,
          error: 'Base assumptions are required'
        });
      }

      // Default scenarios if not provided
      const defaultScenarios = scenarios || [
        { name: 'Base', shocks: {} },
        { name: 'Discount +100bps', shocks: { discountRate: (baseAssumptions.discountRate || 0.035) + 0.01 } },
        { name: 'Discount -100bps', shocks: { discountRate: (baseAssumptions.discountRate || 0.035) - 0.01 } },
        { name: 'Lapse +50%', shocks: { lapseRate: (baseAssumptions.lapseRate || 0.05) * 1.5 } },
        { name: 'Mortality +15%', shocks: { mortalityShock: 1.15 } },
      ];

      const pythonEngine = require('../services/pythonEngineService');
      const result = await pythonEngine.runSensitivityAnalysis(
        calculationType,
        portfolio,
        baseAssumptions,
        defaultScenarios
      );

      res.json({
        success: true,
        message: 'Sensitivity analysis completed',
        ...result
      });

    } catch (error) {
      logger.error('Sensitivity analysis error:', error);

      res.status(500).json({
        success: false,
        error: 'Failed to run sensitivity analysis'
      });
    }
  }
}

module.exports = new CalculationController();
