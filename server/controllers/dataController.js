const dataService = require('../services/dataService');
const csvProcessor = require('../services/csvProcessor');
const logger = require('../utils/logger');
const multer = require('multer');

/**
 * Data controller for handling data-related requests
 */
class DataController {
  
  /**
   * Upload CSV file
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  async uploadCSVFile(req, res) {
    try {
      const userId = req.user.id;
      
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'No file uploaded'
        });
      }

      // Process CSV file
      const processedData = await csvProcessor.processCSVFile(
        req.file.buffer,
        req.file.originalname
      );

      // Upload dataset
      const result = await dataService.uploadDataset({
        userId,
        name: req.file.originalname.replace('.csv', ''),
        fileData: processedData.data,
        metadata: {
          ...processedData.metadata,
          fileSize: req.file.size / 1024 / 1024, // MB
          originalFilename: req.file.originalname,
          uploadMethod: 'file'
        }
      });

      res.status(201).json({
        success: true,
        message: result.message,
        dataset: {
          id: result.datasetId,
          name: result.name,
          rowCount: result.rowCount,
          columns: result.columns
        },
        validation: processedData.validation,
        qualityReport: csvProcessor.generateQualityReport(processedData)
      });

    } catch (error) {
      logger.error('CSV file upload error:', error);
      
      if (error.message.includes('validation failed')) {
        return res.status(400).json({
          success: false,
          error: error.message
        });
      }
      
      res.status(500).json({
        success: false,
        error: 'Failed to upload CSV file'
      });
    }
  }

  /**
   * Upload dataset
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  async uploadDataset(req, res) {
    try {
      const { name, data, metadata } = req.body;
      const userId = req.user.id;
      
      // Process CSV data if it's a string (from frontend)
      let processedData;
      if (typeof data === 'string') {
        try {
          processedData = JSON.parse(data);
        } catch (parseError) {
          throw new Error('Invalid data format');
        }
      } else {
        processedData = data;
      }
      
      const result = await dataService.uploadDataset({
        userId,
        name,
        fileData: processedData,
        metadata
      });
      
      res.status(201).json({
        success: true,
        message: result.message,
        dataset: {
          id: result.datasetId,
          name: result.name,
          rowCount: result.rowCount,
          columns: result.columns
        }
      });
      
    } catch (error) {
      logger.error('Upload dataset error:', error);
      
      if (error.message.includes('validation failed')) {
        return res.status(400).json({
          success: false,
          error: error.message
        });
      }
      
      res.status(500).json({
        success: false,
        error: 'Failed to upload dataset'
      });
    }
  }

  /**
   * Get user's datasets
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  async getUserDatasets(req, res) {
    try {
      const userId = req.user.id;
      const datasets = await dataService.getUserDatasets(userId);
      
      res.json({
        success: true,
        datasets
      });
      
    } catch (error) {
      logger.error('Get user datasets error:', error);
      
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve datasets'
      });
    }
  }

  /**
   * Get dataset by ID
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  async getDataset(req, res) {
    try {
      const { datasetId } = req.params;
      const userId = req.user.id;
      
      const dataset = await dataService.getDataset(datasetId, userId);
      
      res.json({
        success: true,
        dataset
      });
      
    } catch (error) {
      logger.error('Get dataset error:', error);
      
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
        error: 'Failed to retrieve dataset'
      });
    }
  }

  /**
   * Get dataset preview
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  async getDatasetPreview(req, res) {
    try {
      const { datasetId } = req.params;
      const { limit = 10 } = req.query;
      const userId = req.user.id;
      
      const preview = await dataService.getDatasetPreview(datasetId, userId, parseInt(limit));
      
      res.json({
        success: true,
        preview
      });
      
    } catch (error) {
      logger.error('Get dataset preview error:', error);
      
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
        error: 'Failed to retrieve dataset preview'
      });
    }
  }

  /**
   * Delete dataset
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  async deleteDataset(req, res) {
    try {
      const { datasetId } = req.params;
      const userId = req.user.id;
      
      const result = await dataService.deleteDataset(datasetId, userId);
      
      res.json({
        success: true,
        message: result.message
      });
      
    } catch (error) {
      logger.error('Delete dataset error:', error);
      
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
        error: 'Failed to delete dataset'
      });
    }
  }

  /**
   * Update dataset
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  async updateDataset(req, res) {
    try {
      const { datasetId } = req.params;
      const userId = req.user.id;
      const updateData = req.body;
      
      const result = await dataService.updateDataset(datasetId, userId, updateData);
      
      res.json({
        success: true,
        message: result.message
      });
      
    } catch (error) {
      logger.error('Update dataset error:', error);
      
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
        error: 'Failed to update dataset'
      });
    }
  }

  /**
   * Create calculation
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  async createCalculation(req, res) {
    try {
      const { datasetId, calculationType, inputParams } = req.body;
      const userId = req.user.id;
      const metadata = {
        requestId: req.headers['x-request-id'],
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip || req.connection.remoteAddress
      };
      
      const result = await dataService.createCalculation({
        userId,
        datasetId,
        calculationType,
        inputParams,
        metadata
      });
      
      res.status(201).json({
        success: true,
        message: result.message,
        calculation: {
          id: result.calculationId,
          status: result.status
        }
      });
      
    } catch (error) {
      logger.error('Create calculation error:', error);
      
      if (error.message.includes('validation failed')) {
        return res.status(400).json({
          success: false,
          error: error.message
        });
      }
      
      res.status(500).json({
        success: false,
        error: 'Failed to create calculation'
      });
    }
  }

  /**
   * Get user's calculations
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  async getUserCalculations(req, res) {
    try {
      const userId = req.user.id;
      const calculations = await dataService.getUserCalculations(userId);
      
      res.json({
        success: true,
        calculations
      });
      
    } catch (error) {
      logger.error('Get user calculations error:', error);
      
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve calculations'
      });
    }
  }

  /**
   * Get calculation by ID
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  async getCalculation(req, res) {
    try {
      const { calculationId } = req.params;
      const userId = req.user.id;
      
      const calculation = await dataService.getCalculation(calculationId, userId);
      
      res.json({
        success: true,
        calculation
      });
      
    } catch (error) {
      logger.error('Get calculation error:', error);
      
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
        error: 'Failed to retrieve calculation'
      });
    }
  }
}

module.exports = new DataController();
