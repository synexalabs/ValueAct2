/**
 * Local Storage Compression Utilities
 * Compresses large data objects before storing to reduce storage usage
 */

/**
 * Simple compression using JSON stringify with data reduction
 * @param {Object} data - Data to compress
 * @returns {string} Compressed data string
 */
export const compressData = (data) => {
  try {
    // Remove unnecessary fields and compress
    const compressed = JSON.stringify(data, (key, value) => {
      // Remove empty arrays and objects
      if (Array.isArray(value) && value.length === 0) return undefined;
      if (typeof value === 'object' && value !== null && Object.keys(value).length === 0) return undefined;
      
      // Remove null/undefined values
      if (value === null || value === undefined) return undefined;
      
      // Compress timestamps to shorter format
      if (key === 'timestamp' && typeof value === 'string') {
        return new Date(value).getTime(); // Store as timestamp number
      }
      
      return value;
    });
    
    return compressed;
  } catch (error) {
    console.error('Compression error:', error);
    return JSON.stringify(data);
  }
};

/**
 * Decompress data from storage
 * @param {string} compressedData - Compressed data string
 * @returns {Object} Decompressed data
 */
export const decompressData = (compressedData) => {
  try {
    const data = JSON.parse(compressedData);
    
    // Restore timestamps
    const restoreTimestamps = (obj) => {
      if (typeof obj === 'object' && obj !== null) {
        if (Array.isArray(obj)) {
          return obj.map(restoreTimestamps);
        } else {
          const restored = {};
          for (const [key, value] of Object.entries(obj)) {
            if (key === 'timestamp' && typeof value === 'number') {
              restored[key] = new Date(value).toISOString();
            } else {
              restored[key] = restoreTimestamps(value);
            }
          }
          return restored;
        }
      }
      return obj;
    };
    
    return restoreTimestamps(data);
  } catch (error) {
    console.error('Decompression error:', error);
    return null;
  }
};

/**
 * Calculate storage size in bytes
 * @param {Object} data - Data to measure
 * @returns {number} Size in bytes
 */
export const getStorageSize = (data) => {
  return new Blob([JSON.stringify(data)]).size;
};

/**
 * Format bytes to human readable format
 * @param {number} bytes - Bytes to format
 * @returns {string} Formatted size string
 */
export const formatBytes = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
