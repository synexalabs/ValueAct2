/**
 * Unified Design System for Valuact Actuarial Platform
 * Ensures consistent visual design across all calculators
 */

export const designSystem = {
  // Primary Brand Colors
  primary: {
    gradient: 'from-blue-600 to-indigo-600',
    hover: 'from-blue-700 to-indigo-700',
    light: 'from-blue-50 to-indigo-50',
    border: 'border-blue-200',
    text: 'text-blue-800',
    value: 'text-blue-600'
  },

  // Calculator-Specific Colors
  calculators: {
    ifrs17: {
      gradient: 'from-blue-600 to-indigo-600',
      hover: 'from-blue-700 to-indigo-700',
      light: 'from-blue-50 to-indigo-50',
      border: 'border-blue-200',
      text: 'text-blue-800',
      value: 'text-blue-600'
    },
    solvency: {
      gradient: 'from-green-600 to-emerald-600',
      hover: 'from-green-700 to-emerald-700',
      light: 'from-green-50 to-emerald-50',
      border: 'border-green-200',
      text: 'text-green-800',
      value: 'text-green-600'
    },
    pricing: {
      gradient: 'from-purple-600 to-indigo-600',
      hover: 'from-purple-700 to-indigo-700',
      light: 'from-purple-50 to-indigo-50',
      border: 'border-purple-200',
      text: 'text-purple-800',
      value: 'text-purple-600'
    },
    mortality: {
      gradient: 'from-red-600 to-pink-600',
      hover: 'from-red-700 to-pink-700',
      light: 'from-red-50 to-pink-50',
      border: 'border-red-200',
      text: 'text-red-800',
      value: 'text-red-600'
    }
  },

  // Success/Error/Warning Colors
  status: {
    success: {
      gradient: 'from-green-50 to-emerald-50',
      border: 'border-green-200',
      text: 'text-green-800',
      value: 'text-green-600'
    },
    warning: {
      gradient: 'from-orange-50 to-yellow-50',
      border: 'border-orange-200',
      text: 'text-orange-800',
      value: 'text-orange-600'
    },
    error: {
      gradient: 'from-red-50 to-pink-50',
      border: 'border-red-200',
      text: 'text-red-800',
      value: 'text-red-600'
    },
    info: {
      gradient: 'from-blue-50 to-indigo-50',
      border: 'border-blue-200',
      text: 'text-blue-800',
      value: 'text-blue-600'
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
    cardPadding: 'p-6',
    cardPaddingSmall: 'p-4'
  },

  // Typography
  typography: {
    title: 'text-3xl font-bold text-gray-800',
    subtitle: 'text-xl font-semibold text-gray-800',
    label: 'block text-sm font-medium text-gray-700',
    value: 'text-2xl font-bold',
    description: 'text-gray-600'
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
