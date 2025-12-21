/**
 * Methodology Controller
 * Handles HTTP requests for methodology management
 */

const methodologyService = require('../services/methodologyService');
const logger = require('../utils/logger');
const { validationResult } = require('express-validator');

class MethodologyController {
  /**
   * Create a new methodology
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  async createMethodology(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { name, description, category, complexity, formulas, variables, assumptions, validationRules, regulatoryReferences } = req.body;
      const userId = req.user?.uid || 'system';

      const methodologyData = {
        name,
        description,
        category,
        complexity,
        formulas: formulas || [],
        variables: variables || [],
        assumptions: assumptions || [],
        validationRules: validationRules || [],
        regulatoryReferences: regulatoryReferences || []
      };

      const methodology = await methodologyService.createMethodology(methodologyData, userId);

      res.status(201).json({
        success: true,
        message: 'Methodology created successfully',
        data: methodology
      });
    } catch (error) {
      logger.error('Error in createMethodology:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Internal server error'
      });
    }
  }

  /**
   * Get methodology by ID
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  async getMethodology(req, res) {
    try {
      const { id } = req.params;
      const methodology = await methodologyService.getMethodology(id);

      if (!methodology) {
        return res.status(404).json({
          success: false,
          message: 'Methodology not found'
        });
      }

      res.json({
        success: true,
        data: methodology
      });
    } catch (error) {
      logger.error('Error in getMethodology:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Internal server error'
      });
    }
  }

  /**
   * Get all methodologies
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  async getAllMethodologies(req, res) {
    try {
      const filters = {
        category: req.query.category,
        isActive: req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined,
        complexity: req.query.complexity
      };

      const methodologies = await methodologyService.getAllMethodologies(filters);

      res.json({
        success: true,
        data: methodologies,
        count: methodologies.length
      });
    } catch (error) {
      logger.error('Error in getAllMethodologies:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Internal server error'
      });
    }
  }

  /**
   * Update methodology
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  async updateMethodology(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { id } = req.params;
      const { changeLog, ...updateData } = req.body;
      const userId = req.user?.uid || 'system';

      if (!changeLog) {
        return res.status(400).json({
          success: false,
          message: 'Change log is required for methodology updates'
        });
      }

      const methodology = await methodologyService.updateMethodology(id, updateData, userId, changeLog);

      res.json({
        success: true,
        message: 'Methodology updated successfully',
        data: methodology
      });
    } catch (error) {
      logger.error('Error in updateMethodology:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Internal server error'
      });
    }
  }

  /**
   * Add formula to methodology
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  async addFormula(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { id } = req.params;
      const { formulaData } = req.body;
      const userId = req.user?.uid || 'system';

      const methodology = await methodologyService.addFormula(id, formulaData, userId);

      res.json({
        success: true,
        message: 'Formula added successfully',
        data: methodology
      });
    } catch (error) {
      logger.error('Error in addFormula:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Internal server error'
      });
    }
  }

  /**
   * Get formula versions
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  async getFormulaVersions(req, res) {
    try {
      const { id } = req.params;
      const { formulaId } = req.query;

      const versions = await methodologyService.getFormulaVersions(id, formulaId);

      res.json({
        success: true,
        data: versions,
        count: versions.length
      });
    } catch (error) {
      logger.error('Error in getFormulaVersions:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Internal server error'
      });
    }
  }

  /**
   * Get methodology version history
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  async getVersionHistory(req, res) {
    try {
      const { id } = req.params;
      const history = await methodologyService.getMethodologyVersionHistory(id);

      res.json({
        success: true,
        data: history,
        count: history.length
      });
    } catch (error) {
      logger.error('Error in getVersionHistory:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Internal server error'
      });
    }
  }

  /**
   * Validate methodology
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  async validateMethodology(req, res) {
    try {
      const { id } = req.params;
      const validation = await methodologyService.validateMethodology(id);

      res.json({
        success: true,
        data: validation
      });
    } catch (error) {
      logger.error('Error in validateMethodology:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Internal server error'
      });
    }
  }

  /**
   * Deactivate methodology
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  async deactivateMethodology(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user?.uid || 'system';

      const methodology = await methodologyService.deactivateMethodology(id, userId);

      res.json({
        success: true,
        message: 'Methodology deactivated successfully',
        data: methodology
      });
    } catch (error) {
      logger.error('Error in deactivateMethodology:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Internal server error'
      });
    }
  }

  /**
   * Get methodology statistics
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  async getStatistics(req, res) {
    try {
      const statistics = await methodologyService.getMethodologyStatistics();

      res.json({
        success: true,
        data: statistics
      });
    } catch (error) {
      logger.error('Error in getStatistics:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Internal server error'
      });
    }
  }

  /**
   * Export methodology as PDF
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  async exportMethodology(req, res) {
    try {
      const { id } = req.params;
      const { format = 'pdf' } = req.query;

      const methodology = await methodologyService.getMethodology(id);

      if (!methodology) {
        return res.status(404).json({
          success: false,
          message: 'Methodology not found'
        });
      }

      // For now, return JSON data
      // In the future, this could generate actual PDF documents
      res.json({
        success: true,
        message: 'Methodology export data',
        data: methodology,
        format: format
      });
    } catch (error) {
      logger.error('Error in exportMethodology:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Internal server error'
      });
    }
  }
}

// Export individual functions for use in routes
const controller = new MethodologyController();

module.exports = {
  createMethodology: controller.createMethodology.bind(controller),
  getMethodology: controller.getMethodology.bind(controller),
  getAllMethodologies: controller.getAllMethodologies.bind(controller),
  updateMethodology: controller.updateMethodology.bind(controller),
  deactivateMethodology: controller.deactivateMethodology.bind(controller),
  addFormula: controller.addFormula.bind(controller),
  getFormulaVersions: controller.getFormulaVersions.bind(controller),
  getVersionHistory: controller.getVersionHistory.bind(controller),
  validateMethodology: controller.validateMethodology.bind(controller),
  exportMethodology: controller.exportMethodology.bind(controller),
  getStatistics: controller.getStatistics.bind(controller)
};
