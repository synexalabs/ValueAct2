/**
 * Unified Design System for Valuact Actuarial Platform
 * Ensures consistent visual design across all calculators
 */

export const designSystem = {
  // Primary Brand Colors (Deep Navy)
  primary: {
    gradient: 'from-trust-800 to-trust-950',
    hover: 'from-trust-900 to-trust-950',
    light: 'from-trust-50 to-trust-100',
    border: 'border-trust-200',
    text: 'text-trust-950',
    value: 'text-trust-600'
  },

  // Calculator-Specific Colors
  calculators: {
    ifrs17: {
      gradient: 'from-trust-800 to-trust-950',
      hover: 'from-trust-900 to-trust-950',
      light: 'from-trust-50 to-trust-100',
      border: 'border-trust-200',
      text: 'text-trust-950',
      value: 'text-trust-600'
    },
    solvency: {
      gradient: 'from-growth-600 to-growth-800',
      hover: 'from-growth-700 to-growth-900',
      light: 'from-growth-50 to-growth-100',
      border: 'border-growth-200',
      text: 'text-growth-900',
      value: 'text-growth-600'
    },
    pricing: {
      gradient: 'from-trust-900 to-trust-950',
      hover: 'from-trust-950 to-trust-950',
      light: 'from-trust-50 to-trust-100',
      border: 'border-trust-100',
      text: 'text-trust-900',
      value: 'text-trust-700'
    },
    mortality: {
      gradient: 'from-accent-600 to-accent-800',
      hover: 'from-accent-700 to-accent-900',
      light: 'from-accent-50 to-accent-100',
      border: 'border-accent-200',
      text: 'text-accent-950',
      value: 'text-accent-600'
    }
  },

  // Success/Error/Warning Colors
  status: {
    success: {
      gradient: 'from-growth-50 to-growth-100',
      border: 'border-growth-200',
      text: 'text-growth-900',
      value: 'text-growth-600'
    },
    warning: {
      gradient: 'from-accent-50 to-accent-100',
      border: 'border-accent-200',
      text: 'text-accent-900',
      value: 'text-accent-600'
    },
    error: {
      gradient: 'from-red-50 to-red-100',
      border: 'border-red-200',
      text: 'text-red-900',
      value: 'text-red-600'
    },
    info: {
      gradient: 'from-trust-50 to-trust-100',
      border: 'border-trust-200',
      text: 'text-trust-900',
      value: 'text-trust-600'
    }
  },

  // Consistent Spacing
  spacing: {
    container: 'px-4',
    card: 'px-2',
    title: 'px-2',
    label: 'px-1',
    content: 'px-2',
    button: 'px-1'
  },

  // Consistent Sizing
  sizing: {
    input: 'px-4 py-3',
    button: 'px-6 py-3',
    buttonSmall: 'px-4 py-2',
    cardPadding: 'p-10',
    cardPaddingSmall: 'p-6'
  },

  // Typography
  typography: {
    title: 'text-4xl font-heading font-black text-trust-950 uppercase tracking-tight',
    subtitle: 'text-2xl font-heading font-black text-trust-900 uppercase tracking-tight',
    label: 'block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]',
    value: 'text-3xl font-heading font-black',
    description: 'text-gray-400 font-medium'
  }
};

/**
 * Get calculator-specific colors
 * @param {string} calculatorType - Type of calculator ('ifrs17', 'solvency', 'pricing', 'mortality')
 * @returns {Object} Color scheme object
 */
export const getCalculatorColors = (calculatorType) => {
  return designSystem.calculators[calculatorType] || designSystem.calculators.ifrs17;
};

/**
 * Get status colors
 * @param {string} status - Status type ('success', 'warning', 'error', 'info')
 * @returns {Object} Status color scheme
 */
export const getStatusColors = (status) => {
  return designSystem.status[status] || designSystem.status.info;
};
