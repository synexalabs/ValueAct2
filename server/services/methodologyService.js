/**
 * Methodology Service
 * Handles CRUD operations for methodologies and formula versions
 */

const MethodologyModel = require('../models/Methodology');
const { db } = require('./firestoreService');
const logger = require('../utils/logger');

class MethodologyService {
  constructor() {
    this.methodologyCollection = 'methodologies';
    this.formulaVersionCollection = 'formulaVersions';
  }

  /**
   * Create a new methodology
   * @param {object} methodologyData - Methodology data
   * @param {string} userId - User ID creating the methodology
   * @returns {Promise<object>} Created methodology
   */
  async createMethodology(methodologyData, userId) {
    try {
      const methodology = MethodologyModel.createMethodologyDocument({
        ...methodologyData,
        createdBy: userId
      });

      const docRef = await db.collection(this.methodologyCollection).add(methodology);
      
      logger.info(`Methodology created: ${docRef.id}`, {
        methodologyId: docRef.id,
        name: methodologyData.name,
        userId
      });

      return {
        id: docRef.id,
        ...methodology
      };
    } catch (error) {
      logger.error('Error creating methodology:', error);
      throw new Error('Failed to create methodology');
    }
  }

  /**
   * Get methodology by ID
   * @param {string} methodologyId - Methodology ID
   * @returns {Promise<object|null>} Methodology data
   */
  async getMethodology(methodologyId) {
    try {
      const doc = await db.collection(this.methodologyCollection).doc(methodologyId).get();
      
      if (!doc.exists) {
        return null;
      }

      return {
        id: doc.id,
        ...doc.data()
      };
    } catch (error) {
      logger.error('Error getting methodology:', error);
      throw new Error('Failed to get methodology');
    }
  }

  /**
   * Get all methodologies
   * @param {object} filters - Optional filters
   * @returns {Promise<Array>} List of methodologies
   */
  async getAllMethodologies(filters = {}) {
    try {
      let query = db.collection(this.methodologyCollection);

      // Apply filters
      if (filters.category) {
        query = query.where('category', '==', filters.category);
      }
      if (filters.isActive !== undefined) {
        query = query.where('isActive', '==', filters.isActive);
      }
      if (filters.complexity) {
        query = query.where('complexity', '==', filters.complexity);
      }

      const snapshot = await query.orderBy('name').get();
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      logger.error('Error getting methodologies:', error);
      throw new Error('Failed to get methodologies');
    }
  }

  /**
   * Update methodology (creates new version)
   * @param {string} methodologyId - Methodology ID
   * @param {object} updateData - Update data
   * @param {string} userId - User ID making the update
   * @param {string} changeLog - Description of changes
   * @returns {Promise<object>} Updated methodology
   */
  async updateMethodology(methodologyId, updateData, userId, changeLog) {
    try {
      const existingMethodology = await this.getMethodology(methodologyId);
      
      if (!existingMethodology) {
        throw new Error('Methodology not found');
      }

      // Create new version
      const newVersion = this.incrementVersion(existingMethodology.version);
      const updatedMethodology = new MethodologyModel(existingMethodology);
      
      // Update fields
      Object.keys(updateData).forEach(key => {
        if (updateData[key] !== undefined) {
          updatedMethodology[key] = updateData[key];
        }
      });

      updatedMethodology.version = newVersion;
      updatedMethodology.updatedAt = new Date();

      // Add version history
      if (!updatedMethodology.versionHistory) {
        updatedMethodology.versionHistory = [];
      }
      updatedMethodology.versionHistory.push({
        version: existingMethodology.version,
        changeLog,
        changedBy: userId,
        changedAt: new Date()
      });

      await db.collection(this.methodologyCollection).doc(methodologyId).update(updatedMethodology.toJSON());

      logger.info(`Methodology updated: ${methodologyId}`, {
        methodologyId,
        oldVersion: existingMethodology.version,
        newVersion: newVersion,
        userId
      });

      return {
        id: methodologyId,
        ...updatedMethodology.toJSON()
      };
    } catch (error) {
      logger.error('Error updating methodology:', error);
      throw new Error('Failed to update methodology');
    }
  }

  /**
   * Add formula to methodology
   * @param {string} methodologyId - Methodology ID
   * @param {object} formulaData - Formula data
   * @param {string} userId - User ID
   * @returns {Promise<object>} Updated methodology
   */
  async addFormula(methodologyId, formulaData, userId) {
    try {
      const methodology = await this.getMethodology(methodologyId);
      
      if (!methodology) {
        throw new Error('Methodology not found');
      }

      const methodologyModel = new MethodologyModel(methodology);
      methodologyModel.addFormula(formulaData);

      await db.collection(this.methodologyCollection).doc(methodologyId).update(methodologyModel.toJSON());

      logger.info(`Formula added to methodology: ${methodologyId}`, {
        methodologyId,
        formulaId: formulaData.id,
        userId
      });

      return methodologyModel.toJSON();
    } catch (error) {
      logger.error('Error adding formula:', error);
      throw new Error('Failed to add formula');
    }
  }

  /**
   * Get formula versions for a methodology
   * @param {string} methodologyId - Methodology ID
   * @param {string} formulaId - Optional formula ID filter
   * @returns {Promise<Array>} List of formula versions
   */
  async getFormulaVersions(methodologyId, formulaId = null) {
    try {
      let query = db.collection(this.formulaVersionCollection)
        .where('methodologyId', '==', methodologyId);

      if (formulaId) {
        query = query.where('formulaId', '==', formulaId);
      }

      const snapshot = await query.orderBy('timestamp', 'desc').get();
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      logger.error('Error getting formula versions:', error);
      throw new Error('Failed to get formula versions');
    }
  }

  /**
   * Get methodology version history
   * @param {string} methodologyId - Methodology ID
   * @returns {Promise<Array>} Version history
   */
  async getMethodologyVersionHistory(methodologyId) {
    try {
      const methodology = await this.getMethodology(methodologyId);
      
      if (!methodology) {
        throw new Error('Methodology not found');
      }

      return methodology.versionHistory || [];
    } catch (error) {
      logger.error('Error getting methodology version history:', error);
      throw new Error('Failed to get version history');
    }
  }

  /**
   * Validate methodology
   * @param {string} methodologyId - Methodology ID
   * @returns {Promise<object>} Validation result
   */
  async validateMethodology(methodologyId) {
    try {
      const methodology = await this.getMethodology(methodologyId);
      
      if (!methodology) {
        throw new Error('Methodology not found');
      }

      const methodologyModel = new MethodologyModel(methodology);
      return methodologyModel.validate();
    } catch (error) {
      logger.error('Error validating methodology:', error);
      throw new Error('Failed to validate methodology');
    }
  }

  /**
   * Deactivate methodology
   * @param {string} methodologyId - Methodology ID
   * @param {string} userId - User ID
   * @returns {Promise<object>} Updated methodology
   */
  async deactivateMethodology(methodologyId, userId) {
    try {
      const methodology = await this.getMethodology(methodologyId);
      
      if (!methodology) {
        throw new Error('Methodology not found');
      }

      await db.collection(this.methodologyCollection).doc(methodologyId).update({
        isActive: false,
        updatedAt: new Date(),
        deactivatedBy: userId,
        deactivatedAt: new Date()
      });

      logger.info(`Methodology deactivated: ${methodologyId}`, {
        methodologyId,
        userId
      });

      return {
        id: methodologyId,
        ...methodology,
        isActive: false,
        deactivatedBy: userId,
        deactivatedAt: new Date()
      };
    } catch (error) {
      logger.error('Error deactivating methodology:', error);
      throw new Error('Failed to deactivate methodology');
    }
  }

  /**
   * Increment version number
   * @param {string} currentVersion - Current version
   * @returns {string} New version
   */
  incrementVersion(currentVersion) {
    const parts = currentVersion.split('.');
    const major = parseInt(parts[0]) || 0;
    const minor = parseInt(parts[1]) || 0;
    const patch = parseInt(parts[2]) || 0;
    
    return `${major}.${minor}.${patch + 1}`;
  }

  /**
   * Get methodology statistics
   * @returns {Promise<object>} Statistics
   */
  async getMethodologyStatistics() {
    try {
      const methodologiesSnapshot = await db.collection(this.methodologyCollection).get();
      const formulaVersionsSnapshot = await db.collection(this.formulaVersionCollection).get();

      const methodologies = methodologiesSnapshot.docs.map(doc => doc.data());
      const formulaVersions = formulaVersionsSnapshot.docs.map(doc => doc.data());

      const stats = {
        totalMethodologies: methodologies.length,
        activeMethodologies: methodologies.filter(m => m.isActive).length,
        totalFormulaVersions: formulaVersions.length,
        methodologiesByCategory: {},
        methodologiesByComplexity: {},
        recentActivity: formulaVersions
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
          .slice(0, 10)
      };

      // Group by category
      methodologies.forEach(m => {
        stats.methodologiesByCategory[m.category] = (stats.methodologiesByCategory[m.category] || 0) + 1;
      });

      // Group by complexity
      methodologies.forEach(m => {
        stats.methodologiesByComplexity[m.complexity] = (stats.methodologiesByComplexity[m.complexity] || 0) + 1;
      });

      return stats;
    } catch (error) {
      logger.error('Error getting methodology statistics:', error);
      throw new Error('Failed to get statistics');
    }
  }
}

module.exports = new MethodologyService();
