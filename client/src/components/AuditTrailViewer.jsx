/**
 * AuditTrailViewer Component
 * Displays complete audit trail for calculations
 */

import React, { useState } from 'react';
import { FileText, Clock, User, CheckCircle, AlertTriangle, Info, Download, Eye, EyeOff } from 'lucide-react';
import { InlineMath, BlockMath } from 'react-katex';
import CalculationStepViewer from './CalculationStepViewer';
import 'katex/dist/katex.min.css';

const AuditTrailViewer = ({
  auditTrail,
  resultValidation,
  title = 'Audit Trail',
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedSections, setExpandedSections] = useState(new Set());
  const [showDetails, setShowDetails] = useState(false);

  const toggleSection = (section) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const handleExport = () => {
    const exportData = {
      auditTrail,
      resultValidation,
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit_trail_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Info },
    { id: 'inputs', label: 'Inputs', icon: FileText },
    { id: 'steps', label: 'Steps', icon: CheckCircle },
    { id: 'formulas', label: 'Formulas', icon: CheckCircle },
    { id: 'assumptions', label: 'Assumptions', icon: Info },
    { id: 'validation', label: 'Validation', icon: AlertTriangle },
    { id: 'warnings', label: 'Warnings', icon: AlertTriangle },
    { id: 'execution', label: 'Execution Log', icon: Clock }
  ];

  const renderOverview = () => {
    const summary = {
      totalSteps: auditTrail.calculationSteps?.length || 0,
      totalIntermediateResults: auditTrail.intermediateResults?.length || 0,
      totalFormulasUsed: auditTrail.formulasUsed?.length || 0,
      totalAssumptionsUsed: auditTrail.assumptionsUsed?.length || 0,
      totalValidationResults: auditTrail.validationResults?.length || 0,
      totalWarnings: auditTrail.warnings?.length || 0,
      methodologyVersion: auditTrail.methodologyVersion || 'Unknown',
      hasValidationIssues: !resultValidation?.passedAll
    };

    return (
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-blue-600" />
              <span className="font-medium text-blue-800">Steps</span>
            </div>
            <div className="text-2xl font-bold text-blue-600 mt-1">{summary.totalSteps}</div>
          </div>
          
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-green-600" />
              <span className="font-medium text-green-800">Formulas</span>
            </div>
            <div className="text-2xl font-bold text-green-600 mt-1">{summary.totalFormulasUsed}</div>
          </div>
          
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <span className="font-medium text-yellow-800">Warnings</span>
            </div>
            <div className="text-2xl font-bold text-yellow-600 mt-1">{summary.totalWarnings}</div>
          </div>
          
          <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <Info className="h-5 w-5 text-purple-600" />
              <span className="font-medium text-purple-800">Assumptions</span>
            </div>
            <div className="text-2xl font-bold text-purple-600 mt-1">{summary.totalAssumptionsUsed}</div>
          </div>
        </div>

        {/* Methodology Info */}
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h4 className="font-semibold text-gray-800 mb-2">Methodology Information</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Version:</span>
              <span className="ml-2 text-gray-600">{summary.methodologyVersion}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Validation Status:</span>
              <span className={`ml-2 px-2 py-1 rounded text-xs ${
                summary.hasValidationIssues ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
              }`}>
                {summary.hasValidationIssues ? 'Issues Found' : 'All Passed'}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="p-4 bg-white border border-gray-200 rounded-lg">
          <h4 className="font-semibold text-gray-800 mb-3">Calculation Statistics</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Total Intermediate Results:</span>
              <span className="ml-2 text-gray-600">{summary.totalIntermediateResults}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Total Validation Checks:</span>
              <span className="ml-2 text-gray-600">{summary.totalValidationResults}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderInputs = () => {
    if (!auditTrail.calculationInputs) return null;

    return (
      <div className="space-y-4">
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h4 className="font-semibold text-gray-800 mb-3">Calculation Inputs</h4>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(auditTrail.calculationInputs).filter(([key]) => key !== 'timestamp').map(([key, value]) => (
              <div key={key} className="flex justify-between">
                <span className="font-medium text-gray-700">{key}:</span>
                <span className="text-gray-600">
                  {typeof value === 'number' ? value.toLocaleString() : value}
                </span>
              </div>
            ))}
          </div>
          {auditTrail.calculationInputs.timestamp && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                <span>Captured: {new Date(auditTrail.calculationInputs.timestamp).toLocaleString()}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderSteps = () => {
    if (!auditTrail.calculationSteps || auditTrail.calculationSteps.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          <CheckCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>No calculation steps recorded</p>
        </div>
      );
    }

    return (
      <CalculationStepViewer
        steps={auditTrail.calculationSteps}
        title="Calculation Steps"
        showIntermediateResults={true}
        showFormulas={true}
        showValidation={true}
      />
    );
  };

  const renderFormulas = () => {
    if (!auditTrail.formulasUsed || auditTrail.formulasUsed.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          <CheckCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>No formulas recorded</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {auditTrail.formulasUsed.map((formula, index) => (
          <div key={index} className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-gray-800">{formula.name}</h4>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                  v{formula.version}
                </span>
                <span className="text-sm text-gray-600">
                  {new Date(formula.usedAt).toLocaleString()}
                </span>
              </div>
            </div>
            
            {formula.latex && (
              <div className="mb-3">
                <BlockMath math={formula.latex} />
              </div>
            )}
            
            <div className="text-sm text-gray-600">
              <div><strong>Formula ID:</strong> {formula.formulaId}</div>
              <div><strong>Used At:</strong> {new Date(formula.usedAt).toLocaleString()}</div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderAssumptions = () => {
    if (!auditTrail.assumptionsUsed || auditTrail.assumptionsUsed.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          <Info className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>No assumptions recorded</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {auditTrail.assumptionsUsed.map((assumption, index) => (
          <div key={index} className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-gray-800">{assumption.name}</h4>
              <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs">
                {assumption.source}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Value:</span>
                <span className="ml-2 text-gray-600">{assumption.value}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Source:</span>
                <span className="ml-2 text-gray-600">{assumption.source}</span>
              </div>
              <div className="col-span-2">
                <span className="font-medium text-gray-700">Justification:</span>
                <span className="ml-2 text-gray-600">{assumption.justification}</span>
              </div>
            </div>
            
            <div className="mt-2 text-xs text-gray-500">
              Used: {new Date(assumption.usedAt).toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderValidation = () => {
    if (!resultValidation) {
      return (
        <div className="text-center py-8 text-gray-500">
          <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>No validation results available</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Overall Status */}
        <div className={`p-4 rounded-lg border ${
          resultValidation.passedAll ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-center space-x-2">
            {resultValidation.passedAll ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-red-600" />
            )}
            <span className={`font-semibold ${
              resultValidation.passedAll ? 'text-green-800' : 'text-red-800'
            }`}>
              {resultValidation.passedAll ? 'All Validations Passed' : 'Validation Issues Found'}
            </span>
          </div>
        </div>

        {/* Range Checks */}
        {resultValidation.rangeChecks && resultValidation.rangeChecks.length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-800 mb-3">Range Checks</h4>
            <div className="space-y-2">
              {resultValidation.rangeChecks.map((check, index) => (
                <div key={index} className={`p-3 rounded-lg border ${
                  check.passed ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-800">{check.variable}</span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      check.passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {check.passed ? 'Passed' : 'Failed'}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    Value: {check.value} (Range: {check.minValue} - {check.maxValue})
                  </div>
                  {check.message && (
                    <div className="text-sm text-gray-700 mt-1">{check.message}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Consistency Checks */}
        {resultValidation.consistencyChecks && resultValidation.consistencyChecks.length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-800 mb-3">Consistency Checks</h4>
            <div className="space-y-2">
              {resultValidation.consistencyChecks.map((check, index) => (
                <div key={index} className={`p-3 rounded-lg border ${
                  check.passed ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-800">{check.checkName}</span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      check.passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {check.passed ? 'Passed' : 'Failed'}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">{check.description}</div>
                  {check.message && (
                    <div className="text-sm text-gray-700 mt-1">{check.message}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reasonableness Tests */}
        {resultValidation.reasonablenessTests && resultValidation.reasonablenessTests.length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-800 mb-3">Reasonableness Tests</h4>
            <div className="space-y-2">
              {resultValidation.reasonablenessTests.map((test, index) => (
                <div key={index} className={`p-3 rounded-lg border ${
                  test.passed ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-800">{test.testName}</span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      test.passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {test.passed ? 'Passed' : 'Failed'}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">{test.description}</div>
                  <div className="text-sm text-gray-600 mt-1">
                    Actual: {test.actualValue} | Benchmark: {test.benchmark}
                  </div>
                  {test.message && (
                    <div className="text-sm text-gray-700 mt-1">{test.message}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderWarnings = () => {
    if (!auditTrail.warnings || auditTrail.warnings.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>No warnings recorded</p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {auditTrail.warnings.map((warning, index) => (
          <div key={index} className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-yellow-800">{warning.category}</span>
                  <span className="text-xs text-yellow-600">
                    {new Date(warning.timestamp).toLocaleString()}
                  </span>
                </div>
                <p className="text-yellow-700 mt-1">{warning.message}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderExecutionLog = () => {
    if (!auditTrail.executionLog || auditTrail.executionLog.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>No execution log available</p>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {auditTrail.executionLog.map((log, index) => (
          <div key={index} className={`p-3 rounded-lg border ${
            log.level === 'error' ? 'bg-red-50 border-red-200' :
            log.level === 'warning' ? 'bg-yellow-50 border-yellow-200' :
            log.level === 'info' ? 'bg-blue-50 border-blue-200' :
            'bg-gray-50 border-gray-200'
          }`}>
            <div className="flex items-start space-x-2">
              <Clock className="h-4 w-4 text-gray-600 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className={`font-medium ${
                    log.level === 'error' ? 'text-red-800' :
                    log.level === 'warning' ? 'text-yellow-800' :
                    log.level === 'info' ? 'text-blue-800' :
                    'text-gray-800'
                  }`}>
                    {log.level.toUpperCase()}
                  </span>
                  <span className="text-xs text-gray-600">
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>
                <p className={`mt-1 ${
                  log.level === 'error' ? 'text-red-700' :
                  log.level === 'warning' ? 'text-yellow-700' :
                  log.level === 'info' ? 'text-blue-700' :
                  'text-gray-700'
                }`}>
                  {log.message}
                </p>
                {log.data && (
                  <div className="mt-2 text-xs text-gray-600">
                    <pre className="bg-white p-2 rounded border overflow-x-auto">
                      {JSON.stringify(log.data, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (!auditTrail) {
    return (
      <div className={`card ${className}`}>
        <div className="text-center py-8 text-gray-500">
          <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>No audit trail data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`card ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-100 p-2 rounded-lg">
            <FileText className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
            <p className="text-sm text-gray-600">Complete calculation audit trail</p>
          </div>
        </div>
        <button
          onClick={handleExport}
          className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Download className="h-4 w-4" />
          <span>Export</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 py-3 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'inputs' && renderInputs()}
      {activeTab === 'steps' && renderSteps()}
      {activeTab === 'formulas' && renderFormulas()}
      {activeTab === 'assumptions' && renderAssumptions()}
      {activeTab === 'validation' && renderValidation()}
      {activeTab === 'warnings' && renderWarnings()}
      {activeTab === 'execution' && renderExecutionLog()}
    </div>
  );
};

export default AuditTrailViewer;
