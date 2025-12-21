/**
 * Formula Version data model for Firestore
 * Tracks individual formula changes and versions
 */

class FormulaVersionModel {
  constructor(data) {
    this.id = data.id;
    this.methodologyId = data.methodologyId;
    this.formulaId = data.formulaId;
    this.version = data.version; // e.g., "1.0.0"
    this.formula = data.formula; // LaTeX string
    this.description = data.description;
    this.changeLog = data.changeLog;
    this.changedBy = data.changedBy;
    this.timestamp = data.timestamp;
    this.isActive = data.isActive !== false;
    this.variables = data.variables || [];
    this.conditions = data.conditions || [];
    this.examples = data.examples || [];
    this.validationRules = data.validationRules || [];
  }

  /**
   * Create a new formula version document
   * @param {object} formulaData - Formula version data
   * @returns {object} Formula version document
   */
  static createFormulaVersionDocument(formulaData) {
    return {
      methodologyId: formulaData.methodologyId,
      formulaId: formulaData.formulaId,
      version: formulaData.version || '1.0.0',
      formula: formulaData.formula,
      description: formulaData.description,
      changeLog: formulaData.changeLog || 'Initial version',
      changedBy: formulaData.changedBy,
      timestamp: new Date(),
      isActive: true,
      variables: formulaData.variables || [],
      conditions: formulaData.conditions || [],
      examples: formulaData.examples || [],
      validationRules: formulaData.validationRules || []
    };
  }

  /**
   * Compare with another formula version
   * @param {FormulaVersionModel} otherVersion - Other formula version
   * @returns {object} Comparison result
   */
  compareWith(otherVersion) {
    const changes = {
      formulaChanged: this.formula !== otherVersion.formula,
      descriptionChanged: this.description !== otherVersion.description,
      variablesChanged: JSON.stringify(this.variables) !== JSON.stringify(otherVersion.variables),
      conditionsChanged: JSON.stringify(this.conditions) !== JSON.stringify(otherVersion.conditions),
      examplesChanged: JSON.stringify(this.examples) !== JSON.stringify(otherVersion.examples)
    };

    return {
      hasChanges: Object.values(changes).some(change => change),
      changes,
      versionDiff: {
        from: otherVersion.version,
        to: this.version
      }
    };
  }

  /**
   * Validate formula syntax (basic LaTeX validation)
   * @returns {object} Validation result
   */
  validateFormula() {
    const errors = [];
    const warnings = [];

    // Basic LaTeX validation
    if (!this.formula) {
      errors.push('Formula is required');
    } else {
      // Check for common LaTeX issues
      if (this.formula.includes('\\') && !this.formula.includes('\\')) {
        warnings.push('Formula may contain invalid LaTeX syntax');
      }
      
      // Check for balanced braces
      const openBraces = (this.formula.match(/\{/g) || []).length;
      const closeBraces = (this.formula.match(/\}/g) || []).length;
      if (openBraces !== closeBraces) {
        errors.push('Unbalanced braces in formula');
      }

      // Check for balanced parentheses
      const openParens = (this.formula.match(/\(/g) || []).length;
      const closeParens = (this.formula.match(/\)/g) || []).length;
      if (openParens !== closeParens) {
        errors.push('Unbalanced parentheses in formula');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Get formula dependencies (variables used in formula)
   * @returns {Array<string>} Array of variable symbols
   */
  getDependencies() {
    if (!this.formula) return [];
    
    // Extract variable symbols from LaTeX formula
    // This is a simple regex - could be enhanced for more complex formulas
    const variablePattern = /\\[a-zA-Z]+|([a-zA-Z]+(?:_[a-zA-Z0-9]+)*)/g;
    const matches = this.formula.match(variablePattern) || [];
    
    // Filter out LaTeX commands and common mathematical symbols
    const latexCommands = ['\\max', '\\min', '\\sum', '\\int', '\\frac', '\\sqrt', '\\log', '\\ln', '\\exp', '\\sin', '\\cos', '\\tan'];
    const mathSymbols = ['alpha', 'beta', 'gamma', 'delta', 'epsilon', 'theta', 'lambda', 'mu', 'pi', 'sigma', 'tau', 'phi', 'psi', 'omega'];
    
    return matches.filter(match => 
      !latexCommands.includes(match) && 
      !mathSymbols.includes(match) &&
      match.length > 1
    );
  }

  /**
   * Convert to JSON
   * @returns {object} Formula version data
   */
  toJSON() {
    return {
      id: this.id,
      methodologyId: this.methodologyId,
      formulaId: this.formulaId,
      version: this.version,
      formula: this.formula,
      description: this.description,
      changeLog: this.changeLog,
      changedBy: this.changedBy,
      timestamp: this.timestamp,
      isActive: this.isActive,
      variables: this.variables,
      conditions: this.conditions,
      examples: this.examples,
      validationRules: this.validationRules
    };
  }

  /**
   * Convert to public JSON (for sharing)
   * @returns {object} Public formula version data
   */
  toPublicJSON() {
    return {
      id: this.id,
      methodologyId: this.methodologyId,
      formulaId: this.formulaId,
      version: this.version,
      formula: this.formula,
      description: this.description,
      changeLog: this.changeLog,
      timestamp: this.timestamp,
      variables: this.variables,
      conditions: this.conditions,
      examples: this.examples
    };
  }
}

module.exports = FormulaVersionModel;
