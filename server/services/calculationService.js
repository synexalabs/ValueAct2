const firestoreService = require('./firestoreService');
const logger = require('../utils/logger');

const COLLECTION = 'calculations';

class CalculationService {

  async startCalculation(calculationData) {
    const { userId, calculationType, inputParams, metadata } = calculationData;

    try {
      const pythonEngine = require('./pythonEngineService');

      let result;
      if (calculationType === 'ifrs17') {
        result = await pythonEngine.calculateIFRS17(inputParams.portfolio, inputParams.assumptions);
      } else if (calculationType === 'solvency') {
        result = await pythonEngine.calculateSolvency(inputParams.portfolio, inputParams.assumptions);
      } else {
        throw new Error(`Unsupported calculation type: ${calculationType}`);
      }

      const docRef = await firestoreService.addDocument(COLLECTION, {
        userId,
        calculationType,
        status: 'completed',
        inputParams,
        results: result,
        metadata: metadata || {},
        createdAt: new Date(),
        completedAt: new Date()
      });

      logger.info(`Calculation completed: ${docRef.id}`);

      return {
        calculationId: docRef.id,
        status: 'completed',
        results: result,
        executionTime: 0
      };

    } catch (error) {
      logger.error('Calculation error:', error);
      throw error;
    }
  }

  async getCalculationStatus(calculationId, userId) {
    const calculation = await firestoreService.getDocument(COLLECTION, calculationId);

    if (!calculation) {
      throw new Error('Calculation not found');
    }
    if (calculation.userId !== userId) {
      throw new Error('Access denied');
    }

    return {
      id: calculation.id,
      status: calculation.status,
      executionTime: calculation.executionTime,
      createdAt: calculation.createdAt,
      completedAt: calculation.completedAt,
      hasError: !!calculation.error,
      error: calculation.error
    };
  }

  async cancelCalculation(calculationId, userId) {
    const calculation = await firestoreService.getDocument(COLLECTION, calculationId);

    if (!calculation) throw new Error('Calculation not found');
    if (calculation.userId !== userId) throw new Error('Access denied');
    if (['completed', 'failed'].includes(calculation.status)) {
      throw new Error('Cannot cancel completed or failed calculation');
    }

    await firestoreService.updateDocument(COLLECTION, calculationId, {
      status: 'cancelled',
      cancelledAt: new Date()
    });

    return { message: 'Calculation cancelled successfully' };
  }

  async saveResult(userId, calculationType, inputs, summary) {
    try {
      await firestoreService.addDocument(COLLECTION, {
        userId,
        calculationType,
        status: 'completed',
        inputs,
        summary,
        createdAt: new Date(),
      });
    } catch (err) {
      // Non-blocking — don't fail the response if history save fails
      logger.warn('Failed to save calculation history:', err.message);
    }
  }

  async getCalculationHistory(userId, filters = {}) {
    const calculations = await firestoreService.queryCollection(
      COLLECTION,
      [{ field: 'userId', operator: '==', value: userId }],
      'createdAt',
      'desc'
    );

    let filtered = calculations;

    if (filters.status) {
      filtered = filtered.filter(c => c.status === filters.status);
    }
    if (filters.calculationType) {
      filtered = filtered.filter(c => c.calculationType === filters.calculationType);
    }

    const page = parseInt(filters.page) || 1;
    const limit = parseInt(filters.limit) || 20;
    const start = (page - 1) * limit;

    return {
      calculations: filtered.slice(start, start + limit),
      pagination: {
        page,
        limit,
        total: filtered.length,
        pages: Math.ceil(filtered.length / limit)
      }
    };
  }
}

module.exports = new CalculationService();
