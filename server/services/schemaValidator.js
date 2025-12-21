const logger = require('../utils/logger');
const { TERM_LIFE_SCHEMA, SEVERITY, VALIDATION_RESULT } = require('../schemas/termLifeSchema');

/**
 * Schema Validator Service for Term Life Data
 * Validates data against defined schemas and business rules
 */
class SchemaValidator {

  /**
   * Validate Term Life data against schema
   * @param {object} jsonData - Parsed JSON data
   * @param {string} fileType - Type of data ('meta', 'assumptions', 'policies', 'actuals')
   * @returns {object} Validation result
   */
  validateTermLifeData(jsonData, fileType) {
    const result = { ...VALIDATION_RESULT };
    result.stats.totalRows = Array.isArray(jsonData) ? jsonData.length : 1;

    try {
      switch (fileType) {
        case 'meta':
          return this.validateMeta(jsonData, result);
        case 'assumptions':
          return this.validateAssumptions(jsonData, result);
        case 'policies':
          return this.validatePolicies(jsonData, result);
        case 'actuals':
          return this.validateActuals(jsonData, result);
        default:
          result.errors.push({
            field: 'fileType',
            row: 0,
            message: `Unknown file type: ${fileType}`,
            severity: SEVERITY.ERROR
          });
          return result;
      }
    } catch (error) {
      logger.error(`Validation error for ${fileType}:`, error);
      result.errors.push({
        field: 'system',
        row: 0,
        message: `Validation system error: ${error.message}`,
        severity: SEVERITY.ERROR
      });
      return result;
    }
  }

  /**
   * Validate metadata
   * @param {object} metaData - Metadata object
   * @param {object} result - Validation result object
   * @returns {object} Updated validation result
   */
  validateMeta(metaData, result) {
    const schema = TERM_LIFE_SCHEMA.meta;
    
    // Validate each field
    for (const [field, rules] of Object.entries(schema)) {
      const value = metaData[field];
      
      // Check required fields
      if (rules.required && (value === undefined || value === null || value === '')) {
        result.errors.push({
          field,
          row: 0,
          message: `${field} is required`,
          severity: SEVERITY.ERROR
        });
        continue;
      }

      // Skip validation if value is empty and not required
      if (!value && !rules.required) continue;

      // Validate data type
      if (!this.validateDataType(value, rules.type)) {
        result.errors.push({
          field,
          row: 0,
          message: `${field} must be of type ${rules.type}`,
          severity: SEVERITY.ERROR
        });
        continue;
      }

      // Validate enum values
      if (rules.enum && !rules.enum.includes(value)) {
        result.errors.push({
          field,
          row: 0,
          message: `${field} must be one of: ${rules.enum.join(', ')}`,
          severity: SEVERITY.ERROR
        });
        continue;
      }

      // Validate numeric ranges
      if (rules.type === 'number') {
        if (rules.min !== undefined && value < rules.min) {
          result.errors.push({
            field,
            row: 0,
            message: `${field} must be at least ${rules.min}`,
            severity: SEVERITY.ERROR
          });
        }
        if (rules.max !== undefined && value > rules.max) {
          result.errors.push({
            field,
            row: 0,
            message: `${field} must be at most ${rules.max}`,
            severity: SEVERITY.ERROR
          });
        }
      }

      // Validate string patterns
      if (rules.type === 'string' && rules.pattern && !rules.pattern.test(value)) {
        result.errors.push({
          field,
          row: 0,
          message: `${field} format is invalid`,
          severity: SEVERITY.ERROR
        });
      }

      // Validate date formats
      if (rules.format === 'iso-date' && !this.isValidISODate(value)) {
        result.errors.push({
          field,
          row: 0,
          message: `${field} must be a valid ISO date`,
          severity: SEVERITY.ERROR
        });
      }
    }

    result.isValid = result.errors.length === 0;
    result.stats.validRows = result.isValid ? 1 : 0;
    result.stats.errorRows = result.errors.length;

    return result;
  }

  /**
   * Validate assumptions data
   * @param {Array} assumptionsData - Assumptions array
   * @param {object} result - Validation result object
   * @returns {object} Updated validation result
   */
  validateAssumptions(assumptionsData, result) {
    const schema = TERM_LIFE_SCHEMA.assumptions;
    let validRows = 0;

    assumptionsData.forEach((row, index) => {
      const rowErrors = [];
      
      // Validate required fields
      if (!row.category || !row.subcategory || !row.parameter) {
        rowErrors.push({
          field: 'required_fields',
          row: index + 1,
          message: 'category, subcategory, and parameter are required',
          severity: SEVERITY.ERROR
        });
      }

      // Validate value is numeric
      if (row.value !== undefined && row.value !== '') {
        const numValue = parseFloat(row.value);
        if (isNaN(numValue)) {
          rowErrors.push({
            field: 'value',
            row: index + 1,
            message: 'value must be a valid number',
            severity: SEVERITY.ERROR
          });
        }
      }

      if (rowErrors.length === 0) {
        validRows++;
      } else {
        result.errors.push(...rowErrors);
      }
    });

    result.isValid = result.errors.length === 0;
    result.stats.validRows = validRows;
    result.stats.errorRows = result.stats.totalRows - validRows;

    return result;
  }

  /**
   * Validate policies data
   * @param {Array} policiesData - Policies array
   * @param {object} result - Validation result object
   * @returns {object} Updated validation result
   */
  validatePolicies(policiesData, result) {
    const schema = TERM_LIFE_SCHEMA.policies.schema;
    const validationRules = TERM_LIFE_SCHEMA.policies.validation_rules;
    let validRows = 0;

    policiesData.forEach((policy, index) => {
      const rowErrors = [];
      
      // Validate each field against schema
      for (const [field, rules] of Object.entries(schema)) {
        const value = policy[field];
        
        // Check required fields
        if (rules.required && (value === undefined || value === null || value === '')) {
          rowErrors.push({
            field,
            row: index + 1,
            message: `${field} is required`,
            severity: SEVERITY.ERROR
          });
          continue;
        }

        // Skip validation if value is empty and not required
        if (!value && !rules.required) continue;

        // Validate data type
        if (!this.validateDataType(value, rules.type)) {
          rowErrors.push({
            field,
            row: index + 1,
            message: `${field} must be of type ${rules.type}`,
            severity: SEVERITY.ERROR
          });
          continue;
        }

        // Validate enum values
        if (rules.enum && !rules.enum.includes(value)) {
          rowErrors.push({
            field,
            row: index + 1,
            message: `${field} must be one of: ${rules.enum.join(', ')}`,
            severity: SEVERITY.ERROR
          });
          continue;
        }

        // Validate numeric ranges
        if (rules.type === 'number') {
          if (rules.min !== undefined && value < rules.min) {
            rowErrors.push({
              field,
              row: index + 1,
              message: `${field} must be at least ${rules.min}`,
              severity: SEVERITY.ERROR
            });
          }
          if (rules.max !== undefined && value > rules.max) {
            rowErrors.push({
              field,
              row: index + 1,
              message: `${field} must be at most ${rules.max}`,
              severity: SEVERITY.ERROR
            });
          }
        }

        // Validate string patterns
        if (rules.type === 'string' && rules.pattern && !rules.pattern.test(value)) {
          rowErrors.push({
            field,
            row: index + 1,
            message: `${field} format is invalid`,
            severity: SEVERITY.ERROR
          });
        }

        // Validate date formats
        if (rules.format === 'iso-date' && !this.isValidISODate(value)) {
          rowErrors.push({
            field,
            row: index + 1,
            message: `${field} must be a valid ISO date`,
            severity: SEVERITY.ERROR
          });
        }
      }

      // Apply business validation rules
      validationRules.forEach(rule => {
        try {
          if (!rule.rule(policy)) {
            rowErrors.push({
              field: rule.name,
              row: index + 1,
              message: rule.message,
              severity: rule.severity
            });
          }
        } catch (error) {
          rowErrors.push({
            field: rule.name,
            row: index + 1,
            message: `Validation rule error: ${error.message}`,
            severity: SEVERITY.ERROR
          });
        }
      });

      if (rowErrors.length === 0) {
        validRows++;
      } else {
        result.errors.push(...rowErrors);
      }
    });

    result.isValid = result.errors.length === 0;
    result.stats.validRows = validRows;
    result.stats.errorRows = result.stats.totalRows - validRows;

    return result;
  }

  /**
   * Validate actuals data
   * @param {Array} actualsData - Actuals array
   * @param {object} result - Validation result object
   * @returns {object} Updated validation result
   */
  validateActuals(actualsData, result) {
    const schema = TERM_LIFE_SCHEMA.actuals.schema;
    const validationRules = TERM_LIFE_SCHEMA.actuals.validation_rules;
    let validRows = 0;

    actualsData.forEach((actual, index) => {
      const rowErrors = [];
      
      // Validate each field against schema
      for (const [field, rules] of Object.entries(schema)) {
        const value = actual[field];
        
        // Check required fields
        if (rules.required && (value === undefined || value === null || value === '')) {
          rowErrors.push({
            field,
            row: index + 1,
            message: `${field} is required`,
            severity: SEVERITY.ERROR
          });
          continue;
        }

        // Skip validation if value is empty and not required
        if (!value && !rules.required) continue;

        // Validate data type
        if (!this.validateDataType(value, rules.type)) {
          rowErrors.push({
            field,
            row: index + 1,
            message: `${field} must be of type ${rules.type}`,
            severity: SEVERITY.ERROR
          });
          continue;
        }

        // Validate numeric ranges
        if (rules.type === 'number') {
          if (rules.min !== undefined && value < rules.min) {
            rowErrors.push({
              field,
              row: index + 1,
              message: `${field} must be at least ${rules.min}`,
              severity: SEVERITY.ERROR
            });
          }
          if (rules.max !== undefined && value > rules.max) {
            rowErrors.push({
              field,
              row: index + 1,
              message: `${field} must be at most ${rules.max}`,
              severity: SEVERITY.ERROR
            });
          }
        }

        // Validate date formats
        if (rules.format === 'iso-date' && !this.isValidISODate(value)) {
          rowErrors.push({
            field,
            row: index + 1,
            message: `${field} must be a valid ISO date`,
            severity: SEVERITY.ERROR
          });
        }
      }

      // Apply business validation rules
      validationRules.forEach(rule => {
        try {
          if (!rule.rule(actual)) {
            rowErrors.push({
              field: rule.name,
              row: index + 1,
              message: rule.message,
              severity: rule.severity
            });
          }
        } catch (error) {
          rowErrors.push({
            field: rule.name,
            row: index + 1,
            message: `Validation rule error: ${error.message}`,
            severity: SEVERITY.ERROR
          });
        }
      });

      if (rowErrors.length === 0) {
        validRows++;
      } else {
        result.errors.push(...rowErrors);
      }
    });

    result.isValid = result.errors.length === 0;
    result.stats.validRows = validRows;
    result.stats.errorRows = result.stats.totalRows - validRows;

    return result;
  }

  /**
   * Validate data type
   * @param {any} value - Value to validate
   * @param {string} expectedType - Expected type
   * @returns {boolean} Is valid
   */
  validateDataType(value, expectedType) {
    switch (expectedType) {
      case 'string':
        return typeof value === 'string';
      case 'number':
        return typeof value === 'number' && !isNaN(value) && isFinite(value);
      case 'boolean':
        return typeof value === 'boolean';
      case 'array':
        return Array.isArray(value);
      case 'object':
        return typeof value === 'object' && value !== null && !Array.isArray(value);
      default:
        return true;
    }
  }

  /**
   * Check if string is valid ISO date
   * @param {string} dateString - Date string
   * @returns {boolean} Is valid ISO date
   */
  isValidISODate(dateString) {
    if (typeof dateString !== 'string') return false;
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date) && dateString === date.toISOString();
  }

  /**
   * Validate complete dataset
   * @param {object} parsedFiles - Parsed files organized by type
   * @returns {object} Complete validation result
   */
  validateCompleteDataset(parsedFiles) {
    const results = {
      overall: { isValid: true, errors: [], warnings: [] },
      meta: null,
      assumptions: null,
      policies: null,
      actuals: null
    };

    // Validate each file type
    for (const [fileType, parsedFile] of Object.entries(parsedFiles)) {
      if (parsedFile && fileType !== 'errors') {
        const validation = this.validateTermLifeData(parsedFile.data, fileType);
        results[fileType] = validation;
        
        if (!validation.isValid) {
          results.overall.isValid = false;
        }
        
        results.overall.errors.push(...validation.errors);
        results.overall.warnings.push(...validation.warnings);
      }
    }

    // Add cross-file validation
    this.validateCrossFileConsistency(parsedFiles, results);

    return results;
  }

  /**
   * Validate consistency across files
   * @param {object} parsedFiles - Parsed files
   * @param {object} results - Validation results
   */
  validateCrossFileConsistency(parsedFiles, results) {
    // Check policy IDs consistency between policies and actuals
    if (parsedFiles.policies && parsedFiles.actuals) {
      const policyIds = new Set(parsedFiles.policies.data.map(p => p.policy_id));
      const actualPolicyIds = new Set(parsedFiles.actuals.data.map(a => a.policy_id));
      
      // Find actuals with policy IDs not in policies
      const orphanActuals = [...actualPolicyIds].filter(id => !policyIds.has(id));
      if (orphanActuals.length > 0) {
        results.overall.warnings.push({
          field: 'policy_id_consistency',
          row: 0,
          message: `Actuals contain policy IDs not found in policies: ${orphanActuals.join(', ')}`,
          severity: SEVERITY.WARNING
        });
      }
    }
  }
}

module.exports = new SchemaValidator();
