const logger = require('../utils/logger');
const { EXAMPLE_TERM_LIFE_JSON } = require('../schemas/termLifeSchema');

/**
 * JSON Converter Service
 * Converts parsed files into unified JSON structure
 */
class JsonConverter {

  /**
   * Convert parsed files to unified JSON structure
   * @param {object} parsedFiles - Parsed files organized by type
   * @returns {object} Unified JSON structure
   */
  convertToUnifiedJson(parsedFiles) {
    try {
      const unifiedJson = {
        meta: this.convertMeta(parsedFiles.meta),
        assumptions: this.convertAssumptions(parsedFiles.assumptions),
        policies: this.convertPolicies(parsedFiles.policies),
        actuals: this.convertActuals(parsedFiles.actuals)
      };

      // Generate run_id if not present
      if (!unifiedJson.meta.run_id) {
        unifiedJson.meta.run_id = this.generateRunId();
      }

      // Add upload timestamp
      unifiedJson.meta.upload_time = new Date().toISOString();

      logger.info('Successfully converted files to unified JSON structure');
      return unifiedJson;

    } catch (error) {
      logger.error('Error converting to unified JSON:', error);
      throw new Error(`JSON conversion failed: ${error.message}`);
    }
  }

  /**
   * Convert meta data
   * @param {object} metaFile - Parsed meta file
   * @returns {object} Meta object
   */
  convertMeta(metaFile) {
    if (!metaFile || !metaFile.data || metaFile.data.length === 0) {
      return this.getDefaultMeta();
    }

    const metaRow = metaFile.data[0]; // Meta should have only one row
    
    return {
      run_id: metaRow.run_id || this.generateRunId(),
      upload_time: metaRow.upload_time || new Date().toISOString(),
      user_id: metaRow.user_id || 'anonymous',
      version: metaRow.version || '1.0',
      scenario: metaRow.scenario || 'base',
      product_type: metaRow.product_type || 'TermLife',
      description: metaRow.description || '',
      valuation_date: metaRow.valuation_date || new Date().toISOString()
    };
  }

  /**
   * Convert assumptions data
   * @param {object} assumptionsFile - Parsed assumptions file
   * @returns {object} Assumptions object
   */
  convertAssumptions(assumptionsFile) {
    if (!assumptionsFile || !assumptionsFile.data || assumptionsFile.data.length === 0) {
      return this.getDefaultAssumptions();
    }

    const assumptions = {
      discount_rates: {},
      mortality_tables: {},
      expense_assumptions: {},
      lapse_rates: {}
    };

    // Convert flat structure to nested structure
    assumptionsFile.data.forEach(row => {
      const { category, subcategory, parameter, value } = row;
      
      if (category && subcategory && parameter !== undefined) {
        if (!assumptions[category]) {
          assumptions[category] = {};
        }
        
        // Convert value to appropriate type
        let convertedValue = value;
        if (typeof value === 'string' && !isNaN(value) && value !== '') {
          convertedValue = parseFloat(value);
        }
        
        assumptions[category][parameter] = convertedValue;
      }
    });

    // Fill in defaults for missing values
    this.fillAssumptionDefaults(assumptions);

    return assumptions;
  }

  /**
   * Convert policies data
   * @param {object} policiesFile - Parsed policies file
   * @returns {Array} Policies array
   */
  convertPolicies(policiesFile) {
    if (!policiesFile || !policiesFile.data || policiesFile.data.length === 0) {
      return [];
    }

    return policiesFile.data.map(policy => ({
      policy_id: String(policy.policy_id).trim(),
      issue_date: this.convertDate(policy.issue_date),
      issue_age: parseInt(policy.issue_age) || 0,
      gender: String(policy.gender).toUpperCase(),
      sum_assured: parseFloat(policy.sum_assured) || 0,
      premium: parseFloat(policy.premium) || 0,
      policy_term: parseInt(policy.policy_term) || 0,
      underwriting_class: policy.underwriting_class || 'Standard',
      payment_frequency: policy.payment_frequency || 'Annual',
      smoking_status: policy.smoking_status || 'NonSmoker',
      occupation_class: policy.occupation_class || 'Office'
    }));
  }

  /**
   * Convert actuals data
   * @param {object} actualsFile - Parsed actuals file
   * @returns {Array} Actuals array
   */
  convertActuals(actualsFile) {
    if (!actualsFile || !actualsFile.data || actualsFile.data.length === 0) {
      return [];
    }

    return actualsFile.data.map(actual => ({
      policy_id: String(actual.policy_id).trim(),
      period: parseInt(actual.period) || 0,
      date: this.convertDate(actual.date),
      premium_received: parseFloat(actual.premium_received) || 0,
      claims_paid: parseFloat(actual.claims_paid) || 0,
      expenses_incurred: parseFloat(actual.expenses_incurred) || 0,
      lapses: parseFloat(actual.lapses) || 0,
      surrenders: parseFloat(actual.surrenders) || 0,
      policy_count: parseFloat(actual.policy_count) || 1
    }));
  }

  /**
   * Convert date string to ISO format
   * @param {string} dateString - Date string
   * @returns {string} ISO date string
   */
  convertDate(dateString) {
    if (!dateString) return new Date().toISOString();
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        throw new Error('Invalid date');
      }
      return date.toISOString();
    } catch (error) {
      logger.warn(`Invalid date format: ${dateString}`);
      return new Date().toISOString();
    }
  }

  /**
   * Generate unique run ID
   * @returns {string} Run ID
   */
  generateRunId() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const random = Math.random().toString(36).substr(2, 5);
    return `run_${timestamp}_${random}`;
  }

  /**
   * Get default meta object
   * @returns {object} Default meta
   */
  getDefaultMeta() {
    return {
      run_id: this.generateRunId(),
      upload_time: new Date().toISOString(),
      user_id: 'anonymous',
      version: '1.0',
      scenario: 'base',
      product_type: 'TermLife',
      description: 'Term Life Valuation Run',
      valuation_date: new Date().toISOString()
    };
  }

  /**
   * Get default assumptions object
   * @returns {object} Default assumptions
   */
  getDefaultAssumptions() {
    return {
      discount_rates: {
        risk_free_rate: 0.03,
        credit_spread: 0.01,
        liquidity_premium: 0.005
      },
      mortality_tables: {
        table_name: '2008VBT',
        adjustment_factor: 1.0,
        improvement_factor: 0.01
      },
      expense_assumptions: {
        initial_expense_ratio: 0.15,
        renewal_expense_ratio: 0.05,
        claim_expense_ratio: 0.05
      },
      lapse_rates: {
        first_year_lapse: 0.10,
        renewal_lapse: 0.05,
        lapse_improvement: 0.01
      }
    };
  }

  /**
   * Fill in default values for missing assumptions
   * @param {object} assumptions - Assumptions object
   */
  fillAssumptionDefaults(assumptions) {
    const defaults = this.getDefaultAssumptions();
    
    // Fill missing discount rates
    if (!assumptions.discount_rates) assumptions.discount_rates = {};
    Object.assign(assumptions.discount_rates, defaults.discount_rates, assumptions.discount_rates);
    
    // Fill missing mortality tables
    if (!assumptions.mortality_tables) assumptions.mortality_tables = {};
    Object.assign(assumptions.mortality_tables, defaults.mortality_tables, assumptions.mortality_tables);
    
    // Fill missing expense assumptions
    if (!assumptions.expense_assumptions) assumptions.expense_assumptions = {};
    Object.assign(assumptions.expense_assumptions, defaults.expense_assumptions, assumptions.expense_assumptions);
    
    // Fill missing lapse rates
    if (!assumptions.lapse_rates) assumptions.lapse_rates = {};
    Object.assign(assumptions.lapse_rates, defaults.lapse_rates, assumptions.lapse_rates);
  }

  /**
   * Validate converted JSON structure
   * @param {object} jsonData - Converted JSON data
   * @returns {object} Validation result
   */
  validateConvertedJson(jsonData) {
    const errors = [];
    const warnings = [];

    // Check required sections
    const requiredSections = ['meta', 'assumptions', 'policies', 'actuals'];
    requiredSections.forEach(section => {
      if (!jsonData[section]) {
        errors.push(`Missing required section: ${section}`);
      }
    });

    // Check meta fields
    if (jsonData.meta) {
      const requiredMetaFields = ['run_id', 'upload_time', 'user_id', 'product_type'];
      requiredMetaFields.forEach(field => {
        if (!jsonData.meta[field]) {
          errors.push(`Missing required meta field: ${field}`);
        }
      });
    }

    // Check policies count
    if (jsonData.policies && jsonData.policies.length === 0) {
      warnings.push('No policies found in data');
    }

    // Check actuals count
    if (jsonData.actuals && jsonData.actuals.length === 0) {
      warnings.push('No actuals found in data');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Get example JSON structure
   * @returns {object} Example JSON
   */
  getExampleJson() {
    return EXAMPLE_TERM_LIFE_JSON;
  }
}

module.exports = new JsonConverter();
