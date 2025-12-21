const Papa = require('papaparse');
const logger = require('../utils/logger');

/**
 * CSV processing service for handling CSV file uploads and validation
 */
class CSVProcessor {
  
  /**
   * Parse CSV file buffer
   * @param {Buffer} fileBuffer - CSV file buffer
   * @param {object} options - Parsing options
   * @returns {Promise<object>} Parsed CSV data
   */
  async parseCSV(fileBuffer, options = {}) {
    return new Promise((resolve, reject) => {
      const csvString = fileBuffer.toString('utf8');
      
      Papa.parse(csvString, {
        header: true,
        skipEmptyLines: true,
        trimHeaders: true,
        ...options,
        complete: (results) => {
          if (results.errors.length > 0) {
            const error = results.errors[0];
            logger.error('CSV parsing error:', error);
            reject(new Error(`CSV parsing error: ${error.message}`));
            return;
          }
          
          resolve({
            data: results.data,
            columns: results.meta.fields,
            rowCount: results.data.length,
            parseErrors: results.errors
          });
        },
        error: (error) => {
          logger.error('CSV parsing failed:', error);
          reject(new Error(`Failed to parse CSV: ${error.message}`));
        }
      });
    });
  }

  /**
   * Validate CSV structure and data
   * @param {object} parsedData - Parsed CSV data
   * @returns {object} Validation result
   */
  validateCSV(parsedData) {
    const { data, columns } = parsedData;
    const errors = [];
    const warnings = [];

    // Check if CSV has data
    if (!data || data.length === 0) {
      errors.push('CSV file is empty or contains no data');
      return { isValid: false, errors, warnings };
    }

    // Check if CSV has columns
    if (!columns || columns.length === 0) {
      errors.push('CSV file has no column headers');
      return { isValid: false, errors, warnings };
    }

    // Check required columns for Term Life actuarial data
    const requiredColumns = ['policy_id', 'issue_date', 'issue_age', 'sum_assured', 'premium', 'policy_term'];
    const missingColumns = requiredColumns.filter(col => !columns.includes(col));
    
    if (missingColumns.length > 0) {
      errors.push(`Missing required columns: ${missingColumns.join(', ')}`);
    }

    // Check for actuarial reasonableness
    const actuarialWarnings = this.validateActuarialReasonableness(data);
    warnings.push(...actuarialWarnings);

    // Validate data types and content
    data.forEach((row, index) => {
      // Check policy_id
      if (row.policy_id && typeof row.policy_id !== 'string') {
        errors.push(`Row ${index + 1}: policy_id must be a string`);
      }

      // Check sum_assured
      if (row.sum_assured) {
        const sumAssured = parseFloat(row.sum_assured);
        if (isNaN(sumAssured) || sumAssured <= 0) {
          errors.push(`Row ${index + 1}: sum_assured must be a positive number`);
        }
      }

      // Check issue_age
      if (row.issue_age) {
        const issueAge = parseInt(row.issue_age);
        if (isNaN(issueAge) || issueAge < 18 || issueAge > 80) {
          errors.push(`Row ${index + 1}: issue_age must be between 18 and 80`);
        }
      }

      // Check policy_term
      if (row.policy_term) {
        const policyTerm = parseInt(row.policy_term);
        if (isNaN(policyTerm) || policyTerm < 1 || policyTerm > 50) {
          errors.push(`Row ${index + 1}: policy_term must be between 1 and 50 years`);
        }
      }

      // Check issue_date
      if (row.issue_date) {
        const issueDate = new Date(row.issue_date);
        if (isNaN(issueDate.getTime())) {
          errors.push(`Row ${index + 1}: issue_date must be a valid date`);
        }
      }

      // Check premium
      if (row.premium) {
        const premium = parseFloat(row.premium);
        if (isNaN(premium) || premium < 0) {
          errors.push(`Row ${index + 1}: premium must be a non-negative number`);
        }
      }

      // Check maturity_date if present
      if (row.maturity_date) {
        const maturityDate = new Date(row.maturity_date);
        if (isNaN(maturityDate.getTime())) {
          warnings.push(`Row ${index + 1}: maturity_date must be a valid date`);
        }
      }
    });

    // Check for duplicate policy IDs
    const policyIds = data.map(row => row.policy_id).filter(id => id);
    const uniquePolicyIds = new Set(policyIds);
    if (policyIds.length !== uniquePolicyIds.size) {
      warnings.push('Duplicate policy IDs found in the dataset');
    }

    // Check data consistency
    if (data.length > 10000) {
      warnings.push('Large dataset detected. Processing may take longer than usual.');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      stats: {
        totalRows: data.length,
        totalColumns: columns.length,
        uniquePolicyIds: uniquePolicyIds.size,
        duplicatePolicyIds: policyIds.length - uniquePolicyIds.size
      }
    };
  }

  /**
   * Validate actuarial reasonableness of data
   * @param {Array} data - CSV data
   * @returns {Array} Array of actuarial warnings
   */
  validateActuarialReasonableness(data) {
    const warnings = [];
    
    if (data.length === 0) return warnings;
    
    // Calculate statistics
    const sumAssuredValues = data.map(row => parseFloat(row.sum_assured)).filter(val => !isNaN(val));
    const premiumValues = data.map(row => parseFloat(row.premium)).filter(val => !isNaN(val));
    const ageValues = data.map(row => parseInt(row.issue_age)).filter(val => !isNaN(val));
    const termValues = data.map(row => parseInt(row.policy_term)).filter(val => !isNaN(val));
    
    if (sumAssuredValues.length === 0 || premiumValues.length === 0) {
      return warnings;
    }
    
    // Premium to sum assured ratio analysis
    const premiumToSumAssuredRatios = data.map(row => {
      const sumAssured = parseFloat(row.sum_assured);
      const premium = parseFloat(row.premium);
      return sumAssured > 0 ? premium / sumAssured : null;
    }).filter(ratio => ratio !== null);
    
    if (premiumToSumAssuredRatios.length > 0) {
      const avgRatio = premiumToSumAssuredRatios.reduce((sum, ratio) => sum + ratio, 0) / premiumToSumAssuredRatios.length;
      const minRatio = Math.min(...premiumToSumAssuredRatios);
      const maxRatio = Math.max(...premiumToSumAssuredRatios);
      
      // Check for unusual ratios
      if (avgRatio < 0.001) {
        warnings.push('Average premium to sum assured ratio is very low (< 0.1%). This may indicate data quality issues.');
      }
      if (avgRatio > 0.1) {
        warnings.push('Average premium to sum assured ratio is very high (> 10%). This may indicate unusual product types or data errors.');
      }
      if (maxRatio / minRatio > 100) {
        warnings.push('Large variation in premium to sum assured ratios detected. Please verify data consistency.');
      }
    }
    
    // Age distribution analysis
    if (ageValues.length > 0) {
      const avgAge = ageValues.reduce((sum, age) => sum + age, 0) / ageValues.length;
      const minAge = Math.min(...ageValues);
      const maxAge = Math.max(...ageValues);
      
      if (avgAge < 25) {
        warnings.push('Average issue age is very young (< 25). Verify this is appropriate for the product type.');
      }
      if (avgAge > 70) {
        warnings.push('Average issue age is very high (> 70). Verify this is appropriate for the product type.');
      }
      if (maxAge - minAge > 60) {
        warnings.push('Very wide age range detected. Consider segmenting analysis by age groups.');
      }
    }
    
    // Term analysis
    if (termValues.length > 0) {
      const avgTerm = termValues.reduce((sum, term) => sum + term, 0) / termValues.length;
      const maxTerm = Math.max(...termValues);
      
      if (avgTerm < 5) {
        warnings.push('Average policy term is very short (< 5 years). Verify this is appropriate.');
      }
      if (maxTerm > 50) {
        warnings.push('Some policies have very long terms (> 50 years). Verify this is correct.');
      }
    }
    
    // Sum assured analysis
    if (sumAssuredValues.length > 0) {
      const avgSumAssured = sumAssuredValues.reduce((sum, val) => sum + val, 0) / sumAssuredValues.length;
      const maxSumAssured = Math.max(...sumAssuredValues);
      const minSumAssured = Math.min(...sumAssuredValues);
      
      if (avgSumAssured < 10000) {
        warnings.push('Average sum assured is very low (< $10,000). Verify this is appropriate.');
      }
      if (maxSumAssured > 10000000) {
        warnings.push('Some policies have very high sum assured (> $10M). Verify this is correct.');
      }
      if (maxSumAssured / minSumAssured > 1000) {
        warnings.push('Very wide range of sum assured values. Consider segmenting analysis.');
      }
    }
    
    // Cohort analysis
    const issueYears = data.map(row => {
      const issueDate = new Date(row.issue_date);
      return issueDate.getFullYear();
    }).filter(year => !isNaN(year));
    
    if (issueYears.length > 0) {
      const uniqueYears = new Set(issueYears);
      if (uniqueYears.size > 1) {
        const yearRange = Math.max(...issueYears) - Math.min(...issueYears);
        if (yearRange > 20) {
          warnings.push('Data spans more than 20 years. Consider cohort analysis for mortality and lapse assumptions.');
        }
      }
    }
    
    return warnings;
  }

  /**
   * Transform CSV data for storage
   * @param {object} parsedData - Parsed CSV data
   * @returns {object} Transformed data
   */
  transformData(parsedData) {
    const { data, columns } = parsedData;
    
    // Transform data types and clean up
    const transformedData = data.map(row => {
      const transformedRow = {};
      
      columns.forEach(column => {
        let value = row[column];
        
        // Skip empty values
        if (value === null || value === undefined || value === '') {
          transformedRow[column] = null;
          return;
        }
        
        // Transform based on column type
        switch (column) {
          case 'policy_id':
            transformedRow[column] = String(value).trim();
            break;
            
          case 'issue_date':
          case 'maturity_date':
            transformedRow[column] = new Date(value).toISOString();
            break;
            
          case 'premium':
          case 'sum_assured':
            transformedRow[column] = parseFloat(value);
            break;
            
          case 'gender':
            transformedRow[column] = String(value).toUpperCase();
            break;
            
          case 'issue_age':
          case 'policy_term':
            transformedRow[column] = parseInt(value);
            break;
            
          default:
            // Keep as string for unknown columns
            transformedRow[column] = String(value).trim();
        }
      });
      
      return transformedRow;
    });
    
    return {
      data: transformedData,
      columns,
      rowCount: transformedData.length
    };
  }

  /**
   * Process CSV file from buffer
   * @param {Buffer} fileBuffer - CSV file buffer
   * @param {string} filename - Original filename
   * @returns {Promise<object>} Processed data
   */
  async processCSVFile(fileBuffer, filename) {
    try {
      logger.info(`Processing CSV file: ${filename}`);
      
      // Parse CSV
      const parsedData = await this.parseCSV(fileBuffer);
      logger.info(`Parsed CSV: ${parsedData.rowCount} rows, ${parsedData.columns.length} columns`);
      
      // Validate CSV
      const validation = this.validateCSV(parsedData);
      if (!validation.isValid) {
        throw new Error(`CSV validation failed: ${validation.errors.join(', ')}`);
      }
      
      if (validation.warnings.length > 0) {
        logger.warn(`CSV validation warnings: ${validation.warnings.join(', ')}`);
      }
      
      // Transform data
      const transformedData = this.transformData(parsedData);
      logger.info(`Transformed data: ${transformedData.rowCount} rows`);
      
      return {
        ...transformedData,
        validation,
        metadata: {
          originalFilename: filename,
          fileSize: fileBuffer.length,
          processedAt: new Date().toISOString(),
          parseErrors: parsedData.parseErrors
        }
      };
      
    } catch (error) {
      logger.error(`CSV processing failed for ${filename}:`, error);
      throw error;
    }
  }

  /**
   * Get CSV schema information
   * @param {object} data - CSV data
   * @returns {object} Schema information
   */
  getSchemaInfo(data) {
    const { columns, data: rows } = data;
    const schema = {};
    
    columns.forEach(column => {
      const values = rows.map(row => row[column]).filter(val => val !== null && val !== undefined);
      const numericValues = values.filter(val => !isNaN(parseFloat(val)) && isFinite(val));
      
      schema[column] = {
        type: numericValues.length > values.length * 0.5 ? 'numeric' : 'string',
        nullable: values.length < rows.length,
        unique: new Set(values).size === values.length,
        sample: values.slice(0, 3)
      };
    });
    
    return schema;
  }

  /**
   * Generate data quality report
   * @param {object} data - CSV data
   * @returns {object} Quality report
   */
  generateQualityReport(data) {
    const { columns, data: rows } = data;
    const report = {
      overall: {
        totalRows: rows.length,
        totalColumns: columns.length,
        completeness: 0,
        qualityScore: 0
      },
      columns: {}
    };
    
    let totalCompleteness = 0;
    
    columns.forEach(column => {
      const values = rows.map(row => row[column]);
      const nonNullValues = values.filter(val => val !== null && val !== undefined && val !== '');
      const completeness = (nonNullValues.length / values.length) * 100;
      
      totalCompleteness += completeness;
      
      report.columns[column] = {
        completeness,
        nullCount: values.length - nonNullValues.length,
        uniqueValues: new Set(nonNullValues).size,
        dataType: typeof nonNullValues[0] || 'unknown'
      };
    });
    
    report.overall.completeness = totalCompleteness / columns.length;
    report.overall.qualityScore = Math.round(report.overall.completeness);
    
    return report;
  }
}

module.exports = new CSVProcessor();
