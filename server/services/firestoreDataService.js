const admin = require('firebase-admin');
const logger = require('../utils/logger');

/**
 * Firestore Data Service
 * Handles storage and retrieval of validation runs
 */
class FirestoreDataService {

  constructor() {
    // Initialize Firebase Admin if not already initialized
    if (!admin.apps.length) {
      try {
        admin.initializeApp({
          credential: admin.credential.applicationDefault(),
        });
      } catch (error) {
        console.warn('Firebase Admin already initialized or failed to initialize:', error.message);
      }
    }
    
    this.db = admin.firestore();
    this.runsCollection = 'runs';
    this.metadataCollection = 'run_metadata';
  }

  /**
   * Save validation run to Firestore
   * @param {string} runId - Unique run identifier
   * @param {object} jsonData - Unified JSON data
   * @param {string} userId - User identifier
   * @returns {Promise<object>} Save result
   */
  async saveValidationRun(runId, jsonData, userId) {
    try {
      const batch = this.db.batch();
      
      // Save main data
      const dataRef = this.db.collection(this.runsCollection).doc(runId).collection('data').doc('main');
      batch.set(dataRef, {
        ...jsonData,
        saved_at: admin.firestore.FieldValue.serverTimestamp(),
        user_id: userId
      });

      // Save metadata separately
      const metadataRef = this.db.collection(this.runsCollection).doc(runId).collection('metadata').doc('info');
      const metadata = {
        run_id: runId,
        user_id: userId,
        upload_time: jsonData.meta.upload_time,
        product_type: jsonData.meta.product_type,
        scenario: jsonData.meta.scenario,
        version: jsonData.meta.version,
        description: jsonData.meta.description,
        valuation_date: jsonData.meta.valuation_date,
        policy_count: jsonData.policies ? jsonData.policies.length : 0,
        actuals_count: jsonData.actuals ? jsonData.actuals.length : 0,
        created_at: admin.firestore.FieldValue.serverTimestamp(),
        updated_at: admin.firestore.FieldValue.serverTimestamp()
      };
      
      batch.set(metadataRef, metadata);

      // Save user index for quick lookup
      const userIndexRef = this.db.collection('user_runs').doc(userId).collection('runs').doc(runId);
      batch.set(userIndexRef, {
        run_id: runId,
        upload_time: jsonData.meta.upload_time,
        product_type: jsonData.meta.product_type,
        created_at: admin.firestore.FieldValue.serverTimestamp()
      });

      await batch.commit();

      logger.info(`Successfully saved validation run: ${runId}`);
      
      return {
        success: true,
        runId,
        metadata
      };

    } catch (error) {
      logger.error(`Error saving validation run ${runId}:`, error);
      throw new Error(`Failed to save validation run: ${error.message}`);
    }
  }

  /**
   * Get validation run from Firestore
   * @param {string} runId - Run identifier
   * @returns {Promise<object>} Validation run data
   */
  async getValidationRun(runId) {
    try {
      const dataRef = this.db.collection(this.runsCollection).doc(runId).collection('data').doc('main');
      const metadataRef = this.db.collection(this.runsCollection).doc(runId).collection('metadata').doc('info');
      
      const [dataSnapshot, metadataSnapshot] = await Promise.all([
        dataRef.get(),
        metadataRef.get()
      ]);

      if (!dataSnapshot.exists) {
        throw new Error(`Validation run not found: ${runId}`);
      }

      const data = dataSnapshot.data();
      const metadata = metadataSnapshot.exists ? metadataSnapshot.data() : null;

      logger.info(`Successfully retrieved validation run: ${runId}`);

      return {
        data,
        metadata,
        runId
      };

    } catch (error) {
      logger.error(`Error retrieving validation run ${runId}:`, error);
      throw new Error(`Failed to retrieve validation run: ${error.message}`);
    }
  }

  /**
   * Get validation run metadata only
   * @param {string} runId - Run identifier
   * @returns {Promise<object>} Run metadata
   */
  async getValidationRunMetadata(runId) {
    try {
      const metadataRef = this.db.collection(this.runsCollection).doc(runId).collection('metadata').doc('info');
      const snapshot = await metadataRef.get();

      if (!snapshot.exists) {
        throw new Error(`Validation run metadata not found: ${runId}`);
      }

      return snapshot.data();

    } catch (error) {
      logger.error(`Error retrieving validation run metadata ${runId}:`, error);
      throw new Error(`Failed to retrieve validation run metadata: ${error.message}`);
    }
  }

  /**
   * List validation runs for a user
   * @param {string} userId - User identifier
   * @param {number} limit - Maximum number of runs to return
   * @returns {Promise<Array>} List of validation runs
   */
  async listUserValidationRuns(userId, limit = 50) {
    try {
      const userRunsRef = this.db.collection('user_runs').doc(userId).collection('runs')
        .orderBy('created_at', 'desc')
        .limit(limit);
      
      const snapshot = await userRunsRef.get();
      const runs = [];

      snapshot.forEach(doc => {
        runs.push({
          id: doc.id,
          ...doc.data()
        });
      });

      logger.info(`Retrieved ${runs.length} validation runs for user: ${userId}`);
      return runs;

    } catch (error) {
      logger.error(`Error listing validation runs for user ${userId}:`, error);
      throw new Error(`Failed to list validation runs: ${error.message}`);
    }
  }

  /**
   * Update validation run status
   * @param {string} runId - Run identifier
   * @param {string} status - New status
   * @param {object} additionalData - Additional data to update
   * @returns {Promise<object>} Update result
   */
  async updateValidationRunStatus(runId, status, additionalData = {}) {
    try {
      const metadataRef = this.db.collection(this.runsCollection).doc(runId).collection('metadata').doc('info');
      
      const updateData = {
        status,
        updated_at: admin.firestore.FieldValue.serverTimestamp(),
        ...additionalData
      };

      await metadataRef.update(updateData);

      logger.info(`Updated validation run status: ${runId} -> ${status}`);
      
      return {
        success: true,
        runId,
        status
      };

    } catch (error) {
      logger.error(`Error updating validation run status ${runId}:`, error);
      throw new Error(`Failed to update validation run status: ${error.message}`);
    }
  }

  /**
   * Delete validation run
   * @param {string} runId - Run identifier
   * @param {string} userId - User identifier
   * @returns {Promise<object>} Delete result
   */
  async deleteValidationRun(runId, userId) {
    try {
      const batch = this.db.batch();
      
      // Delete main data
      const dataRef = this.db.collection(this.runsCollection).doc(runId).collection('data').doc('main');
      batch.delete(dataRef);

      // Delete metadata
      const metadataRef = this.db.collection(this.runsCollection).doc(runId).collection('metadata').doc('info');
      batch.delete(metadataRef);

      // Delete user index
      const userIndexRef = this.db.collection('user_runs').doc(userId).collection('runs').doc(runId);
      batch.delete(userIndexRef);

      await batch.commit();

      logger.info(`Successfully deleted validation run: ${runId}`);
      
      return {
        success: true,
        runId
      };

    } catch (error) {
      logger.error(`Error deleting validation run ${runId}:`, error);
      throw new Error(`Failed to delete validation run: ${error.message}`);
    }
  }

  /**
   * Get validation run statistics
   * @param {string} userId - User identifier
   * @returns {Promise<object>} Statistics
   */
  async getValidationRunStats(userId) {
    try {
      const userRunsRef = this.db.collection('user_runs').doc(userId).collection('runs');
      const snapshot = await userRunsRef.get();
      
      const stats = {
        totalRuns: snapshot.size,
        productTypes: {},
        scenarios: {},
        recentRuns: []
      };

      snapshot.forEach(doc => {
        const data = doc.data();
        
        // Count by product type
        stats.productTypes[data.product_type] = (stats.productTypes[data.product_type] || 0) + 1;
        
        // Count by scenario
        stats.scenarios[data.scenario] = (stats.scenarios[data.scenario] || 0) + 1;
        
        // Add to recent runs (limit to 5)
        if (stats.recentRuns.length < 5) {
          stats.recentRuns.push({
            runId: doc.id,
            uploadTime: data.upload_time,
            productType: data.product_type
          });
        }
      });

      return stats;

    } catch (error) {
      logger.error(`Error getting validation run stats for user ${userId}:`, error);
      throw new Error(`Failed to get validation run stats: ${error.message}`);
    }
  }

  /**
   * Check if run ID exists
   * @param {string} runId - Run identifier
   * @returns {Promise<boolean>} Exists
   */
  async runIdExists(runId) {
    try {
      const metadataRef = this.db.collection(this.runsCollection).doc(runId).collection('metadata').doc('info');
      const snapshot = await metadataRef.get();
      return snapshot.exists;

    } catch (error) {
      logger.error(`Error checking if run ID exists ${runId}:`, error);
      return false;
    }
  }
}

module.exports = new FirestoreDataService();
