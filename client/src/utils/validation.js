/**
 * Input Validation Utilities
 * Provides validation functions and error messages for form inputs
 */

/**
 * Validation rules for different input types
 */
export const validationRules = {
  required: (value) => ({
    isValid: value !== null && value !== undefined && value !== '',
    message: 'This field is required'
  }),

  number: (value) => ({
    isValid: !isNaN(value) && isFinite(value),
    message: 'Please enter a valid number'
  }),

  positiveNumber: (value) => ({
    isValid: !isNaN(value) && isFinite(value) && value > 0,
    message: 'Please enter a positive number'
  }),

  nonNegativeNumber: (value) => ({
    isValid: !isNaN(value) && isFinite(value) && value >= 0,
    message: 'Please enter a non-negative number'
  }),

  percentage: (value) => ({
    isValid: !isNaN(value) && isFinite(value) && value >= 0 && value <= 1,
    message: 'Please enter a percentage between 0 and 1 (e.g., 0.05 for 5%)'
  }),

  age: (value) => ({
    isValid: !isNaN(value) && isFinite(value) && value >= 0 && value <= 120,
    message: 'Please enter a valid age between 0 and 120'
  }),

  term: (value) => ({
    isValid: !isNaN(value) && isFinite(value) && value > 0 && value <= 100,
    message: 'Please enter a valid term between 1 and 100 years'
  }),

  interestRate: (value) => ({
    isValid: !isNaN(value) && isFinite(value) && value >= 0 && value <= 1,
    message: 'Please enter an interest rate between 0 and 1 (e.g., 0.03 for 3%)'
  }),

  mortalityRate: (value) => ({
    isValid: !isNaN(value) && isFinite(value) && value >= 0 && value <= 1,
    message: 'Please enter a mortality rate between 0 and 1'
  }),

  sumAssured: (value) => ({
    isValid: !isNaN(value) && isFinite(value) && value > 0,
    message: 'Please enter a positive sum assured amount'
  }),

  premium: (value) => ({
    isValid: !isNaN(value) && isFinite(value) && value >= 0,
    message: 'Please enter a non-negative premium amount'
  }),

  cashFlows: (value) => ({
    isValid: Array.isArray(value) && value.length > 0 && value.every(cf => !isNaN(cf) && isFinite(cf)),
    message: 'Please enter valid cash flow values'
  }),

  email: (value) => ({
    isValid: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    message: 'Please enter a valid email address'
  })
};

/**
 * Validate a single field with multiple rules
 * @param {*} value - The value to validate
 * @param {Array} rules - Array of validation rule names
 * @returns {Object} Validation result
 */
export const validateField = (value, rules = []) => {
  for (const rule of rules) {
    if (typeof rule === 'string' && validationRules[rule]) {
      const result = validationRules[rule](value);
      if (!result.isValid) {
        return result;
      }
    } else if (typeof rule === 'function') {
      const result = rule(value);
      if (!result.isValid) {
        return result;
      }
    }
  }

  return { isValid: true, message: '' };
};

/**
 * Validate multiple fields
 * @param {Object} values - Object with field values
 * @param {Object} fieldRules - Object with field names as keys and rule arrays as values
 * @returns {Object} Validation results
 */
export const validateFields = (values, fieldRules) => {
  const results = {};
  let isValid = true;

  Object.keys(fieldRules).forEach(fieldName => {
    const value = values[fieldName];
    const rules = fieldRules[fieldName];
    const result = validateField(value, rules);

    results[fieldName] = result;
    if (!result.isValid) {
      isValid = false;
    }
  });

  return { isValid, results };
};

/**
 * Custom validation rules for actuarial calculations
 */
export const actuarialValidationRules = {
  // IFRS 17 specific validations
  csmInputs: (values) => {
    const { premium, fcf, ra } = values;

    if (premium < 0) {
      return { isValid: false, message: 'Premium cannot be negative' };
    }

    if (fcf < 0) {
      return { isValid: false, message: 'Future Cash Flows cannot be negative' };
    }

    if (ra < 0) {
      return { isValid: false, message: 'Risk Adjustment cannot be negative' };
    }

    if (premium < fcf + ra) {
      return { isValid: false, message: 'Premium should be sufficient to cover FCF and RA' };
    }

    return { isValid: true, message: '' };
  },

  // Solvency II specific validations
  scrInputs: (values) => {
    const riskModules = Object.values(values);

    if (riskModules.some(risk => risk < 0)) {
      return { isValid: false, message: 'Risk module values cannot be negative' };
    }

    if (riskModules.every(risk => risk === 0)) {
      return { isValid: false, message: 'At least one risk module must have a value' };
    }

    return { isValid: true, message: '' };
  },

  // Pricing specific validations
  pricingInputs: (values) => {
    const { age, term, mortalityRate, interestRate } = values;

    if (age + term > 100) {
      return { isValid: false, message: 'Age plus term should not exceed 100 years' };
    }

    if (mortalityRate > 0.5) {
      return { isValid: false, message: 'Mortality rate seems unusually high (>50%)' };
    }

    if (interestRate > 0.2) {
      return { isValid: false, message: 'Interest rate seems unusually high (>20%)' };
    }

    return { isValid: true, message: '' };
  },

  // Mortality specific validations
  mortalityInputs: (values) => {
    const { currentAge, futureAge } = values;

    if (futureAge <= currentAge) {
      return { isValid: false, message: 'Future age must be greater than current age' };
    }

    if (futureAge - currentAge > 80) {
      return { isValid: false, message: 'Time period seems unusually long (>80 years)' };
    }

    return { isValid: true, message: '' };
  }
};

/**
 * Get user-friendly error messages for common actuarial errors
 */
export const getActuarialErrorMessage = (error) => {
  const errorMessages = {
    'INVALID_INPUT': 'Please check your input values and try again',
    'CALCULATION_ERROR': 'An error occurred during calculation. Please verify your inputs.',
    'DIVISION_BY_ZERO': 'Cannot divide by zero. Please check your input values.',
    'NEGATIVE_RESULT': 'Calculation resulted in a negative value. Please review your assumptions.',
    'INFINITE_RESULT': 'Calculation resulted in an infinite value. Please check your inputs.',
    'NETWORK_ERROR': 'Unable to connect to the server. Please check your internet connection.',
    'TIMEOUT': 'The calculation is taking too long. Please try with simpler inputs.'
  };

  return errorMessages[error] || 'An unexpected error occurred. Please try again.';
};

/**
 * Format validation error for display
 */
export const formatValidationError = (error) => {
  if (typeof error === 'string') {
    return error;
  }

  if (error.message) {
    return error.message;
  }

  return 'Please check your input and try again';
};
