'use client';

/**
 * Storage Management Component
 * Provides UI for monitoring and managing local storage usage
 */

import React, { useState, useEffect } from 'react';
import { Trash2, Download, AlertTriangle, HardDrive, Database } from 'lucide-react';

const StorageManager = () => {
  const [storageInfo, setStorageInfo] = useState({});
  const [totalUsage, setTotalUsage] = useState(0);

  useEffect(() => {
    calculateStorageUsage();
  }, []);

  const calculateStorageUsage = () => {
    const info = {};
    let total = 0;

    // Check all localStorage keys
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const value = localStorage.getItem(key);
        const size = new Blob([value]).size;
        info[key] = {
          size,
          formattedSize: formatBytes(size),
          itemCount: Array.isArray(JSON.parse(value)) ? JSON.parse(value).length : 1
        };
        total += size;
      }
    }

    setStorageInfo(info);
    setTotalUsage(total);
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const clearStorage = (key) => {
    if (key) {
      localStorage.removeItem(key);
    } else {
      localStorage.clear();
    }
    calculateStorageUsage();
  };

  const exportStorage = () => {
    const data = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        data[key] = JSON.parse(localStorage.getItem(key));
      }
    }

    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `valuact_storage_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getStoragePercentage = () => {
    // Assume 10MB limit (typical browser limit)
    const limit = 10 * 1024 * 1024;
    return Math.min((totalUsage / limit) * 100, 100);
  };

  const isStorageNearLimit = () => {
    return getStoragePercentage() > 80;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <HardDrive className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Storage Management</h3>
        </div>
        {isStorageNearLimit() && (
          <div className="flex items-center space-x-1 text-orange-600">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm font-medium">Storage Near Limit</span>
          </div>
        )}
      </div>

      {/* Storage Usage Overview */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Total Usage</span>
          <span className="text-sm font-medium text-gray-900">
            {formatBytes(totalUsage)} / 10 MB
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${isStorageNearLimit() ? 'bg-orange-500' : 'bg-blue-500'
              }`}
            style={{ width: `${getStoragePercentage()}%` }}
          ></div>
        </div>
        <div className="text-xs text-gray-500 mt-1">
          {getStoragePercentage().toFixed(1)}% used
        </div>
      </div>

      {/* Storage Breakdown */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-700">Storage Breakdown</h4>
        {Object.entries(storageInfo).map(([key, info]) => (
          <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <Database className="h-4 w-4 text-gray-500" />
              <div>
                <div className="text-sm font-medium text-gray-900">
                  {key.replace('calculations_', '').replace('templates_', '')}
                </div>
                <div className="text-xs text-gray-500">
                  {info.itemCount} items
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">{info.formattedSize}</span>
              <button
                onClick={() => clearStorage(key)}
                className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                title="Clear this storage"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex space-x-3 mt-6 pt-4 border-t">
        <button
          onClick={exportStorage}
          className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
        >
          <Download className="h-4 w-4" />
          <span>Export All Data</span>
        </button>
        <button
          onClick={() => clearStorage()}
          className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
        >
          <Trash2 className="h-4 w-4" />
          <span>Clear All Storage</span>
        </button>
        <button
          onClick={calculateStorageUsage}
          className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
        >
          Refresh
        </button>
      </div>

      {/* Storage Tips */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h5 className="text-sm font-medium text-blue-900 mb-2">Storage Optimization Tips</h5>
        <ul className="text-xs text-blue-800 space-y-1">
          <li>• Calculation history is automatically limited to 25 items per calculator</li>
          <li>• Large audit trails are removed to save space</li>
          <li>• Data is compressed before storage</li>
          <li>• Export important calculations before clearing storage</li>
        </ul>
      </div>
    </div>
  );
};

export default StorageManager;
