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
      
      const result = await calculationService.startCalculation({
        userId,
        datasetId,
        calculationType,
        inputParams,
        metadata
      });
      
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
}

module.exports = new CalculationController();
