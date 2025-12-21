/**
 * Term Life Insurance Data Schema Definition
 * Defines the unified JSON structure for Term Life actuarial data
 */

/**
 * Validation severity levels
 */
const SEVERITY = {
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

/**
 * Term Life JSON Schema Structure
 */
const TERM_LIFE_SCHEMA = {
  meta: {
    run_id: { type: 'string', required: true, pattern: /^[a-zA-Z0-9_-]+$/ },
    upload_time: { type: 'string', required: true, format: 'iso-date' },
    user_id: { type: 'string', required: true },
    version: { type: 'string', required: true, default: '1.0' },
    scenario: { type: 'string', required: false, default: 'base' },
    product_type: { type: 'string', required: true, enum: ['TermLife'] },
    description: { type: 'string', required: false },
    valuation_date: { type: 'string', required: true, format: 'iso-date' }
  },

  assumptions: {
    discount_rates: {
      risk_free_rate: { type: 'number', required: true, min: 0, max: 0.5 },
      credit_spread: { type: 'number', required: true, min: 0, max: 0.2 },
      liquidity_premium: { type: 'number', required: false, min: 0, max: 0.1, default: 0 }
    },
    mortality_tables: {
      table_name: { type: 'string', required: true, enum: ['2008VBT', '2015VBT', 'CSO2017'] },
      adjustment_factor: { type: 'number', required: false, min: 0.5, max: 2.0, default: 1.0 },
      improvement_factor: { type: 'number', required: false, min: 0, max: 0.05, default: 0.01 }
    },
    expense_assumptions: {
      initial_expense_ratio: { type: 'number', required: true, min: 0, max: 1 },
      renewal_expense_ratio: { type: 'number', required: true, min: 0, max: 1 },
      claim_expense_ratio: { type: 'number', required: false, min: 0, max: 1, default: 0.05 }
    },
    lapse_rates: {
      first_year_lapse: { type: 'number', required: true, min: 0, max: 0.5 },
      renewal_lapse: { type: 'number', required: true, min: 0, max: 0.2 },
      lapse_improvement: { type: 'number', required: false, min: 0, max: 0.1, default: 0 }
    }
  },

  policies: {
    schema: {
      policy_id: { type: 'string', required: true, pattern: /^[a-zA-Z0-9_-]+$/ },
      issue_date: { type: 'string', required: true, format: 'iso-date' },
      issue_age: { type: 'number', required: true, min: 18, max: 80 },
      gender: { type: 'string', required: true, enum: ['M', 'F'] },
      sum_assured: { type: 'number', required: true, min: 1000 },
      premium: { type: 'number', required: true, min: 0 },
      policy_term: { type: 'number', required: true, min: 1, max: 50 },
      underwriting_class: { type: 'string', required: false, enum: ['Preferred', 'Standard', 'Substandard'], default: 'Standard' },
      payment_frequency: { type: 'string', required: false, enum: ['Annual', 'SemiAnnual', 'Quarterly', 'Monthly'], default: 'Annual' },
      smoking_status: { type: 'string', required: false, enum: ['NonSmoker', 'Smoker'], default: 'NonSmoker' },
      occupation_class: { type: 'string', required: false, enum: ['Professional', 'Office', 'Manual', 'Hazardous'], default: 'Office' }
    },
    validation_rules: [
      {
        name: 'age_term_consistency',
        rule: (policy) => policy.issue_age + policy.policy_term <= 120,
        message: 'Issue age plus policy term must not exceed 120',
        severity: SEVERITY.ERROR
      },
      {
        name: 'premium_reasonableness',
        rule: (policy) => policy.premium > 0 && policy.premium < policy.sum_assured * 0.1,
        message: 'Premium should be positive and less than 10% of sum assured',
        severity: SEVERITY.WARNING
      }
    ]
  },

  actuals: {
    schema: {
      policy_id: { type: 'string', required: true },
      period: { type: 'number', required: true, min: 1 },
      date: { type: 'string', required: true, format: 'iso-date' },
      premium_received: { type: 'number', required: false, min: 0, default: 0 },
      claims_paid: { type: 'number', required: false, min: 0, default: 0 },
      expenses_incurred: { type: 'number', required: false, min: 0, default: 0 },
      lapses: { type: 'number', required: false, min: 0, max: 1, default: 0 },
      surrenders: { type: 'number', required: false, min: 0, max: 1, default: 0 },
      policy_count: { type: 'number', required: false, min: 0, default: 1 }
    },
    validation_rules: [
      {
        name: 'period_consistency',
        rule: (actual) => actual.period >= 1 && actual.period <= 50,
        message: 'Period must be between 1 and 50',
        severity: SEVERITY.ERROR
      },
      {
        name: 'cash_flow_reasonableness',
        rule: (actual) => actual.premium_received >= 0 && actual.claims_paid >= 0,
        message: 'Cash flows must be non-negative',
        severity: SEVERITY.ERROR
      }
    ]
  }
};

/**
 * File type detection based on filename and headers
 */
const FILE_TYPE_DETECTION = {
  meta: {
    keywords: ['meta', 'metadata', 'run_info', 'scenario'],
    required_columns: ['run_id', 'upload_time', 'user_id', 'product_type']
  },
  assumptions: {
    keywords: ['assumptions', 'rates', 'mortality', 'discount', 'expense'],
    required_columns: ['discount_rates', 'mortality_tables', 'expense_assumptions']
  },
  policies: {
    keywords: ['policies', 'policy', 'policyholder', 'contract'],
    required_columns: ['policy_id', 'issue_date', 'issue_age', 'sum_assured', 'premium', 'policy_term']
  },
  actuals: {
    keywords: ['actuals', 'transactions', 'cash_flows', 'experience'],
    required_columns: ['policy_id', 'period', 'date']
  }
};

/**
 * Validation result structure
 */
const VALIDATION_RESULT = {
  isValid: false,
  errors: [],
  warnings: [],
  stats: {
    totalRows: 0,
    validRows: 0,
    errorRows: 0,
    warningRows: 0
  }
};

/**
 * Example Term Life JSON structure
 */
const EXAMPLE_TERM_LIFE_JSON = {
  meta: {
    run_id: "run_20250125_001",
    upload_time: "2025-01-25T10:30:00Z",
    user_id: "user_123",
    version: "1.0",
    scenario: "base",
    product_type: "TermLife",
    description: "Q4 2024 Term Life Valuation",
    valuation_date: "2024-12-31T00:00:00Z"
  },
  assumptions: {
    discount_rates: {
      risk_free_rate: 0.03,
      credit_spread: 0.01,
      liquidity_premium: 0.005
    },
    mortality_tables: {
      table_name: "2008VBT",
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
  },
  policies: [
    {
      policy_id: "POL001",
      issue_date: "2020-01-15",
      issue_age: 35,
      gender: "M",
      sum_assured: 100000,
      premium: 500,
      policy_term: 20,
      underwriting_class: "Standard",
      payment_frequency: "Annual",
      smoking_status: "NonSmoker",
      occupation_class: "Office"
    }
  ],
  actuals: [
    {
      policy_id: "POL001",
      period: 1,
      date: "2021-01-15",
      premium_received: 500,
      claims_paid: 0,
      expenses_incurred: 75,
      lapses: 0,
      surrenders: 0,
      policy_count: 1
    }
  ]
};

module.exports = {
  TERM_LIFE_SCHEMA,
  FILE_TYPE_DETECTION,
  VALIDATION_RESULT,
  EXAMPLE_TERM_LIFE_JSON,
  SEVERITY
};
