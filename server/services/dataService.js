const firestoreService = require('./firestoreService');
const DatasetModel = require('../models/Dataset');
const CalculationModel = require('../models/Calculation');
const logger = require('../utils/logger');

/**
 * Data service for handling dataset operations
 */
class DataService {
  
  /**
   * Upload and process CSV dataset
   * @param {object} uploadData - Upload data
   * @returns {Promise<object>} Upload result
   */
  async uploadDataset(uploadData) {
    const { userId, name, fileData, metadata } = uploadData;
    
    try {
      // Create dataset document
      const datasetDoc = DatasetModel.createDatasetDocument({
        userId,
        name,
        rowCount: fileData.length,
        columns: Object.keys(fileData[0] || {}),
        data: fileData,
        metadata
      });

      // Validate dataset
      const validation = DatasetModel.validateDataset(datasetDoc);
      if (!validation.isValid) {
        throw new Error(`Dataset validation failed: ${validation.errors.join(', ')}`);
      }

      // Save to Firestore
      const datasetId = await firestoreService.createDocument('user_data', datasetDoc);
      
      logger.info(`Dataset uploaded: ${datasetId} by user ${userId}`);
      
      return {
        datasetId,
        name: datasetDoc.name,
        rowCount: datasetDoc.rowCount,
        columns: datasetDoc.columns,
        message: 'Dataset uploaded successfully'
      };
      
    } catch (error) {
      logger.error('Dataset upload error:', error);
      throw error;
    }
  }

  /**
   * Get user's datasets
   * @param {string} userId - User ID
   * @returns {Promise<array>} User datasets
   */
  async getUserDatasets(userId) {
    try {
      const datasets = await firestoreService.getUserDatasets(userId);
      
      return datasets.map(dataset => {
        const datasetModel = new DatasetModel(dataset);
        return datasetModel.getSummary();
      });
      
    } catch (error) {
      logger.error('Get user datasets error:', error);
      throw error;
    }
  }

  /**
   * Get dataset by ID
   * @param {string} datasetId - Dataset ID
   * @param {string} userId - User ID
   * @returns {Promise<object>} Dataset data
   */
  async getDataset(datasetId, userId) {
    try {
      const dataset = await firestoreService.getDocument('user_data', datasetId);
      
      if (!dataset) {
        throw new Error('Dataset not found');
      }
      
      if (dataset.userId !== userId) {
        throw new Error('Access denied');
      }
      
      const datasetModel = new DatasetModel(dataset);
      return datasetModel.toJSON();
      
    } catch (error) {
      logger.error('Get dataset error:', error);
      throw error;
    }
  }

  /**
   * Get dataset preview (first N rows)
   * @param {string} datasetId - Dataset ID
   * @param {string} userId - User ID
   * @param {number} limit - Number of rows to return
   * @returns {Promise<object>} Dataset preview
   */
  async getDatasetPreview(datasetId, userId, limit = 10) {
    try {
      const dataset = await this.getDataset(datasetId, userId);
      const datasetModel = new DatasetModel(dataset);
      
      return {
        summary: datasetModel.getSummary(),
        columns: datasetModel.columns,
        sampleData: datasetModel.getSampleData(limit),
        columnStats: datasetModel.getColumnStats()
      };
      
    } catch (error) {
      logger.error('Get dataset preview error:', error);
      throw error;
    }
  }

  /**
   * Delete dataset
   * @param {string} datasetId - Dataset ID
   * @param {string} userId - User ID
   * @returns {Promise<object>} Delete result
   */
  async deleteDataset(datasetId, userId) {
    try {
      // Verify ownership
      const dataset = await this.getDataset(datasetId, userId);
      
      // Delete from Firestore
      await firestoreService.deleteDocument('user_data', datasetId);
      
      logger.info(`Dataset deleted: ${datasetId} by user ${userId}`);
      
      return {
        message: 'Dataset deleted successfully'
      };
      
    } catch (error) {
      logger.error('Delete dataset error:', error);
      throw error;
    }
  }

  /**
   * Update dataset metadata
   * @param {string} datasetId - Dataset ID
   * @param {string} userId - User ID
   * @param {object} updateData - Update data
   * @returns {Promise<object>} Update result
   */
  async updateDataset(datasetId, userId, updateData) {
    try {
      // Verify ownership
      await this.getDataset(datasetId, userId);
      
      // Prepare update data
      const allowedUpdates = {
        name: updateData.name,
        description: updateData.description,
        tags: updateData.tags,
        isPublic: updateData.isPublic
      };
      
      // Remove undefined values
      Object.keys(allowedUpdates).forEach(key => {
        if (allowedUpdates[key] === undefined) {
          delete allowedUpdates[key];
        }
      });
      
      // Update in Firestore
      await firestoreService.updateDocument('user_data', datasetId, allowedUpdates);
      
      logger.info(`Dataset updated: ${datasetId} by user ${userId}`);
      
      return {
        message: 'Dataset updated successfully'
      };
      
    } catch (error) {
      logger.error('Update dataset error:', error);
      throw error;
    }
  }

  /**
   * Create calculation job
   * @param {object} calculationData - Calculation data
   * @returns {Promise<object>} Calculation result
   */
  async createCalculation(calculationData) {
    const { userId, datasetId, calculationType, inputParams, metadata } = calculationData;
    
    try {
      // Validate input parameters
      const validation = CalculationModel.validateInputParams(calculationType, inputParams);
      if (!validation.isValid) {
        throw new Error(`Input validation failed: ${validation.errors.join(', ')}`);
      }

      // Verify dataset ownership
      await this.getDataset(datasetId, userId);

      // Create calculation document
      const calculationDoc = CalculationModel.createCalculationDocument({
        userId,
        datasetId,
        calculationType,
        inputParams,
        metadata
      });

      // Save to Firestore
      const calculationId = await firestoreService.createDocument('calculations', calculationDoc);
      
      logger.info(`Calculation created: ${calculationId} by user ${userId}`);
      
      return {
        calculationId,
        status: calculationDoc.status,
        message: 'Calculation job created successfully'
      };
      
    } catch (error) {
      logger.error('Create calculation error:', error);
      throw error;
    }
  }

  /**
   * Get user's calculations
   * @param {string} userId - User ID
   * @returns {Promise<array>} User calculations
   */
  async getUserCalculations(userId) {
    try {
      const calculations = await firestoreService.getUserCalculations(userId);
      
      return calculations.map(calc => {
        const calculationModel = new CalculationModel(calc);
        return calculationModel.getSummary();
      });
      
    } catch (error) {
      logger.error('Get user calculations error:', error);
      throw error;
    }
  }

  /**
   * Get calculation by ID
   * @param {string} calculationId - Calculation ID
   * @param {string} userId - User ID
   * @returns {Promise<object>} Calculation data
   */
  async getCalculation(calculationId, userId) {
    try {
      const calculation = await firestoreService.getDocument('calculations', calculationId);
      
      if (!calculation) {
        throw new Error('Calculation not found');
      }
      
      if (calculation.userId !== userId) {
        throw new Error('Access denied');
      }
      
      const calculationModel = new CalculationModel(calculation);
      return calculationModel.toJSON();
      
    } catch (error) {
      logger.error('Get calculation error:', error);
      throw error;
    }
  }

  /**
   * Update calculation status
   * @param {string} calculationId - Calculation ID
   * @param {string} status - New status
   * @param {object} additionalData - Additional data
   * @returns {Promise<object>} Update result
   */
  async updateCalculationStatus(calculationId, status, additionalData = {}) {
    try {
      const calculation = await firestoreService.getDocument('calculations', calculationId);
      
      if (!calculation) {
        throw new Error('Calculation not found');
      }
      
      const calculationModel = new CalculationModel(calculation);
      calculationModel.updateStatus(status, additionalData);
      
      // Update in Firestore
      await firestoreService.updateDocument('calculations', calculationId, {
        status: calculationModel.status,
        startedAt: calculationModel.startedAt,
        completedAt: calculationModel.completedAt,
        executionTime: calculationModel.executionTime,
        results: calculationModel.results,
        error: calculationModel.error
      });
      
      logger.info(`Calculation status updated: ${calculationId} to ${status}`);
      
      return {
        message: 'Calculation status updated successfully'
      };
      
    } catch (error) {
      logger.error('Update calculation status error:', error);
      throw error;
    }
  }
}

module.exports = new DataService();
