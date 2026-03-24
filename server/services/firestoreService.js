/**
 * Firestore Service
 * Centralized Firestore database connection and utilities
 */

const admin = require('firebase-admin');
const logger = require('../utils/logger');

let db = null;

// Initialize Firestore if not already initialized
function initializeFirestore() {
  if (!db && admin.apps.length > 0) {
    try {
      db = admin.firestore();
      
      // Configure Firestore settings
      db.settings({
        timestampsInSnapshots: true,
        ignoreUndefinedProperties: true
      });
      
      logger.info('Firestore initialized successfully');
    } catch (error) {
      logger.error('Error initializing Firestore:', error);
      throw error;
    }
  }
  return db;
}

// Get Firestore instance
function getFirestore() {
  if (!db) {
    db = initializeFirestore();
  }
  return db;
}

// Utility functions for Firestore operations
const firestoreUtils = {
  /**
   * Convert Firestore timestamp to JavaScript Date
   * @param {object} timestamp - Firestore timestamp
   * @returns {Date} JavaScript Date
   */
  timestampToDate(timestamp) {
    if (!timestamp) return null;
    if (timestamp.toDate) {
      return timestamp.toDate();
    }
    return new Date(timestamp);
  },

  /**
   * Convert JavaScript Date to Firestore timestamp
   * @param {Date} date - JavaScript Date
   * @returns {object} Firestore timestamp
   */
  dateToTimestamp(date) {
    if (!date) return null;
    return admin.firestore.Timestamp.fromDate(date);
  },

  /**
   * Batch write operations
   * @param {Array} operations - Array of write operations
   * @returns {Promise} Batch write result
   */
  async batchWrite(operations) {
    const firestore = getFirestore();
    const batch = firestore.batch();
    
    operations.forEach(operation => {
      const { type, collection, docId, data } = operation;
      const docRef = firestore.collection(collection).doc(docId);
      
      switch (type) {
        case 'set':
          batch.set(docRef, data);
          break;
        case 'update':
          batch.update(docRef, data);
          break;
        case 'delete':
          batch.delete(docRef);
          break;
        default:
          throw new Error(`Unknown batch operation type: ${type}`);
      }
    });
    
    return await batch.commit();
  },

  /**
   * Get document with error handling
   * @param {string} collection - Collection name
   * @param {string} docId - Document ID
   * @returns {Promise<object|null>} Document data or null
   */
  async getDocument(collection, docId) {
    try {
      const firestore = getFirestore();
      const doc = await firestore.collection(collection).doc(docId).get();
      
      if (!doc.exists) {
        return null;
      }
      
      return {
        id: doc.id,
        ...doc.data()
      };
    } catch (error) {
      logger.error(`Error getting document ${docId} from ${collection}:`, error);
      throw error;
    }
  },

  /**
   * Set document with error handling
   * @param {string} collection - Collection name
   * @param {string} docId - Document ID
   * @param {object} data - Document data
   * @returns {Promise<object>} Document reference
   */
  async setDocument(collection, docId, data) {
    try {
      const firestore = getFirestore();
      const docRef = firestore.collection(collection).doc(docId);
      
      await docRef.set(data);
      
      return docRef;
    } catch (error) {
      logger.error(`Error setting document ${docId} in ${collection}:`, error);
      throw error;
    }
  },

  /**
   * Update document with error handling
   * @param {string} collection - Collection name
   * @param {string} docId - Document ID
   * @param {object} data - Update data
   * @returns {Promise<object>} Document reference
   */
  async updateDocument(collection, docId, data) {
    try {
      const firestore = getFirestore();
      const docRef = firestore.collection(collection).doc(docId);
      
      await docRef.update(data);
      
      return docRef;
    } catch (error) {
      logger.error(`Error updating document ${docId} in ${collection}:`, error);
      throw error;
    }
  },

  /**
   * Delete document with error handling
   * @param {string} collection - Collection name
   * @param {string} docId - Document ID
   * @returns {Promise<void>}
   */
  async deleteDocument(collection, docId) {
    try {
      const firestore = getFirestore();
      await firestore.collection(collection).doc(docId).delete();
    } catch (error) {
      logger.error(`Error deleting document ${docId} from ${collection}:`, error);
      throw error;
    }
  },

  /**
   * Query collection with error handling
   * @param {string} collection - Collection name
   * @param {Array} whereClauses - Array of where clauses
   * @param {string} orderBy - Field to order by
   * @param {string} orderDirection - Order direction (asc/desc)
   * @param {number} limit - Maximum number of documents
   * @returns {Promise<Array>} Array of documents
   */
  async queryCollection(collection, whereClauses = [], orderBy = null, orderDirection = 'asc', limit = null) {
    try {
      const firestore = getFirestore();
      let query = firestore.collection(collection);
      
      // Apply where clauses
      whereClauses.forEach(clause => {
        query = query.where(clause.field, clause.operator, clause.value);
      });
      
      // Apply ordering
      if (orderBy) {
        query = query.orderBy(orderBy, orderDirection);
      }
      
      // Apply limit
      if (limit) {
        query = query.limit(limit);
      }
      
      const snapshot = await query.get();
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      logger.error(`Error querying collection ${collection}:`, error);
      throw error;
    }
  },

  /**
   * Add document to collection
   * @param {string} collection - Collection name
   * @param {object} data - Document data
   * @returns {Promise<object>} Document reference
   */
  async addDocument(collection, data) {
    try {
      const firestore = getFirestore();
      const docRef = await firestore.collection(collection).add(data);
      
      return docRef;
    } catch (error) {
      logger.error(`Error adding document to ${collection}:`, error);
      throw error;
    }
  }
};

module.exports = {
  get db() { return getFirestore(); },
  initializeFirestore,
  getFirestore,
  ...firestoreUtils
};