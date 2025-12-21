/**
 * Methodology data model for Firestore
 * Represents calculation methodologies with versioning support
 */

class MethodologyModel {
  constructor(data) {
    this.id = data.id;
    this.name = data.name; // e.g., "IFRS17_CSM"
    this.version = data.version; // e.g., "1.0.0"
    this.description = data.description;
    this.formulas = data.formulas || [];
    this.variables = data.variables || [];
    this.assumptions = data.assumptions || [];
    this.validationRules = data.validationRules || [];
    this.regulatoryReferences = data.regulatoryReferences || [];
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
    this.isActive = data.isActive !== false;
    this.createdBy = data.createdBy;
    this.category = data.category; // e.g., "IFRS17", "SolvencyII", "Pricing"
    this.complexity = data.complexity; // "basic", "intermediate", "advanced"
  }

  /**
   * Create a new methodology document structure
   * @param {object} methodologyData - Methodology data
   * @returns {object} Methodology document
   */
  static createMethodologyDocument(methodologyData) {
    return {
      name: methodologyData.name,
      version: methodologyData.version || '1.0.0',
      description: methodologyData.description,
      formulas: methodologyData.formulas || [],
      variables: methodologyData.variables || [],
      assumptions: methodologyData.assumptions || [],
      validationRules: methodologyData.validationRules || [],
      regulatoryReferences: methodologyData.regulatoryReferences || [],
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
      createdBy: methodologyData.createdBy,
      category: methodologyData.category,
      complexity: methodologyData.complexity || 'intermediate'
    };
  }

  /**
   * Add a formula to the methodology
   * @param {object} formula - Formula object
   */
  addFormula(formula) {
    this.formulas.push({
      id: formula.id || `formula_${Date.now()}`,
      name: formula.name,
      latex: formula.latex,
      description: formula.description,
      variables: formula.variables || [],
      conditions: formula.conditions || [],
      examples: formula.examples || [],
      addedAt: new Date()
    });
    this.updatedAt = new Date();
  }

  /**
   * Add a variable definition
   * @param {object} variable - Variable object
   */
  addVariable(variable) {
    this.variables.push({
      symbol: variable.symbol,
      name: variable.name,
      description: variable.description,
      unit: variable.unit,
      type: variable.type, // "input", "output", "intermediate"
      range: variable.range,
      defaultValue: variable.defaultValue,
      typicalValues: variable.typicalValues || [],
      addedAt: new Date()
    });
    this.updatedAt = new Date();
  }

  /**
   * Add an assumption
   * @param {object} assumption - Assumption object
   */
  addAssumption(assumption) {
    this.assumptions.push({
      name: assumption.name,
      description: assumption.description,
      defaultValue: assumption.defaultValue,
      range: assumption.range,
      source: assumption.source, // "regulatory", "industry", "company"
      justification: assumption.justification,
      sensitivity: assumption.sensitivity || 'medium',
      addedAt: new Date()
    });
    this.updatedAt = new Date();
  }

  /**
   * Add a validation rule
   * @param {object} rule - Validation rule object
   */
  addValidationRule(rule) {
    this.validationRules.push({
      name: rule.name,
      description: rule.description,
      type: rule.type, // "range", "consistency", "reasonableness"
      condition: rule.condition,
      errorMessage: rule.errorMessage,
      warningMessage: rule.warningMessage,
      severity: rule.severity, // "error", "warning", "info"
      addedAt: new Date()
    });
    this.updatedAt = new Date();
  }

  /**
   * Get formula by ID
   * @param {string} formulaId - Formula ID
   * @returns {object|null} Formula object
   */
  getFormula(formulaId) {
    return this.formulas.find(f => f.id === formulaId) || null;
  }

  /**
   * Get variable by symbol
   * @param {string} symbol - Variable symbol
   * @returns {object|null} Variable object
   */
  getVariable(symbol) {
    return this.variables.find(v => v.symbol === symbol) || null;
  }

  /**
   * Validate methodology completeness
   * @returns {object} Validation result
   */
  validate() {
    const errors = [];
    const warnings = [];

    if (!this.name) errors.push('Methodology name is required');
    if (!this.description) errors.push('Description is required');
    if (!this.category) errors.push('Category is required');
    if (this.formulas.length === 0) warnings.push('No formulas defined');
    if (this.variables.length === 0) warnings.push('No variables defined');
    if (this.assumptions.length === 0) warnings.push('No assumptions defined');

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Create a new version of the methodology
   * @param {string} newVersion - New version number
   * @param {string} changeLog - Description of changes
   * @param {string} changedBy - User who made the change
   * @returns {object} New methodology version
   */
  createNewVersion(newVersion, changeLog, changedBy) {
    const newMethodology = new MethodologyModel({
      ...this.toJSON(),
      version: newVersion,
      updatedAt: new Date(),
      createdBy: changedBy
    });

    // Add version history entry
    newMethodology.versionHistory = [
      ...(this.versionHistory || []),
      {
        version: this.version,
        changeLog,
        changedBy,
        changedAt: new Date()
      }
    ];

    return newMethodology;
  }

  /**
   * Convert to JSON
   * @returns {object} Methodology data
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      version: this.version,
      description: this.description,
      formulas: this.formulas,
      variables: this.variables,
      assumptions: this.assumptions,
      validationRules: this.validationRules,
      regulatoryReferences: this.regulatoryReferences,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      isActive: this.isActive,
      createdBy: this.createdBy,
      category: this.category,
      complexity: this.complexity
    };
  }

  /**
   * Convert to public JSON (for sharing)
   * @returns {object} Public methodology data
   */
  toPublicJSON() {
    return {
      id: this.id,
      name: this.name,
      version: this.version,
      description: this.description,
      category: this.category,
      complexity: this.complexity,
      formulas: this.formulas.map(f => ({
        id: f.id,
        name: f.name,
        latex: f.latex,
        description: f.description,
        variables: f.variables
      })),
      variables: this.variables.map(v => ({
        symbol: v.symbol,
        name: v.name,
        description: v.description,
        unit: v.unit,
        type: v.type
      })),
      assumptions: this.assumptions.map(a => ({
        name: a.name,
        description: a.description,
        defaultValue: a.defaultValue,
        range: a.range,
        source: a.source
      }))
    };
  }
}

module.exports = MethodologyModel;
