/**
 * Calculation data model for Firestore
 */

class CalculationModel {
  constructor(data) {
    this.id = data.id;
    this.userId = data.userId;
    this.datasetId = data.datasetId;
    this.calculationType = data.calculationType;
    this.status = data.status || 'pending';
    this.inputParams = data.inputParams || {};
    this.results = data.results || {};
    this.createdAt = data.createdAt;
    this.startedAt = data.startedAt;
    this.completedAt = data.completedAt;
    this.executionTime = data.executionTime;
    this.error = data.error;
    this.metadata = data.metadata || {};
    
    // Enhanced audit trail properties
    this.auditTrail = data.auditTrail || {
      calculationInputs: {},
      calculationSteps: [],
      intermediateResults: [],
      methodologyVersion: '',
      formulasUsed: [],
      assumptionsUsed: [],
      validationResults: [],
      warnings: [],
      executionLog: []
    };
    this.resultValidation = data.resultValidation || {
      rangeChecks: [],
      consistencyChecks: [],
      reasonablenessTests: [],
      passedAll: false
    };
  }

  /**
   * Create a new calculation document structure
   * @param {object} calculationData - Calculation data
   * @returns {object} Calculation document
   */
  static createCalculationDocument(calculationData) {
    return {
      userId: calculationData.userId,
      datasetId: calculationData.datasetId,
      calculationType: calculationData.calculationType,
      status: 'pending',
      inputParams: calculationData.inputParams,
      results: {},
      createdAt: new Date(),
      startedAt: null,
      completedAt: null,
      executionTime: null,
      error: null,
      metadata: {
        version: calculationData.metadata?.version || '1.0',
        engine: calculationData.metadata?.engine || 'python-fastapi',
        requestId: calculationData.metadata?.requestId,
        userAgent: calculationData.metadata?.userAgent,
        ipAddress: calculationData.metadata?.ipAddress
      },
      auditTrail: {
        calculationInputs: {},
        calculationSteps: [],
        intermediateResults: [],
        methodologyVersion: calculationData.metadata?.methodologyVersion || '1.0.0',
        formulasUsed: [],
        assumptionsUsed: [],
        validationResults: [],
        warnings: [],
        executionLog: []
      },
      resultValidation: {
        rangeChecks: [],
        consistencyChecks: [],
        reasonablenessTests: [],
        passedAll: false
      }
    };
  }

  /**
   * Update calculation status
   * @param {string} status - New status
   * @param {object} additionalData - Additional data to update
   */
  updateStatus(status, additionalData = {}) {
    this.status = status;
    
    switch (status) {
      case 'running':
        this.startedAt = new Date();
        break;
      case 'completed':
        this.completedAt = new Date();
        this.executionTime = this.startedAt ? 
          (this.completedAt - this.startedAt) / 1000 : null;
        break;
      case 'failed':
        this.completedAt = new Date();
        this.executionTime = this.startedAt ? 
          (this.completedAt - this.startedAt) / 1000 : null;
        break;
    }

    // Update additional data
    Object.assign(this, additionalData);
  }

  /**
   * Add a calculation step to the audit trail
   * @param {object} step - Calculation step object
   */
  addCalculationStep(step) {
    this.auditTrail.calculationSteps.push({
      stepNumber: this.auditTrail.calculationSteps.length + 1,
      description: step.description,
      formula: step.formula,
      inputs: step.inputs,
      output: step.output,
      timestamp: new Date(),
      ...step
    });
  }

  /**
   * Add an intermediate result to the audit trail
   * @param {object} result - Intermediate result object
   */
  addIntermediateResult(result) {
    this.auditTrail.intermediateResults.push({
      name: result.name,
      value: result.value,
      unit: result.unit,
      description: result.description,
      timestamp: new Date(),
      ...result
    });
  }

  /**
   * Add a formula used in the calculation
   * @param {object} formula - Formula object
   */
  addFormulaUsed(formula) {
    this.auditTrail.formulasUsed.push({
      formulaId: formula.formulaId,
      version: formula.version,
      name: formula.name,
      latex: formula.latex,
      usedAt: new Date(),
      ...formula
    });
  }

  /**
   * Add an assumption snapshot
   * @param {object} assumption - Assumption object
   */
  addAssumptionUsed(assumption) {
    this.auditTrail.assumptionsUsed.push({
      name: assumption.name,
      value: assumption.value,
      source: assumption.source,
      justification: assumption.justification,
      usedAt: new Date(),
      ...assumption
    });
  }

  /**
   * Add a validation result
   * @param {object} validation - Validation result object
   */
  addValidationResult(validation) {
    this.auditTrail.validationResults.push({
      checkName: validation.checkName,
      type: validation.type, // "range", "consistency", "reasonableness"
      passed: validation.passed,
      message: validation.message,
      severity: validation.severity, // "error", "warning", "info"
      timestamp: new Date(),
      ...validation
    });
  }

  /**
   * Add a warning to the audit trail
   * @param {string} warning - Warning message
   * @param {string} category - Warning category
   */
  addWarning(warning, category = 'general') {
    this.auditTrail.warnings.push({
      message: warning,
      category: category,
      timestamp: new Date()
    });
  }

  /**
   * Add an execution log entry
   * @param {object} logEntry - Log entry object
   */
  addExecutionLog(logEntry) {
    this.auditTrail.executionLog.push({
      level: logEntry.level, // "info", "debug", "warning", "error"
      message: logEntry.message,
      data: logEntry.data,
      timestamp: new Date(),
      ...logEntry
    });
  }

  /**
   * Set calculation inputs snapshot
   * @param {object} inputs - Complete input snapshot
   */
  setCalculationInputs(inputs) {
    this.auditTrail.calculationInputs = {
      ...inputs,
      timestamp: new Date()
    };
  }

  /**
   * Set methodology version
   * @param {string} version - Methodology version
   */
  setMethodologyVersion(version) {
    this.auditTrail.methodologyVersion = version;
  }

  /**
   * Add a range check result
   * @param {object} check - Range check object
   */
  addRangeCheck(check) {
    this.resultValidation.rangeChecks.push({
      variable: check.variable,
      value: check.value,
      minValue: check.minValue,
      maxValue: check.maxValue,
      passed: check.passed,
      message: check.message,
      timestamp: new Date(),
      ...check
    });
  }

  /**
   * Add a consistency check result
   * @param {object} check - Consistency check object
   */
  addConsistencyCheck(check) {
    this.resultValidation.consistencyChecks.push({
      checkName: check.checkName,
      description: check.description,
      passed: check.passed,
      message: check.message,
      timestamp: new Date(),
      ...check
    });
  }

  /**
   * Add a reasonableness test result
   * @param {object} test - Reasonableness test object
   */
  addReasonablenessTest(test) {
    this.resultValidation.reasonablenessTests.push({
      testName: test.testName,
      description: test.description,
      passed: test.passed,
      message: test.message,
      benchmark: test.benchmark,
      actualValue: test.actualValue,
      timestamp: new Date(),
      ...test
    });
  }

  /**
   * Update overall validation status
   */
  updateValidationStatus() {
    const allRangeChecksPassed = this.resultValidation.rangeChecks.every(check => check.passed);
    const allConsistencyChecksPassed = this.resultValidation.consistencyChecks.every(check => check.passed);
    const allReasonablenessTestsPassed = this.resultValidation.reasonablenessTests.every(test => test.passed);
    
    this.resultValidation.passedAll = allRangeChecksPassed && allConsistencyChecksPassed && allReasonablenessTestsPassed;
  }

  /**
   * Get audit trail summary
   * @returns {object} Audit trail summary
   */
  getAuditTrailSummary() {
    return {
      totalSteps: this.auditTrail.calculationSteps.length,
      totalIntermediateResults: this.auditTrail.intermediateResults.length,
      totalFormulasUsed: this.auditTrail.formulasUsed.length,
      totalAssumptionsUsed: this.auditTrail.assumptionsUsed.length,
      totalValidationResults: this.auditTrail.validationResults.length,
      totalWarnings: this.auditTrail.warnings.length,
      methodologyVersion: this.auditTrail.methodologyVersion,
      hasValidationIssues: !this.resultValidation.passedAll,
      validationSummary: {
        rangeChecks: this.resultValidation.rangeChecks.length,
        consistencyChecks: this.resultValidation.consistencyChecks.length,
        reasonablenessTests: this.resultValidation.reasonablenessTests.length,
        passedAll: this.resultValidation.passedAll
      }
    };
  }

  /**
   * Set calculation error
   * @param {string} error - Error message
   */
  setError(error) {
    this.error = error;
    this.updateStatus('failed');
  }

  /**
   * Get calculation summary
   * @returns {object} Calculation summary
   */
  getSummary() {
    return {
      id: this.id,
      calculationType: this.calculationType,
      status: this.status,
      createdAt: this.createdAt,
      completedAt: this.completedAt,
      executionTime: this.executionTime,
      hasError: !!this.error
    };
  }

  /**
   * Get calculation progress
   * @returns {number} Progress percentage (0-100)
   */
  getProgress() {
    switch (this.status) {
      case 'pending':
        return 0;
      case 'running':
        return 50;
      case 'completed':
        return 100;
      case 'failed':
        return 100;
      default:
        return 0;
    }
  }

  /**
   * Check if calculation is finished
   * @returns {boolean} Is calculation finished
   */
  isFinished() {
    return ['completed', 'failed'].includes(this.status);
  }

  /**
   * Get calculation duration
   * @returns {number} Duration in seconds
   */
  getDuration() {
    if (this.executionTime) {
      return this.executionTime;
    }
    
    if (this.startedAt && !this.isFinished()) {
      return (new Date() - this.startedAt) / 1000;
    }
    
    return 0;
  }

  /**
   * Validate calculation input parameters
   * @param {string} calculationType - Type of calculation
   * @param {object} inputParams - Input parameters
   * @returns {object} Validation result
   */
  static validateInputParams(calculationType, inputParams) {
    const errors = [];

    switch (calculationType) {
      case 'IFRS17_CSM':
        if (!inputParams.assumptions) {
          errors.push('Assumptions are required for IFRS 17 calculations');
        } else {
          const { assumptions } = inputParams;
          
          if (typeof assumptions.discount_rate !== 'number' || assumptions.discount_rate < 0 || assumptions.discount_rate > 1) {
            errors.push('Discount rate must be a number between 0 and 1');
          }
          
          if (typeof assumptions.lapse_rate !== 'number' || assumptions.lapse_rate < 0 || assumptions.lapse_rate > 1) {
            errors.push('Lapse rate must be a number between 0 and 1');
          }
          
          if (!assumptions.mortality_table || typeof assumptions.mortality_table !== 'string') {
            errors.push('Mortality table is required');
          }
          
          if (typeof assumptions.expense_inflation !== 'number' || assumptions.expense_inflation < 0) {
            errors.push('Expense inflation must be a non-negative number');
          }
        }
        break;

      case 'SOLVENCY_SCR':
        if (!inputParams.assumptions) {
          errors.push('Assumptions are required for Solvency II calculations');
        } else {
          const { assumptions } = inputParams;
          
          if (!assumptions.confidence_level || typeof assumptions.confidence_level !== 'number') {
            errors.push('Confidence level is required');
          }
          
          if (!assumptions.time_horizon || typeof assumptions.time_horizon !== 'number') {
            errors.push('Time horizon is required');
          }
        }
        break;

      default:
        errors.push(`Unknown calculation type: ${calculationType}`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Convert to JSON
   * @returns {object} Calculation data
   */
  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      datasetId: this.datasetId,
      calculationType: this.calculationType,
      status: this.status,
      inputParams: this.inputParams,
      results: this.results,
      createdAt: this.createdAt,
      startedAt: this.startedAt,
      completedAt: this.completedAt,
      executionTime: this.executionTime,
      error: this.error,
      metadata: this.metadata,
      auditTrail: this.auditTrail,
      resultValidation: this.resultValidation
    };
  }

  /**
   * Convert to public JSON (for sharing)
   * @returns {object} Public calculation data
   */
  toPublicJSON() {
    return {
      id: this.id,
      calculationType: this.calculationType,
      status: this.status,
      createdAt: this.createdAt,
      completedAt: this.completedAt,
      executionTime: this.executionTime,
      hasError: !!this.error,
      results: this.results,
      metadata: {
        version: this.metadata.version,
        engine: this.metadata.engine
      }
    };
  }
}

module.exports = CalculationModel;
