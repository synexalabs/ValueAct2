const Papa = require('papaparse');
const XLSX = require('xlsx');
const logger = require('../utils/logger');
const { FILE_TYPE_DETECTION } = require('../schemas/termLifeSchema');

/**
 * File Parser Service for CSV and Excel files
 * Handles parsing, file type detection, and data conversion
 */
class FileParser {
  
  /**
   * Detect file type based on filename and headers
   * @param {string} filename - Original filename
   * @param {Array<string>} headers - Column headers
   * @returns {string} Detected file type ('meta', 'assumptions', 'policies', 'actuals')
   */
  detectFileType(filename, headers) {
    const filenameLower = filename.toLowerCase();
    const headersLower = headers.map(h => h.toLowerCase());
    
    // Check each file type
    for (const [type, config] of Object.entries(FILE_TYPE_DETECTION)) {
      // Check filename keywords
      const filenameMatch = config.keywords.some(keyword => 
        filenameLower.includes(keyword.toLowerCase())
      );
      
      // Check required columns
      const columnMatch = config.required_columns.every(requiredCol => 
        headersLower.includes(requiredCol.toLowerCase())
      );
      
      if (filenameMatch || columnMatch) {
        logger.info(`Detected file type: ${type} for file: ${filename}`);
        return type;
      }
    }
    
    // Default fallback based on filename
    if (filenameLower.includes('meta')) return 'meta';
    if (filenameLower.includes('assumption')) return 'assumptions';
    if (filenameLower.includes('policy')) return 'policies';
    if (filenameLower.includes('actual')) return 'actuals';
    
    logger.warn(`Could not detect file type for: ${filename}`);
    return 'unknown';
  }

  /**
   * Parse CSV file buffer
   * @param {Buffer} fileBuffer - CSV file buffer
   * @param {string} filename - Original filename
   * @returns {Promise<object>} Parsed CSV data
   */
  async parseCSV(fileBuffer, filename) {
    return new Promise((resolve, reject) => {
      const csvString = fileBuffer.toString('utf8');
      
      Papa.parse(csvString, {
        header: true,
        skipEmptyLines: true,
        trimHeaders: true,
        complete: (results) => {
          if (results.errors.length > 0) {
            const error = results.errors[0];
            logger.error(`CSV parsing error for ${filename}:`, error);
            reject(new Error(`CSV parsing error: ${error.message}`));
            return;
          }
          
          const fileType = this.detectFileType(filename, results.meta.fields);
          
          resolve({
            filename,
            fileType,
            data: results.data,
            columns: results.meta.fields,
            rowCount: results.data.length,
            parseErrors: results.errors
          });
        },
        error: (error) => {
          logger.error(`CSV parsing failed for ${filename}:`, error);
          reject(new Error(`Failed to parse CSV: ${error.message}`));
        }
      });
    });
  }

  /**
   * Parse Excel file buffer
   * @param {Buffer} fileBuffer - Excel file buffer
   * @param {string} filename - Original filename
   * @returns {Promise<object>} Parsed Excel data
   */
  async parseExcel(fileBuffer, filename) {
    try {
      const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0]; // Use first sheet
      const worksheet = workbook.Sheets[sheetName];
      
      // Convert to JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
        header: 1,
        defval: '',
        blankrows: false
      });
      
      if (jsonData.length === 0) {
        throw new Error('Excel file is empty');
      }
      
      // Extract headers and data
      const headers = jsonData[0].map(h => String(h).trim());
      const data = jsonData.slice(1).map(row => {
        const obj = {};
        headers.forEach((header, index) => {
          obj[header] = row[index] || '';
        });
        return obj;
      }).filter(row => Object.values(row).some(val => val !== ''));
      
      const fileType = this.detectFileType(filename, headers);
      
      logger.info(`Parsed Excel file: ${filename}, ${data.length} rows, ${headers.length} columns`);
      
      return {
        filename,
        fileType,
        data,
        columns: headers,
        rowCount: data.length,
        parseErrors: []
      };
      
    } catch (error) {
      logger.error(`Excel parsing failed for ${filename}:`, error);
      throw new Error(`Failed to parse Excel file: ${error.message}`);
    }
  }

  /**
   * Parse file based on extension
   * @param {Buffer} fileBuffer - File buffer
   * @param {string} filename - Original filename
   * @returns {Promise<object>} Parsed file data
   */
  async parseFile(fileBuffer, filename) {
    const extension = filename.toLowerCase().split('.').pop();
    
    switch (extension) {
      case 'csv':
        return await this.parseCSV(fileBuffer, filename);
      case 'xlsx':
      case 'xls':
        return await this.parseExcel(fileBuffer, filename);
      default:
        throw new Error(`Unsupported file type: ${extension}`);
    }
  }

  /**
   * Parse multiple files
   * @param {Array<{buffer: Buffer, filename: string}>} files - Array of file objects
   * @returns {Promise<object>} Parsed files organized by type
   */
  async parseFiles(files) {
    const results = {
      meta: null,
      assumptions: null,
      policies: null,
      actuals: null,
      errors: []
    };

    for (const file of files) {
      try {
        const parsed = await this.parseFile(file.buffer, file.filename);
        
        // Store by detected type
        if (parsed.fileType !== 'unknown') {
          results[parsed.fileType] = parsed;
        } else {
          results.errors.push({
            filename: file.filename,
            error: 'Could not detect file type'
          });
        }
      } catch (error) {
        results.errors.push({
          filename: file.filename,
          error: error.message
        });
      }
    }

    return results;
  }

  /**
   * Validate file structure
   * @param {object} parsedFile - Parsed file data
   * @returns {object} Validation result
   */
  validateFileStructure(parsedFile) {
    const { filename, fileType, columns } = parsedFile;
    const errors = [];
    const warnings = [];

    if (fileType === 'unknown') {
      errors.push('Could not detect file type');
      return { isValid: false, errors, warnings };
    }

    // Check required columns for detected type
    const requiredColumns = FILE_TYPE_DETECTION[fileType]?.required_columns || [];
    const missingColumns = requiredColumns.filter(col => 
      !columns.some(header => header.toLowerCase() === col.toLowerCase())
    );

    if (missingColumns.length > 0) {
      errors.push(`Missing required columns: ${missingColumns.join(', ')}`);
    }

    // Check for empty file
    if (parsedFile.rowCount === 0) {
      errors.push('File contains no data rows');
    }

    // Check for reasonable number of columns
    if (columns.length > 50) {
      warnings.push('File has many columns - consider splitting data');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      fileType,
      filename
    };
  }

  /**
   * Get file type description
   * @param {string} fileType - File type
   * @returns {string} Description
   */
  getFileTypeDescription(fileType) {
    const descriptions = {
      meta: 'Run metadata and configuration',
      assumptions: 'Economic and actuarial assumptions',
      policies: 'Policy master data',
      actuals: 'Historical cash flows and transactions'
    };
    return descriptions[fileType] || 'Unknown file type';
  }
}

module.exports = new FileParser();
