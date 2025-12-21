"use client";

"use client";

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, FileText, CheckCircle, AlertCircle, Download } from 'lucide-react';

/**
 * Enhanced FileUploader Component for Data Management
 * Supports multi-file drag-and-drop with file type detection
 */
const FileUploader = ({ onFilesChange, className = '' }) => {
  const [files, setFiles] = useState([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fileTypes = {
    meta: {
      name: 'Metadata',
      description: 'Run metadata and configuration',
      required: true,
      icon: '📋',
      acceptedTypes: ['.csv', '.xlsx'],
      template: '/templates/meta_template.csv'
    },
    assumptions: {
      name: 'Assumptions',
      description: 'Economic and actuarial assumptions',
      required: true,
      icon: '📊',
      acceptedTypes: ['.csv', '.xlsx'],
      template: '/templates/assumptions_template.csv'
    },
    policies: {
      name: 'Policies',
      description: 'Policy master data',
      required: true,
      icon: '📄',
      acceptedTypes: ['.csv', '.xlsx'],
      template: '/templates/policies_template.csv'
    },
    actuals: {
      name: 'Actuals',
      description: 'Historical cash flows and transactions',
      required: false,
      icon: '💰',
      acceptedTypes: ['.csv', '.xlsx'],
      template: '/templates/actuals_template.csv'
    }
  };

  const detectFileType = useCallback((filename, headers = []) => {
    const filenameLower = filename.toLowerCase();
    
    // Check filename keywords
    if (filenameLower.includes('meta') || filenameLower.includes('metadata')) return 'meta';
    if (filenameLower.includes('assumption')) return 'assumptions';
    if (filenameLower.includes('policy')) return 'policies';
    if (filenameLower.includes('actual')) return 'actuals';
    
    // Check headers for required columns
    const headersLower = headers.map(h => h.toLowerCase());
    
    if (headersLower.includes('run_id') && headersLower.includes('user_id')) return 'meta';
    if (headersLower.includes('category') && headersLower.includes('parameter')) return 'assumptions';
    if (headersLower.includes('policy_id') && headersLower.includes('issue_age')) return 'policies';
    if (headersLower.includes('policy_id') && headersLower.includes('period')) return 'actuals';
    
    return 'unknown';
  }, []);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileSelect = useCallback((selectedFiles) => {
    const newFiles = Array.from(selectedFiles).map(file => {
      const fileType = detectFileType(file.name);
      return {
        id: Date.now() + Math.random(),
        file,
        name: file.name,
        size: file.size,
        type: fileType,
        status: 'ready',
        progress: 0
      };
    });

    setFiles(prevFiles => {
      const updatedFiles = [...prevFiles];
      
      newFiles.forEach(newFile => {
        // Check if file type already exists
        const existingIndex = updatedFiles.findIndex(f => f.type === newFile.type);
        
        if (existingIndex >= 0) {
          // Replace existing file of same type
          updatedFiles[existingIndex] = newFile;
        } else {
          // Add new file
          updatedFiles.push(newFile);
        }
      });
      
      return updatedFiles;
    });

    onFilesChange(files);
  }, [detectFileType, onFilesChange]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      handleFileSelect(droppedFiles);
    }
  }, [handleFileSelect]);

  const removeFile = useCallback((fileId) => {
    setFiles(prevFiles => {
      const updatedFiles = prevFiles.filter(f => f.id !== fileId);
      onFilesChange(updatedFiles);
      return updatedFiles;
    });
  }, [onFilesChange]);

  const downloadTemplate = useCallback((fileType) => {
    const template = fileTypes[fileType];
    if (template?.template) {
      const link = document.createElement('a');
      link.href = template.template;
      link.download = template.template.split('/').pop();
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }, [fileTypes]);

  const getFileTypeInfo = (fileType) => {
    return fileTypes[fileType] || {
      name: 'Unknown',
      description: 'Unknown file type',
      required: false,
      icon: '❓'
    };
  };

  const getFileStatusIcon = (status) => {
    switch (status) {
      case 'ready':
        return <FileText className="h-4 w-4 text-blue-500" />;
      case 'uploading':
        return <Upload className="h-4 w-4 text-yellow-500 animate-spin" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const requiredFiles = Object.keys(fileTypes).filter(type => fileTypes[type].required);
  const uploadedRequiredFiles = files.filter(f => requiredFiles.includes(f.type));
  const allRequiredUploaded = uploadedRequiredFiles.length === requiredFiles.length;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* File Type Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(fileTypes).map(([type, info]) => {
          const uploadedFile = files.find(f => f.type === type);
          const isUploaded = !!uploadedFile;
          
          return (
            <motion.div
              key={type}
              className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                isUploaded 
                  ? 'border-green-200 bg-green-50' 
                  : info.required 
                    ? 'border-red-200 bg-red-50' 
                    : 'border-gray-200 bg-gray-50'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{info.icon}</span>
                  <div>
                    <h3 className="font-medium text-gray-900">{info.name}</h3>
                    {info.required && (
                      <span className="text-xs text-red-600 font-medium">Required</span>
                    )}
                  </div>
                </div>
                {isUploaded && (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                )}
              </div>
              
              <p className="text-sm text-gray-600 mb-3">{info.description}</p>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => downloadTemplate(type)}
                  className="flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <Download className="h-3 w-3" />
                  <span>Template</span>
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Upload Area */}
      <motion.div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
          isDragOver
            ? 'border-blue-400 bg-blue-50'
            : allRequiredUploaded
              ? 'border-green-400 bg-green-50'
              : 'border-gray-300 bg-gray-50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        whileHover={{ scale: 1.01 }}
      >
        <input
          type="file"
          multiple
          accept=".csv,.xlsx,.xls"
          onChange={(e) => handleFileSelect(e.target.files)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        <motion.div
          animate={{ scale: isDragOver ? 1.1 : 1 }}
          transition={{ duration: 0.2 }}
        >
          <Upload className={`h-12 w-12 mx-auto mb-4 ${
            isDragOver ? 'text-blue-500' : 'text-gray-400'
          }`} />
        </motion.div>
        
        <div className="space-y-2">
          <h3 className="text-lg font-medium text-gray-900">
            {isDragOver ? 'Drop files here' : 'Upload your data files'}
          </h3>
          <p className="text-sm text-gray-600">
            Drag and drop your CSV or Excel files, or click to browse
          </p>
          <p className="text-xs text-gray-500">
            Accepted formats: CSV, XLSX, XLS
          </p>
        </div>
        
        {allRequiredUploaded && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 flex items-center justify-center space-x-2 text-green-600"
          >
            <CheckCircle className="h-5 w-5" />
            <span className="text-sm font-medium">All required files uploaded!</span>
          </motion.div>
        )}
      </motion.div>

      {/* Uploaded Files */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3"
          >
            <h3 className="text-lg font-medium text-gray-900">Uploaded Files</h3>
            
            {files.map((file) => {
              const typeInfo = getFileTypeInfo(file.type);
              
              return (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg shadow-sm"
                >
                  <div className="flex items-center space-x-3">
                    {getFileStatusIcon(file.status)}
                    <div>
                      <p className="font-medium text-gray-900">{file.name}</p>
                      <p className="text-sm text-gray-600">
                        {typeInfo.name} • {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {file.status === 'uploading' && (
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${file.progress}%` }}
                        />
                      </div>
                    )}
                    
                    <button
                      onClick={() => removeFile(file.id)}
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload Summary */}
      {files.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-blue-50 border border-blue-200 rounded-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-blue-900">
                Upload Summary
              </h4>
              <p className="text-sm text-blue-700">
                {files.length} file{files.length !== 1 ? 's' : ''} uploaded
                {allRequiredUploaded ? ' • All required files present' : ''}
              </p>
            </div>
            
            <div className="text-right">
              <p className="text-sm font-medium text-blue-900">
                {uploadedRequiredFiles.length}/{requiredFiles.length} required
              </p>
              <div className="w-20 bg-blue-200 rounded-full h-2 mt-1">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(uploadedRequiredFiles.length / requiredFiles.length) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default FileUploader;
