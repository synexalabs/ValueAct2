/**
 * Formatter Utilities
 * Provides functions for formatting numbers, currencies, percentages,
 * and other actuarial data for display
 */

/**
 * Format currency with appropriate precision
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (default 'USD')
 * @param {number} decimals - Number of decimal places (default 2)
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currency = 'USD', decimals = 2) => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return 'N/A';
  }
  
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
  
  return formatter.format(amount);
};

/**
 * Format large numbers with appropriate suffixes (K, M, B)
 * @param {number} number - Number to format
 * @param {number} decimals - Number of decimal places (default 1)
 * @returns {string} Formatted number string
 */
export const formatLargeNumber = (number, decimals = 1) => {
  if (number === null || number === undefined || isNaN(number)) {
    return 'N/A';
  }
  
  const absNumber = Math.abs(number);
  const sign = number < 0 ? '-' : '';
  
  if (absNumber >= 1e9) {
    return sign + (absNumber / 1e9).toFixed(decimals) + 'B';
  } else if (absNumber >= 1e6) {
    return sign + (absNumber / 1e6).toFixed(decimals) + 'M';
  } else if (absNumber >= 1e3) {
    return sign + (absNumber / 1e3).toFixed(decimals) + 'K';
  } else {
    return sign + absNumber.toFixed(decimals);
  }
};

/**
 * Format percentage with appropriate precision
 * @param {number} value - Value to format as percentage
 * @param {number} decimals - Number of decimal places (default 2)
 * @param {boolean} showSign - Whether to show + sign for positive values (default false)
 * @returns {string} Formatted percentage string
 */
export const formatPercentage = (value, decimals = 2, showSign = false) => {
  if (value === null || value === undefined || isNaN(value)) {
    return 'N/A';
  }
  
  const percentage = value * 100;
  const sign = showSign && percentage > 0 ? '+' : '';
  
  return `${sign}${percentage.toFixed(decimals)}%`;
};

/**
 * Format ratio (e.g., solvency ratio)
 * @param {number} ratio - Ratio value
 * @param {number} decimals - Number of decimal places (default 1)
 * @returns {string} Formatted ratio string
 */
export const formatRatio = (ratio, decimals = 1) => {
  if (ratio === null || ratio === undefined || isNaN(ratio)) {
    return 'N/A';
  }
  
  if (ratio === Infinity) {
    return '∞';
  }
  
  return `${ratio.toFixed(decimals)}%`;
};

/**
 * Format number with thousand separators
 * @param {number} number - Number to format
 * @param {number} decimals - Number of decimal places (default 0)
 * @returns {string} Formatted number string
 */
export const formatNumber = (number, decimals = 0) => {
  if (number === null || number === undefined || isNaN(number)) {
    return 'N/A';
  }
  
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(number);
};

/**
 * Format actuarial notation (e.g., äx, Ax)
 * @param {string} symbol - Base symbol
 * @param {string} subscript - Subscript
 * @param {string} superscript - Superscript
 * @returns {string} Formatted actuarial notation
 */
export const formatActuarialNotation = (symbol, subscript = '', superscript = '') => {
  let notation = symbol;
  
  if (subscript) {
    notation += `_{${subscript}}`;
  }
  
  if (superscript) {
    notation += `^{${superscript}}`;
  }
  
  return notation;
};

/**
 * Format date for display
 * @param {Date|string} date - Date to format
 * @param {string} format - Format type ('short', 'long', 'iso') (default 'short')
 * @returns {string} Formatted date string
 */
export const formatDate = (date, format = 'short') => {
  if (!date) return 'N/A';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return 'Invalid Date';
  }
  
  switch (format) {
    case 'long':
      return dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    case 'iso':
      return dateObj.toISOString().split('T')[0];
    default:
      return dateObj.toLocaleDateString('en-US');
  }
};

/**
 * Format time duration
 * @param {number} milliseconds - Duration in milliseconds
 * @returns {string} Formatted duration string
 */
export const formatDuration = (milliseconds) => {
  if (milliseconds === null || milliseconds === undefined || isNaN(milliseconds)) {
    return 'N/A';
  }
  
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) {
    return `${days}d ${hours % 24}h ${minutes % 60}m`;
  } else if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
};

/**
 * Format table data for CSV export
 * @param {Array<Object>} data - Array of objects to format
 * @param {Array<string>} columns - Column names to include
 * @returns {string} CSV formatted string
 */
export const formatCSV = (data, columns) => {
  if (!data || data.length === 0) return '';
  
  // Create header row
  const header = columns.join(',');
  
  // Create data rows
  const rows = data.map(row => {
    return columns.map(col => {
      const value = row[col];
      if (value === null || value === undefined) return '';
      if (typeof value === 'string' && value.includes(',')) {
        return `"${value}"`; // Quote strings containing commas
      }
      return value;
    }).join(',');
  });
  
  return [header, ...rows].join('\n');
};

/**
 * Format calculation results for display
 * @param {Object} results - Calculation results
 * @param {Object} options - Formatting options
 * @returns {Object} Formatted results
 */
export const formatCalculationResults = (results, options = {}) => {
  const {
    currency = 'USD',
    percentageDecimals = 2,
    numberDecimals = 2
  } = options;
  
  const formatted = {};
  
  Object.entries(results).forEach(([key, value]) => {
    if (typeof value === 'number') {
      if (key.toLowerCase().includes('ratio') || key.toLowerCase().includes('percent')) {
        formatted[key] = formatPercentage(value / 100, percentageDecimals);
      } else if (key.toLowerCase().includes('currency') || key.toLowerCase().includes('amount')) {
        formatted[key] = formatCurrency(value, currency);
      } else {
        formatted[key] = formatNumber(value, numberDecimals);
      }
    } else {
      formatted[key] = value;
    }
  });
  
  return formatted;
};
