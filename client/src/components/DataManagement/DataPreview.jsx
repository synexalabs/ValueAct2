"use client";

"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Eye,
  Download,
  Edit,
  Save,
  X,
  FileText,
  BarChart3,
  Database
} from 'lucide-react';

/**
 * DataPreview Component
 * Displays preview of uploaded data with tabbed interface
 */
const DataPreview = ({
  parsedFiles,
  onMetadataEdit,
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState('meta');
  const [editingMetadata, setEditingMetadata] = useState(false);
  const [metadataForm, setMetadataForm] = useState({});

  const tabs = [
    { id: 'meta', name: 'Metadata', icon: FileText, required: true },
    { id: 'assumptions', name: 'Assumptions', icon: BarChart3, required: true },
    { id: 'policies', name: 'Policies', icon: Database, required: true },
    { id: 'actuals', name: 'Actuals', icon: Database, required: false }
  ];

  const getTabData = (tabId) => {
    return parsedFiles?.[tabId] || null;
  };

  const getTabStats = (data) => {
    if (!data) return { rows: 0, columns: 0 };
    return {
      rows: data.rowCount || 0,
      columns: data.columns?.length || 0
    };
  };

  const formatValue = (value, column) => {
    if (value === null || value === undefined || value === '') {
      return <span className="text-gray-400 italic">—</span>;
    }

    // Format based on column name
    if (column.toLowerCase().includes('date')) {
      return new Date(value).toLocaleDateString();
    }

    if (column.toLowerCase().includes('amount') ||
      column.toLowerCase().includes('premium') ||
      column.toLowerCase().includes('sum_assured')) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(value);
    }

    if (column.toLowerCase().includes('ratio') ||
      column.toLowerCase().includes('rate') ||
      column.toLowerCase().includes('factor')) {
      return `${(value * 100).toFixed(2)}%`;
    }

    return String(value);
  };

  const startEditingMetadata = () => {
    const metaData = getTabData('meta');
    if (metaData && metaData.data && metaData.data.length > 0) {
      setMetadataForm(metaData.data[0]);
    } else {
      setMetadataForm({
        run_id: '',
        user_id: 'user_123',
        version: '1.0',
        scenario: 'base',
        product_type: 'TermLife',
        description: '',
        valuation_date: new Date().toISOString().split('T')[0]
      });
    }
    setEditingMetadata(true);
  };

  const saveMetadata = () => {
    if (onMetadataEdit) {
      onMetadataEdit(metadataForm);
    }
    setEditingMetadata(false);
  };

  const cancelEditing = () => {
    setEditingMetadata(false);
    setMetadataForm({});
  };

  const downloadData = (tabId) => {
    const data = getTabData(tabId);
    if (!data) return;

    // Convert to CSV
    const headers = data.columns.join(',');
    const rows = data.data.map(row =>
      data.columns.map(col => {
        const value = row[col] || '';
        return `"${String(value).replace(/"/g, '""')}"`;
      }).join(',')
    );

    const csvContent = [headers, ...rows].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${tabId}_data.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const renderTable = (data) => {
    if (!data || !data.data || data.data.length === 0) {
      return (
        <div className="text-center py-12 text-gray-500">
          <Database className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>No data available</p>
        </div>
      );
    }

    const displayData = data.data.slice(0, 10); // Show first 10 rows
    const hasMore = data.data.length > 10;

    return (
      <div className="space-y-4">
        {/* Table */}
        <div className="overflow-x-auto border border-gray-100 rounded-2xl shadow-sm">
          <table className="min-w-full divide-y divide-gray-50">
            <thead className="bg-gray-50/50">
              <tr>
                {data.columns.map((column, index) => (
                  <th
                    key={index}
                    className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap"
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-50">
              {displayData.map((row, rowIndex) => (
                <tr key={rowIndex} className="hover:bg-trust-50/30 transition-colors">
                  {data.columns.map((column, colIndex) => (
                    <td
                      key={colIndex}
                      className="px-6 py-4 text-sm font-medium text-gray-700 whitespace-nowrap"
                    >
                      {formatValue(row[column], column)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* More data indicator */}
        {hasMore && (
          <div className="text-center text-sm text-gray-500">
            Showing first 10 rows of {data.data.length} total rows
          </div>
        )}
      </div>
    );
  };

  const renderMetadataForm = () => {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Run ID
            </label>
            <input
              type="text"
              value={metadataForm.run_id || ''}
              onChange={(e) => setMetadataForm(prev => ({ ...prev, run_id: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="run_20250125_001"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              User ID
            </label>
            <input
              type="text"
              value={metadataForm.user_id || ''}
              onChange={(e) => setMetadataForm(prev => ({ ...prev, user_id: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Version
            </label>
            <input
              type="text"
              value={metadataForm.version || ''}
              onChange={(e) => setMetadataForm(prev => ({ ...prev, version: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Scenario
            </label>
            <select
              value={metadataForm.scenario || ''}
              onChange={(e) => setMetadataForm(prev => ({ ...prev, scenario: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="base">Base</option>
              <option value="optimistic">Optimistic</option>
              <option value="pessimistic">Pessimistic</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Valuation Date
            </label>
            <input
              type="date"
              value={metadataForm.valuation_date || ''}
              onChange={(e) => setMetadataForm(prev => ({ ...prev, valuation_date: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={metadataForm.description || ''}
              onChange={(e) => setMetadataForm(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Description of this valuation run..."
            />
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <button
            onClick={cancelEditing}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={saveMetadata}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-lg overflow-hidden ${className}`}>
      {/* Tab Navigation */}
      <div className="border-b border-gray-100 bg-gray-50/30 px-6 pt-2">
        <nav className="flex space-x-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const data = getTabData(tab.id);
            const stats = getTabStats(data);
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-4 text-sm font-bold transition-all relative ${isActive
                    ? 'text-trust-900 before:absolute before:bottom-0 before:left-0 before:right-0 before:h-1 before:bg-trust-900 before:rounded-t-full'
                    : 'text-gray-400 hover:text-trust-600'
                  }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-trust-900' : 'text-gray-300'}`} />
                <span>{tab.name}</span>
                {data && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${isActive ? 'bg-trust-100 text-trust-600' : 'bg-gray-100 text-gray-400'}`}>
                    {stats.rows}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {tabs.map((tab) => {
          const data = getTabData(tab.id);
          const stats = getTabStats(data);

          if (activeTab !== tab.id) return null;

          return (
            <motion.div
              key={tab.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {tab.name} Data
                  </h3>
                  <p className="text-sm text-gray-600">
                    {stats.rows} rows • {stats.columns} columns
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  {tab.id === 'meta' && !editingMetadata && (
                    <button
                      onClick={startEditingMetadata}
                      className="flex items-center space-x-1 px-3 py-2 text-sm text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                      <span>Edit</span>
                    </button>
                  )}

                  {data && (
                    <button
                      onClick={() => downloadData(tab.id)}
                      className="flex items-center space-x-1 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      <Download className="h-4 w-4" />
                      <span>Download</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Content */}
              {tab.id === 'meta' && editingMetadata ? (
                renderMetadataForm()
              ) : (
                renderTable(data)
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default DataPreview;
