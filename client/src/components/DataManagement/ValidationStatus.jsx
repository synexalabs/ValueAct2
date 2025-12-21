"use client";

"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, 
  AlertCircle, 
  XCircle, 
  ChevronDown, 
  ChevronUp, 
  Download,
  Filter,
  Search
} from 'lucide-react';

/**
 * ValidationStatus Component
 * Displays validation results with expandable error details
 */
const ValidationStatus = ({ 
  validationResults, 
  completeValidation, 
  onDownloadReport,
  className = '' 
}) => {
  const [expandedSections, setExpandedSections] = useState({});
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const getOverallStatus = () => {
    if (!completeValidation) return { status: 'unknown', color: 'gray', icon: AlertCircle };
    
    if (completeValidation.isValid) {
      return { status: 'valid', color: 'green', icon: CheckCircle };
    } else if (completeValidation.errors.some(e => e.severity === 'error')) {
      return { status: 'error', color: 'red', icon: XCircle };
    } else {
      return { status: 'warning', color: 'yellow', icon: AlertCircle };
    }
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'error':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'info':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'error':
        return <XCircle className="h-4 w-4" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4" />;
      case 'info':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const filterIssues = (issues) => {
    let filtered = issues;
    
    // Filter by severity
    if (filterSeverity !== 'all') {
      filtered = filtered.filter(issue => issue.severity === filterSeverity);
    }
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(issue => 
        issue.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issue.field.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  };

  const generateReport = () => {
    if (!completeValidation) return null;
    
    const report = {
      timestamp: new Date().toISOString(),
      overallStatus: getOverallStatus().status,
      summary: {
        totalErrors: completeValidation.errors.length,
        totalWarnings: completeValidation.warnings.length,
        errorCount: completeValidation.errors.filter(e => e.severity === 'error').length,
        warningCount: completeValidation.errors.filter(e => e.severity === 'warning').length
      },
      details: completeValidation.errors.map(error => ({
        file: error.file || 'Unknown',
        row: error.row || 0,
        field: error.field || 'Unknown',
        message: error.message,
        severity: error.severity
      }))
    };
    
    return report;
  };

  const downloadReport = () => {
    const report = generateReport();
    if (!report) return;
    
    const csvContent = [
      ['File', 'Row', 'Field', 'Message', 'Severity'],
      ...report.details.map(detail => [
        detail.file,
        detail.row,
        detail.field,
        `"${detail.message}"`,
        detail.severity
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `validation-report-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    if (onDownloadReport) {
      onDownloadReport(report);
    }
  };

  const overallStatus = getOverallStatus();
  const StatusIcon = overallStatus.icon;

  if (!validationResults && !completeValidation) {
    return (
      <div className={`p-6 bg-gray-50 border border-gray-200 rounded-lg ${className}`}>
        <div className="flex items-center space-x-2 text-gray-600">
          <AlertCircle className="h-5 w-5" />
          <span>No validation results available</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Overall Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-6 rounded-lg border-2 ${
          overallStatus.color === 'green' ? 'border-green-200 bg-green-50' :
          overallStatus.color === 'red' ? 'border-red-200 bg-red-50' :
          overallStatus.color === 'yellow' ? 'border-yellow-200 bg-yellow-50' :
          'border-gray-200 bg-gray-50'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <StatusIcon className={`h-8 w-8 ${
              overallStatus.color === 'green' ? 'text-green-600' :
              overallStatus.color === 'red' ? 'text-red-600' :
              overallStatus.color === 'yellow' ? 'text-yellow-600' :
              'text-gray-600'
            }`} />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {overallStatus.status === 'valid' ? 'Validation Successful' :
                 overallStatus.status === 'error' ? 'Validation Failed' :
                 overallStatus.status === 'warning' ? 'Validation Warnings' :
                 'Validation Status'}
              </h3>
              <p className="text-sm text-gray-600">
                {completeValidation ? 
                  `${completeValidation.errors.length} issues found` :
                  'Validation in progress...'
                }
              </p>
            </div>
          </div>
          
          {completeValidation && (
            <button
              onClick={downloadReport}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Download Report</span>
            </button>
          )}
        </div>
      </motion.div>

      {/* Validation Results by File Type */}
      {validationResults && (
        <div className="space-y-3">
          {Object.entries(validationResults).map(([fileType, result]) => {
            const isExpanded = expandedSections[fileType];
            const hasIssues = result.errors.length > 0 || result.warnings.length > 0;
            
            return (
              <motion.div
                key={fileType}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-gray-200 rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => toggleSection(fileType)}
                  className="w-full p-4 text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {result.isValid ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                      <div>
                        <h4 className="font-medium text-gray-900 capitalize">
                          {fileType} Data
                        </h4>
                        <p className="text-sm text-gray-600">
                          {result.stats.validRows}/{result.stats.totalRows} rows valid
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {hasIssues && (
                        <span className="text-sm text-gray-500">
                          {result.errors.length} issue{result.errors.length !== 1 ? 's' : ''}
                        </span>
                      )}
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-gray-400" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                  </div>
                </button>
                
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border-t border-gray-200"
                    >
                      <div className="p-4 space-y-3">
                        {/* Statistics */}
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div className="text-center">
                            <div className="font-medium text-gray-900">{result.stats.totalRows}</div>
                            <div className="text-gray-600">Total Rows</div>
                          </div>
                          <div className="text-center">
                            <div className="font-medium text-green-600">{result.stats.validRows}</div>
                            <div className="text-gray-600">Valid</div>
                          </div>
                          <div className="text-center">
                            <div className="font-medium text-red-600">{result.stats.errorRows}</div>
                            <div className="text-gray-600">Errors</div>
                          </div>
                        </div>
                        
                        {/* Issues */}
                        {hasIssues && (
                          <div className="space-y-2">
                            <h5 className="font-medium text-gray-900">Issues Found:</h5>
                            {filterIssues(result.errors).map((error, index) => (
                              <div
                                key={index}
                                className={`p-3 rounded-lg border ${getSeverityColor(error.severity)}`}
                              >
                                <div className="flex items-start space-x-2">
                                  {getSeverityIcon(error.severity)}
                                  <div className="flex-1">
                                    <div className="flex items-center space-x-2 text-sm">
                                      <span className="font-medium">Row {error.row}</span>
                                      {error.field && (
                                        <>
                                          <span className="text-gray-400">•</span>
                                          <span className="font-medium">{error.field}</span>
                                        </>
                                      )}
                                    </div>
                                    <p className="text-sm mt-1">{error.message}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Filters and Search */}
      {completeValidation && completeValidation.errors.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-gray-200 rounded-lg p-4"
        >
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value)}
                className="text-sm border border-gray-300 rounded px-2 py-1"
              >
                <option value="all">All Issues</option>
                <option value="error">Errors Only</option>
                <option value="warning">Warnings Only</option>
                <option value="info">Info Only</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-2 flex-1">
              <Search className="h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search issues..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 text-sm border border-gray-300 rounded px-2 py-1"
              />
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ValidationStatus;
