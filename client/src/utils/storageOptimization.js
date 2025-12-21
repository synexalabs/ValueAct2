/**
 * Additional Local Storage Optimization Strategies
 * 
 * This file contains utility functions and strategies for reducing
 * local storage usage in the Valuact application.
 */

/**
 * 1. Data Archiving Strategy
 * Automatically archive old data to reduce active storage usage
 */

export const archiveOldData = (key, maxAge = 30 * 24 * 60 * 60 * 1000) => { // 30 days
  try {
    const data = JSON.parse(localStorage.getItem(key) || '[]');
    if (!Array.isArray(data)) return;

    const cutoffDate = new Date(Date.now() - maxAge);
    const recentData = data.filter(item => {
      const itemDate = new Date(item.timestamp || item.date || 0);
      return itemDate > cutoffDate;
    });

    if (recentData.length !== data.length) {
      localStorage.setItem(key, JSON.stringify(recentData));
      console.log(`Archived ${data.length - recentData.length} old items from ${key}`);
    }
  } catch (error) {
    console.error('Error archiving data:', error);
  }
};

/**
 * 2. Selective Data Storage
 * Only store essential fields to reduce data size
 */

export const optimizeCalculationData = (calculation) => {
  return {
    id: calculation.id,
    timestamp: calculation.timestamp,
    // Only essential inputs
    inputs: {
      policyCount: calculation.inputs?.policies?.length || 0,
      assumptions: calculation.inputs?.assumptions ? {
        discount_rate: calculation.inputs.assumptions.discount_rate,
        mortality_table: calculation.inputs.assumptions.mortality_table,
        confidence_level: calculation.inputs.assumptions.confidence_level
      } : {}
    },
    // Only key results
    results: {
      portfolio_csm: calculation.results?.portfolio_csm,
      execution_time: calculation.results?.execution_time,
      status: calculation.results?.status || 'completed'
    },
    // Remove audit trails, intermediate calculations, etc.
    summary: calculation.summary || 'Calculation completed'
  };
};

/**
 * 3. Compression for Large Objects
 * Use more aggressive compression for large data structures
 */

export const compressLargeObject = (obj) => {
  const jsonString = JSON.stringify(obj);
  
  // Simple compression by removing whitespace and shortening keys
  const compressed = jsonString
    .replace(/\s+/g, ' ') // Remove extra whitespace
    .replace(/"/g, "'") // Use single quotes
    .replace(/([a-zA-Z_][a-zA-Z0-9_]*):/g, (match, key) => {
      // Shorten common keys
      const keyMap = {
        'policy_id': 'pid',
        'face_amount': 'fa',
        'premium': 'pr',
        'issue_age': 'ia',
        'policy_term': 'pt',
        'discount_rate': 'dr',
        'mortality_table': 'mt',
        'confidence_level': 'cl',
        'execution_time': 'et',
        'portfolio_csm': 'csm'
      };
      return (keyMap[key] || key.substring(0, 3)) + ':';
    });

  return compressed;
};

/**
 * 4. Storage Monitoring and Cleanup
 * Monitor storage usage and automatically clean up when needed
 */

export const monitorStorageUsage = () => {
  const storageInfo = {
    totalSize: 0,
    keys: {},
    recommendations: []
  };

  // Calculate total usage
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      const value = localStorage.getItem(key);
      const size = new Blob([value]).size;
      storageInfo.totalSize += size;
      storageInfo.keys[key] = {
        size,
        formattedSize: formatBytes(size),
        itemCount: Array.isArray(JSON.parse(value)) ? JSON.parse(value).length : 1
      };
    }
  }

  // Generate recommendations
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (storageInfo.totalSize > maxSize) {
    storageInfo.recommendations.push('Storage usage exceeds 5MB. Consider clearing old data.');
  }

  // Find largest storage consumers
  const sortedKeys = Object.entries(storageInfo.keys)
    .sort(([,a], [,b]) => b.size - a.size)
    .slice(0, 3);

  if (sortedKeys.length > 0) {
    storageInfo.recommendations.push(
      `Largest storage consumers: ${sortedKeys.map(([key, info]) => 
        `${key} (${info.formattedSize})`
      ).join(', ')}`
    );
  }

  return storageInfo;
};

/**
 * 5. Automatic Cleanup Strategy
 * Automatically clean up storage based on usage patterns
 */

export const autoCleanup = () => {
  const storageInfo = monitorStorageUsage();
  const maxSize = 5 * 1024 * 1024; // 5MB limit

  if (storageInfo.totalSize > maxSize) {
    // Find calculation history keys
    const historyKeys = Object.keys(storageInfo.keys)
      .filter(key => key.startsWith('calculations_'));

    // Reduce history size for each calculator
    historyKeys.forEach(key => {
      try {
        const data = JSON.parse(localStorage.getItem(key) || '[]');
        if (Array.isArray(data) && data.length > 10) {
          // Keep only the 10 most recent calculations
          const recentData = data.slice(0, 10);
          localStorage.setItem(key, JSON.stringify(recentData));
          console.log(`Auto-cleaned ${key}: kept ${recentData.length} of ${data.length} items`);
        }
      } catch (error) {
        console.error(`Error auto-cleaning ${key}:`, error);
      }
    });
  }
};

/**
 * 6. Storage Export/Import for Backup
 * Allow users to export important data before cleanup
 */

export const exportStorageData = (keys = null) => {
  const data = {};
  const keysToExport = keys || Array.from({ length: localStorage.length }, (_, i) => localStorage.key(i));

  keysToExport.forEach(key => {
    if (key) {
      try {
        data[key] = JSON.parse(localStorage.getItem(key));
      } catch (error) {
        console.error(`Error exporting ${key}:`, error);
      }
    }
  });

  const dataStr = JSON.stringify(data, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `valuact_backup_${new Date().toISOString().split('T')[0]}.json`;
  link.click();
  
  URL.revokeObjectURL(url);
};

/**
 * 7. Utility Functions
 */

export const formatBytes = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getStorageQuota = async () => {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    const estimate = await navigator.storage.estimate();
    return {
      used: estimate.usage || 0,
      available: estimate.quota || 0,
      percentage: estimate.quota ? (estimate.usage / estimate.quota) * 100 : 0
    };
  }
  return null;
};

/**
 * 8. Initialize Storage Optimization
 * Call this function when the app starts to set up optimization
 */

export const initializeStorageOptimization = () => {
  // Run auto-cleanup on app start
  autoCleanup();

  // Archive old data
  const historyKeys = Array.from({ length: localStorage.length }, (_, i) => localStorage.key(i))
    .filter(key => key && key.startsWith('calculations_'));
  
  historyKeys.forEach(key => archiveOldData(key));

  // Set up periodic cleanup (every hour)
  setInterval(() => {
    autoCleanup();
  }, 60 * 60 * 1000);

  console.log('Storage optimization initialized');
};
