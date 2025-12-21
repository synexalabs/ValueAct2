/**
 * FormulaExplainer Component
 * Interactive formula component with variable definitions and explanations
 */

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Info, BookOpen, Calculator, AlertCircle, CheckCircle } from 'lucide-react';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

const FormulaExplainer = ({
  formula,
  variables = [],
  description = '',
  examples = [],
  conditions = [],
  validationRules = [],
  version = '1.0.0',
  lastUpdated = null,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedVariable, setSelectedVariable] = useState(null);
  const [showValidation, setShowValidation] = useState(false);

  const handleVariableClick = (variable) => {
    setSelectedVariable(selectedVariable?.symbol === variable.symbol ? null : variable);
  };

  const renderVariable = (variable) => {
    const isSelected = selectedVariable?.symbol === variable.symbol;
    
    return (
      <span
        key={variable.symbol}
        className={`inline-block px-2 py-1 mx-1 rounded cursor-pointer transition-all duration-200 ${
          isSelected
            ? 'bg-blue-100 text-blue-800 border-2 border-blue-300'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
        }`}
        onClick={() => handleVariableClick(variable)}
        title={`${variable.name} details`}
      >
        <InlineMath math={variable.symbol} />
      </span>
    );
  };

  const extractVariablesFromFormula = (formula) => {
    // Simple regex to extract variable symbols from LaTeX
    const variablePattern = /\\[a-zA-Z]+|([a-zA-Z]+(?:_[a-zA-Z0-9]+)*)/g;
    const matches = formula.match(variablePattern) || [];
    
    // Filter out LaTeX commands and common mathematical symbols
    const latexCommands = ['\\max', '\\min', '\\sum', '\\int', '\\frac', '\\sqrt', '\\log', '\\ln', '\\exp', '\\sin', '\\cos', '\\tan'];
    const mathSymbols = ['alpha', 'beta', 'gamma', 'delta', 'epsilon', 'theta', 'lambda', 'mu', 'pi', 'sigma', 'tau', 'phi', 'psi', 'omega'];
    
    return matches.filter(match => 
      !latexCommands.includes(match) && 
      !mathSymbols.includes(match) &&
      match.length > 1 &&
      !match.startsWith('\\')
    );
  };

  const formulaVariables = extractVariablesFromFormula(formula);
  const definedVariables = variables.filter(v => formulaVariables.includes(v.symbol));
  const undefinedVariables = formulaVariables.filter(symbol => !variables.find(v => v.symbol === symbol));

  return (
    <div className={`card border-l-4 border-purple-500 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-3">
          <div className="bg-purple-100 p-2 rounded-lg">
            <Calculator className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">Formula Details</h3>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span>Version {version}</span>
              {lastUpdated && (
                <span>Updated {new Date(lastUpdated).toLocaleDateString()}</span>
              )}
            </div>
          </div>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-gray-400" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-400" />
          )}
        </button>
      </div>

      {/* Formula Display */}
      <div className="px-4 pb-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-center">
            <BlockMath math={formula} />
          </div>
          {description && (
            <p className="text-sm text-gray-600 mt-3 text-center">{description}</p>
          )}
        </div>

        {/* Variables */}
        <div className="mt-4">
          <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
            <Info className="h-4 w-4 mr-2 text-blue-600" />
            Variables Used
          </h4>
          <div className="flex flex-wrap gap-2">
            {definedVariables.map(variable => renderVariable(variable))}
            {undefinedVariables.map(symbol => (
              <span
                key={symbol}
                className="inline-block px-2 py-1 mx-1 rounded bg-red-100 text-red-700 border border-red-300"
                title="Variable not defined"
              >
                <InlineMath math={symbol} />
              </span>
            ))}
          </div>
        </div>

        {/* Variable Details */}
        {selectedVariable && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h5 className="font-semibold text-blue-800 mb-2">
              <InlineMath math={selectedVariable.symbol} /> - {selectedVariable.name}
            </h5>
            <p className="text-sm text-blue-700 mb-2">{selectedVariable.description}</p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-blue-800">Type:</span>
                <span className="ml-2 text-blue-700">{selectedVariable.type}</span>
              </div>
              {selectedVariable.unit && (
                <div>
                  <span className="font-medium text-blue-800">Unit:</span>
                  <span className="ml-2 text-blue-700">{selectedVariable.unit}</span>
                </div>
              )}
              {selectedVariable.range && (
                <div className="col-span-2">
                  <span className="font-medium text-blue-800">Range:</span>
                  <span className="ml-2 text-blue-700">{selectedVariable.range}</span>
                </div>
              )}
              {selectedVariable.defaultValue && (
                <div className="col-span-2">
                  <span className="font-medium text-blue-800">Default:</span>
                  <span className="ml-2 text-blue-700">{selectedVariable.defaultValue}</span>
                </div>
              )}
            </div>
            {selectedVariable.typicalValues && selectedVariable.typicalValues.length > 0 && (
              <div className="mt-2">
                <span className="font-medium text-blue-800">Typical Values:</span>
                <div className="mt-1 flex flex-wrap gap-1">
                  {selectedVariable.typicalValues.map((value, index) => (
                    <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                      {value}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-gray-200 pt-4">
          {/* Conditions */}
          {conditions.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                <AlertCircle className="h-4 w-4 mr-2 text-orange-600" />
                Conditions
              </h4>
              <div className="space-y-2">
                {conditions.map((condition, index) => (
                  <div key={index} className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                    <p className="text-sm text-orange-800">{condition}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Examples */}
          {examples.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                <BookOpen className="h-4 w-4 mr-2 text-green-600" />
                Examples
              </h4>
              <div className="space-y-3">
                {examples.map((example, index) => (
                  <div key={index} className="bg-green-50 p-3 rounded-lg border border-green-200">
                    <h5 className="font-medium text-green-800 mb-1">{example.title}</h5>
                    <p className="text-sm text-green-700 mb-2">{example.description}</p>
                    {example.inputs && (
                      <div className="mb-2">
                        <span className="font-medium text-green-800">Inputs:</span>
                        <div className="mt-1 grid grid-cols-2 gap-2 text-xs">
                          {Object.entries(example.inputs).map(([key, value]) => (
                            <div key={key} className="flex justify-between">
                              <span className="text-green-700">{key}:</span>
                              <span className="font-medium text-green-800">{value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {example.result && (
                      <div>
                        <span className="font-medium text-green-800">Result:</span>
                        <span className="ml-2 font-semibold text-green-800">{example.result}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Validation Rules */}
          {validationRules.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-800 flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2 text-purple-600" />
                  Validation Rules
                </h4>
                <button
                  onClick={() => setShowValidation(!showValidation)}
                  className="text-sm text-purple-600 hover:text-purple-800"
                >
                  {showValidation ? 'Hide' : 'Show'} Details
                </button>
              </div>
              <div className="space-y-2">
                {validationRules.map((rule, index) => (
                  <div key={index} className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                    <div className="flex items-center justify-between">
                      <h5 className="font-medium text-purple-800">{rule.name}</h5>
                      <span className={`px-2 py-1 rounded text-xs ${
                        rule.severity === 'error' ? 'bg-red-100 text-red-800' :
                        rule.severity === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {rule.severity}
                      </span>
                    </div>
                    <p className="text-sm text-purple-700 mt-1">{rule.description}</p>
                    {showValidation && (
                      <div className="mt-2 text-xs text-purple-600">
                        <div><strong>Type:</strong> {rule.type}</div>
                        {rule.errorMessage && (
                          <div><strong>Error:</strong> {rule.errorMessage}</div>
                        )}
                        {rule.warningMessage && (
                          <div><strong>Warning:</strong> {rule.warningMessage}</div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FormulaExplainer;
