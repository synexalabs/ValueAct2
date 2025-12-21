/**
 * Calculator Styling Utilities
 * Provides consistent styling patterns for all calculator components
 */

export const calculatorStyles = {
  // Container styles
  container: "max-w-6xl mx-auto p-6",
  
  // Header styles
  headerContainer: "mb-8 px-4",
  title: "text-3xl font-bold text-gray-800 mb-2 px-2",
  description: "text-gray-600 px-2",
  
  // Tab navigation styles
  tabContainer: "flex flex-wrap gap-2 mb-6 px-4",
  tabButton: (isActive) => `flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
    isActive
      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
  }`,
  tabIcon: "h-4 w-4",
  tabLabel: "px-1",
  
  // Card styles
  card: "card",
  cardTitle: "text-xl font-semibold text-gray-800 mb-4 px-2",
  cardContent: "space-y-4 px-2",
  
  // Form styles
  formGroup: "space-y-4 px-2",
  label: "block text-sm font-medium text-gray-700 mb-2 px-1",
  input: "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent",
  select: "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent",
  
  // Button styles
  buttonContainer: "flex space-x-3 px-1",
  primaryButton: "flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 font-medium",
  secondaryButton: "px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium",
  
  // Results styles
  resultsContainer: "space-y-4 px-2",
  resultCard: (color) => `bg-gradient-to-r from-${color}-50 to-${color}-100 p-6 rounded-lg border border-${color}-200`,
  resultTitle: (color) => `font-semibold text-${color}-800 mb-3 px-1`,
  resultValue: (color) => `text-2xl font-bold text-${color}-600 px-1`,
  resultFormula: (color) => `text-sm text-${color}-700 mt-2 px-1`,
  
  // Grid styles
  gridContainer: "grid grid-cols-1 lg:grid-cols-2 gap-6 px-4",
  gridItem: "text-center p-4 bg-gray-50 rounded-lg",
  gridLabel: "font-medium text-gray-600 px-1",
  gridValue: "font-semibold text-gray-800 px-1",
  
  // Table styles
  tableContainer: "overflow-x-auto",
  table: "w-full table-auto",
  tableHeader: "bg-gray-50",
  tableHeaderCell: "px-4 py-2 text-left text-sm font-medium text-gray-700",
  tableRow: "border-b border-gray-200",
  tableCell: "px-4 py-2 text-sm text-gray-900",
  
  // History styles
  historyContainer: "card mt-8",
  historyTitle: "text-xl font-semibold text-gray-800 mb-4 px-2",
  historyItem: "flex items-center justify-between p-4 bg-gray-50 rounded-lg",
  historyItemContent: "px-1",
  historyItemMeta: "text-sm text-gray-600 px-1",
  historyItemValue: "text-sm text-gray-600 px-1"
};

/**
 * Apply consistent styling to calculator components
 * @param {Object} component - React component to style
 * @param {string} type - Type of calculator ('ifrs17', 'solvency', 'mortality', 'pricing')
 */
export const applyCalculatorStyles = (component, type) => {
  // This function would be used to programmatically apply styles
  // For now, we'll use the styles object directly in components
  return component;
};

/**
 * Get color scheme for different calculator types
 * @param {string} type - Calculator type
 * @returns {Object} Color scheme object
 */
export const getColorScheme = (type) => {
  const schemes = {
    ifrs17: {
      primary: 'purple',
      secondary: 'pink',
      success: 'green',
      warning: 'orange',
      info: 'blue'
    },
    solvency: {
      primary: 'blue',
      secondary: 'indigo',
      success: 'green',
      warning: 'yellow',
      info: 'cyan'
    },
    mortality: {
      primary: 'red',
      secondary: 'pink',
      success: 'green',
      warning: 'orange',
      info: 'blue'
    },
    pricing: {
      primary: 'purple',
      secondary: 'pink',
      success: 'green',
      warning: 'orange',
      info: 'blue'
    }
  };
  
  return schemes[type] || schemes.pricing;
};
