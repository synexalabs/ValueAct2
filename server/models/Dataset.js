/**
 * Dataset data model for Firestore
 */

class DatasetModel {
  constructor(data) {
    this.id = data.id;
    this.userId = data.userId;
    this.name = data.name;
    this.uploadedAt = data.uploadedAt;
    this.rowCount = data.rowCount;
    this.columns = data.columns || [];
    this.data = data.data || [];
    this.metadata = data.metadata || {};
    this.status = data.status || 'active';
    this.tags = data.tags || [];
    this.description = data.description || '';
    this.isPublic = data.isPublic || false;
  }

  /**
   * Create a new dataset document structure
   * @param {object} datasetData - Dataset data
   * @returns {object} Dataset document
   */
  static createDatasetDocument(datasetData) {
    return {
      userId: datasetData.userId,
      name: datasetData.name,
      uploadedAt: new Date(),
      rowCount: datasetData.rowCount,
      columns: datasetData.columns,
      data: datasetData.data,
      metadata: {
        fileSize: datasetData.metadata.fileSize,
        originalFilename: datasetData.metadata.originalFilename,
        uploadMethod: datasetData.metadata.uploadMethod || 'web',
        fileType: datasetData.metadata.fileType || 'csv',
        encoding: datasetData.metadata.encoding || 'utf-8',
        delimiter: datasetData.metadata.delimiter || ','
      },
      status: 'active',
      tags: datasetData.tags || [],
      description: datasetData.description || '',
      isPublic: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  /**
   * Validate dataset structure
   * @param {object} datasetData - Dataset data to validate
   * @returns {object} Validation result
   */
  static validateDataset(datasetData) {
    const errors = [];

    if (!datasetData.name || datasetData.name.trim().length === 0) {
      errors.push('Dataset name is required');
    }

    if (!datasetData.columns || datasetData.columns.length === 0) {
      errors.push('Dataset must have at least one column');
    }

    if (!datasetData.data || datasetData.data.length === 0) {
      errors.push('Dataset must contain data');
    }

    if (datasetData.rowCount !== datasetData.data.length) {
      errors.push('Row count does not match actual data length');
    }

    // Validate required columns for actuarial data
    const requiredColumns = ['policy_id', 'issue_date', 'face_amount'];
    const missingColumns = requiredColumns.filter(col => 
      !datasetData.columns.includes(col)
    );

    if (missingColumns.length > 0) {
      errors.push(`Missing required columns: ${missingColumns.join(', ')}`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Get dataset summary
   * @returns {object} Dataset summary
   */
  getSummary() {
    return {
      id: this.id,
      name: this.name,
      rowCount: this.rowCount,
      columnCount: this.columns.length,
      uploadedAt: this.uploadedAt,
      fileSize: this.metadata.fileSize,
      status: this.status,
      tags: this.tags
    };
  }

  /**
   * Get column statistics
   * @returns {object} Column statistics
   */
  getColumnStats() {
    const stats = {};
    
    this.columns.forEach(column => {
      const values = this.data.map(row => row[column]);
      const numericValues = values.filter(val => !isNaN(parseFloat(val)) && isFinite(val));
      
      stats[column] = {
        total: values.length,
        numeric: numericValues.length,
        unique: new Set(values).size,
        nullCount: values.filter(val => val === null || val === undefined || val === '').length,
        ...(numericValues.length > 0 && {
          min: Math.min(...numericValues),
          max: Math.max(...numericValues),
          mean: numericValues.reduce((a, b) => a + b, 0) / numericValues.length
        })
      };
    });

    return stats;
  }

  /**
   * Get sample data (first N rows)
   * @param {number} limit - Number of rows to return
   * @returns {array} Sample data
   */
  getSampleData(limit = 10) {
    return this.data.slice(0, limit);
  }

  /**
   * Add tag to dataset
   * @param {string} tag - Tag to add
   */
  addTag(tag) {
    if (!this.tags.includes(tag)) {
      this.tags.push(tag);
    }
  }

  /**
   * Remove tag from dataset
   * @param {string} tag - Tag to remove
   */
  removeTag(tag) {
    this.tags = this.tags.filter(t => t !== tag);
  }

  /**
   * Convert to JSON
   * @returns {object} Dataset data
   */
  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      name: this.name,
      uploadedAt: this.uploadedAt,
      rowCount: this.rowCount,
      columns: this.columns,
      data: this.data,
      metadata: this.metadata,
      status: this.status,
      tags: this.tags,
      description: this.description,
      isPublic: this.isPublic
    };
  }

  /**
   * Convert to public JSON (for sharing)
   * @returns {object} Public dataset data
   */
  toPublicJSON() {
    return {
      id: this.id,
      name: this.name,
      uploadedAt: this.uploadedAt,
      rowCount: this.rowCount,
      columns: this.columns,
      metadata: {
        fileSize: this.metadata.fileSize,
        fileType: this.metadata.fileType
      },
      status: this.status,
      tags: this.tags,
      description: this.description,
      isPublic: this.isPublic
    };
  }
}

module.exports = DatasetModel;
