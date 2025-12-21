const dataService = require('./dataService');
const firestoreService = require('./firestoreService');
const CalculationModel = require('../models/Calculation');
const logger = require('../utils/logger');

/**
 * Calculation service for handling calculation operations
 */
class CalculationService {

  /**
   * Start calculation job
   * @param {object} calculationData - Calculation data
   * @returns {Promise<object>} Calculation result
   */
  async startCalculation(calculationData) {
    const { userId, datasetId, calculationType, inputParams, metadata } = calculationData;

    try {
      // Create calculation record
      const calculationId = await dataService.createCalculation({
        userId,
        datasetId,
        calculationType,
        inputParams,
        metadata
      });

      // Update status to running
      await dataService.updateCalculationStatus(calculationId.calculationId, 'running');

      // Get dataset data
      const dataset = await dataService.getDataset(datasetId, userId);

      // Prepare calculation payload
      const payload = {
        calculationId: calculationId.calculationId,
        calculationType,
        dataset: {
          id: dataset.id,
          name: dataset.name,
          data: dataset.data,
          columns: dataset.columns
        },
        assumptions: inputParams.assumptions,
        metadata
      };

      // For now, we'll simulate the calculation
      // In Phase 2, this will call the Python engine
      const result = await this.simulateCalculation(payload);

      // Update calculation with results
      await dataService.updateCalculationStatus(calculationId.calculationId, 'completed', {
        results: result.results
      });

      logger.info(`Calculation completed: ${calculationId.calculationId}`);

      return {
        calculationId: calculationId.calculationId,
        status: 'completed',
        results: result.results,
        executionTime: result.executionTime
      };

    } catch (error) {
      logger.error('Calculation error:', error);

      // Update calculation status to failed
      if (calculationData.calculationId) {
        await dataService.updateCalculationStatus(calculationData.calculationId, 'failed', {
          error: error.message
        });
      }

      throw error;
    }
  }

  /**
   * Execute calculation using Python actuarial engine
   * @param {object} payload - Calculation payload
   * @returns {Promise<object>} Calculation result
   */
  async simulateCalculation(payload) {
    const startTime = Date.now();
    const pythonEngine = require('./pythonEngineService');

    // Extract policies and assumptions from payload
    // Payloads comes from startCalculation which builds it from dataset
    const policies = payload.dataset.data;
    const assumptions = payload.assumptions;

    let result;
    try {
      if (payload.calculationType === 'IFRS17_CSM' || payload.calculationType === 'ifrs17') {
        result = await pythonEngine.calculateIFRS17(policies, assumptions);
      } else if (payload.calculationType === 'SOLVENCY_SCR' || payload.calculationType === 'solvency') {
        result = await pythonEngine.calculateSolvency(policies, assumptions);
      } else {
        throw new Error(`Unsupported calculation type: ${payload.calculationType}`);
      }
    } catch (error) {
      if (error.message.includes('circuit breaker')) {
        throw new Error('Service temporarily unavailable due to high failure rate. Please try again later.');
      }
      throw error;
    }

    const executionTime = (Date.now() - startTime) / 1000;

    return {
      results: result,
      executionTime
    };
  }

  // callPythonEngine method removed as it is now handled by pythonEngineService


  /**
   * Get calculation status
   * @param {string} calculationId - Calculation ID
   * @param {string} userId - User ID
   * @returns {Promise<object>} Calculation status
   */
  async getCalculationStatus(calculationId, userId) {
    try {
      const calculation = await dataService.getCalculation(calculationId, userId);
      const calculationModel = new CalculationModel(calculation);

      return {
        id: calculationModel.id,
        status: calculationModel.status,
        progress: calculationModel.getProgress(),
        executionTime: calculationModel.executionTime,
        createdAt: calculationModel.createdAt,
        completedAt: calculationModel.completedAt,
        hasError: !!calculationModel.error,
        error: calculationModel.error
      };

    } catch (error) {
      logger.error('Get calculation status error:', error);
      throw error;
    }
  }

  /**
   * Cancel calculation
   * @param {string} calculationId - Calculation ID
   * @param {string} userId - User ID
   * @returns {Promise<object>} Cancel result
   */
  async cancelCalculation(calculationId, userId) {
    try {
      const calculation = await dataService.getCalculation(calculationId, userId);

      if (calculation.status === 'completed' || calculation.status === 'failed') {
        throw new Error('Cannot cancel completed or failed calculation');
      }

      await dataService.updateCalculationStatus(calculationId, 'cancelled', {
        cancelledAt: new Date()
      });

      logger.info(`Calculation cancelled: ${calculationId}`);

      return {
        message: 'Calculation cancelled successfully'
      };

    } catch (error) {
      logger.error('Cancel calculation error:', error);
      throw error;
    }
  }

  /**
   * Get calculation history for user
   * @param {string} userId - User ID
   * @param {object} filters - Filter options
   * @returns {Promise<array>} Calculation history
   */
  async getCalculationHistory(userId, filters = {}) {
    try {
      const calculations = await dataService.getUserCalculations(userId);

      // Apply filters
      let filteredCalculations = calculations;

      if (filters.status) {
        filteredCalculations = filteredCalculations.filter(calc => calc.status === filters.status);
      }

      if (filters.calculationType) {
        filteredCalculations = filteredCalculations.filter(calc => calc.calculationType === filters.calculationType);
      }

      if (filters.dateFrom) {
        const dateFrom = new Date(filters.dateFrom);
        filteredCalculations = filteredCalculations.filter(calc => new Date(calc.createdAt) >= dateFrom);
      }

      if (filters.dateTo) {
        const dateTo = new Date(filters.dateTo);
        filteredCalculations = filteredCalculations.filter(calc => new Date(calc.createdAt) <= dateTo);
      }

      // Sort by creation date (newest first)
      filteredCalculations.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      // Apply pagination
      const page = parseInt(filters.page) || 1;
      const limit = parseInt(filters.limit) || 20;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;

      const paginatedCalculations = filteredCalculations.slice(startIndex, endIndex);

      return {
        calculations: paginatedCalculations,
        pagination: {
          page,
          limit,
          total: filteredCalculations.length,
          pages: Math.ceil(filteredCalculations.length / limit)
        }
      };

    } catch (error) {
      logger.error('Get calculation history error:', error);
      throw error;
    }
  }
}

module.exports = new CalculationService();
