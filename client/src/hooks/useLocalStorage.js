/**
 * Custom hook for localStorage operations with compression
 * Provides functions to save, load, and manage calculation data
 */

import { useState, useEffect } from 'react';
import { compressData, decompressData, getStorageSize, formatBytes } from '../utils/storageCompression';

/**
 * Custom hook for localStorage operations with compression
 * @param {string} key - localStorage key
 * @param {*} initialValue - Initial value if no data exists
 * @param {Object} options - Configuration options
 * @param {boolean} options.compress - Whether to compress data (default: true)
 * @param {number} options.maxSize - Maximum size in bytes (default: 5MB)
 * @param {number} options.maxItems - Maximum number of items to keep (default: 50)
 * @returns {Array} [value, setValue, removeValue, clearAll, storageInfo]
 */
export const useLocalStorage = (key, initialValue, options = {}) => {
  const { compress = true, maxSize = 5 * 1024 * 1024, maxItems = 50 } = options; // 5MB default

  // Get value from localStorage or use initial value
  const [storedValue, setStoredValue] = useState(initialValue);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        const data = compress ? decompressData(item) : JSON.parse(item);
        if (data) {
          setStoredValue(data);
        }
      }
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
    }
  }, [key, compress]);

  // Set value in localStorage and state with size management
  const setValue = (value) => {
    if (typeof window === 'undefined') return;
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;

      // Check if it's an array and limit items
      let processedValue = valueToStore;
      if (Array.isArray(valueToStore) && valueToStore.length > maxItems) {
        processedValue = valueToStore.slice(0, maxItems);
        console.warn(`Storage limit reached for ${key}. Keeping only ${maxItems} items.`);
      }

      // Compress and check size
      const dataToStore = compress ? compressData(processedValue) : JSON.stringify(processedValue);
      const size = getStorageSize(dataToStore);

      if (size > maxSize) {
        console.warn(`Data size (${formatBytes(size)}) exceeds limit (${formatBytes(maxSize)}) for ${key}`);
        // Try to reduce data size by keeping fewer items
        if (Array.isArray(processedValue)) {
          const reducedValue = processedValue.slice(0, Math.floor(maxItems * 0.5));
          const reducedData = compress ? compressData(reducedValue) : JSON.stringify(reducedValue);
          window.localStorage.setItem(key, reducedData);
          setStoredValue(reducedValue);
          return;
        }
      }

      setStoredValue(processedValue);
      window.localStorage.setItem(key, dataToStore);
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  // Remove specific key from localStorage
  const removeValue = () => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  };

  // Clear all localStorage
  const clearAll = () => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.clear();
      setStoredValue(initialValue);
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  };

  // Get storage information
  const getStorageInfo = () => {
    if (typeof window === 'undefined') return { size: 0, formattedSize: '0 Bytes', itemCount: 0 };
    try {
      const item = window.localStorage.getItem(key);
      if (!item) return { size: 0, formattedSize: '0 Bytes', itemCount: 0 };

      const size = getStorageSize(item);
      const data = compress ? decompressData(item) : JSON.parse(item);
      const itemCount = Array.isArray(data) ? data.length : 1;

      return {
        size,
        formattedSize: formatBytes(size),
        itemCount,
        isCompressed: compress
      };
    } catch (error) {
      console.error(`Error getting storage info for "${key}":`, error);
      return { size: 0, formattedSize: '0 Bytes', itemCount: 0 };
    }
  };

  return [storedValue, setValue, removeValue, clearAll, getStorageInfo];
};

/**
 * Hook for managing calculation history with optimized storage
 * @param {string} calculatorType - Type of calculator (e.g., 'ifrs17', 'solvency')
 * @param {Object} options - Storage options
 * @returns {Object} Calculation history management functions
 */
export const useCalculationHistory = (calculatorType, options = {}) => {
  const { maxItems = 25, compress = true, maxSize = 2 * 1024 * 1024 } = options; // 2MB for history
  const historyKey = `calculations_${calculatorType}`;
  const storageResult = useLocalStorage(
    historyKey,
    [],
    { compress, maxSize, maxItems }
  );
  const [history, setHistory] = storageResult;
  const getStorageInfo = storageResult[4];

  const saveCalculation = (calculation) => {
    // Optimize calculation data before saving
    const optimizedCalculation = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      // Only save essential data
      inputs: {
        policies: calculation.inputs?.policies?.map(policy => ({
          policy_id: policy.policy_id,
          face_amount: policy.face_amount,
          premium: policy.premium,
          issue_age: policy.issue_age,
          policy_term: policy.policy_term,
          gender: policy.gender
        })) || [],
        assumptions: calculation.inputs?.assumptions || {}
      },
      results: {
        // Only save key results, not full audit trail
        portfolio_csm: calculation.results?.portfolio_csm,
        execution_time: calculation.results?.execution_time,
        policy_count: calculation.results?.policy_count || calculation.inputs?.policies?.length || 0
      },
      // Remove large audit trails and intermediate results
      summary: calculation.summary || `${calculatorType.toUpperCase()} calculation completed`
    };

    setHistory(prev => [optimizedCalculation, ...prev]);
  };

  const loadCalculation = (id) => {
    return history.find(calc => calc.id === id);
  };

  const deleteCalculation = (id) => {
    setHistory(prev => prev.filter(calc => calc.id !== id));
  };

  const clearHistory = () => {
    setHistory([]);
  };

  const exportHistory = () => {
    const dataStr = JSON.stringify(history, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${calculatorType}_calculations_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return {
    history,
    saveCalculation,
    loadCalculation,
    deleteCalculation,
    clearHistory,
    exportHistory,
    storageInfo: getStorageInfo()
  };
};

/**
 * Hook for managing saved calculation templates
 * @param {string} calculatorType - Type of calculator
 * @returns {Object} Template management functions
 */
export const useCalculationTemplates = (calculatorType) => {
  const templatesKey = `templates_${calculatorType}`;
  const [templates, setTemplates] = useLocalStorage(templatesKey, []);

  const saveTemplate = (template) => {
    const newTemplate = {
      id: Date.now(),
      name: template.name || `Template ${templates.length + 1}`,
      timestamp: new Date().toISOString(),
      ...template
    };

    setTemplates(prev => [newTemplate, ...prev].slice(0, 20)); // Keep last 20 templates
  };

  const loadTemplate = (id) => {
    return templates.find(template => template.id === id);
  };

  const deleteTemplate = (id) => {
    setTemplates(prev => prev.filter(template => template.id !== id));
  };

  const clearTemplates = () => {
    setTemplates([]);
  };

  return {
    templates,
    saveTemplate,
    loadTemplate,
    deleteTemplate,
    clearTemplates
  };
};
