/**
 * CalculationStepViewer Component
 * Displays step-by-step calculation breakdown with intermediate results
 */

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Calculator, Play, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

const CalculationStepViewer = ({
  steps = [],
  title = 'Calculation Steps',
  showIntermediateResults = true,
  showFormulas = true,
  showValidation = true,
  className = ''
}) => {
  const [expandedSteps, setExpandedSteps] = useState(new Set());
  const [showAllSteps, setShowAllSteps] = useState(false);

  const toggleStep = (stepIndex) => {
    const newExpanded = new Set(expandedSteps);
    if (newExpanded.has(stepIndex)) {
      newExpanded.delete(stepIndex);
    } else {
      newExpanded.add(stepIndex);
    }
    setExpandedSteps(newExpanded);
  };

  const toggleAllSteps = () => {
    if (showAllSteps) {
      setExpandedSteps(new Set());
    } else {
      setExpandedSteps(new Set(steps.map((_, index) => index)));
    }
    setShowAllSteps(!showAllSteps);
  };

  const renderStep = (step, index) => {
    const isExpanded = expandedSteps.has(index);
    const hasDetails = step.formula || step.explanation || step.validation || step.intermediateResults;

    return (
      <div key={index} className="border border-gray-200 rounded-lg mb-3">
        {/* Step Header */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-t-lg">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Calculator className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-800">
                Step {index + 1}: {step.name}
              </h4>
              <p className="text-sm text-gray-600">{step.description}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {step.status && (
              <span className={`px-2 py-1 rounded text-xs ${
                step.status === 'completed' ? 'bg-green-100 text-green-800' :
                step.status === 'error' ? 'bg-red-100 text-red-800' :
                step.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {step.status}
              </span>
            )}
            {hasDetails && (
              <button
                onClick={() => toggleStep(index)}
                className="p-1 hover:bg-gray-200 rounded transition-colors"
              >
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4 text-gray-400" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                )}
              </button>
            )}
          </div>
        </div>

        {/* Step Content */}
        {isExpanded && hasDetails && (
          <div className="p-4 space-y-4">
            {/* Formula */}
            {step.formula && showFormulas && (
              <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                <h5 className="font-semibold text-purple-800 mb-2 flex items-center">
                  <Calculator className="h-4 w-4 mr-2" />
                  Formula
                </h5>
                <div className="text-center">
                  <BlockMath math={step.formula} />
                </div>
              </div>
            )}

            {/* Inputs */}
            {step.inputs && Object.keys(step.inputs).length > 0 && (
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <h5 className="font-semibold text-blue-800 mb-2">Inputs</h5>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {Object.entries(step.inputs).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-blue-700">{key}:</span>
                      <span className="font-medium text-blue-800">
                        {typeof value === 'number' ? value.toLocaleString() : value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Calculation */}
            {step.calculation && (
              <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                <h5 className="font-semibold text-green-800 mb-2">Calculation</h5>
                <div className="text-sm text-green-700">
                  {step.calculation.map((calc, calcIndex) => (
                    <div key={calcIndex} className="mb-1">
                      {calc}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Output */}
            {step.output !== undefined && (
              <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200">
                <h5 className="font-semibold text-emerald-800 mb-2">Result</h5>
                <div className="text-lg font-semibold text-emerald-800">
                  {typeof step.output === 'number' ? step.output.toLocaleString() : step.output}
                  {step.unit && <span className="text-sm text-emerald-600 ml-1">{step.unit}</span>}
                </div>
              </div>
            )}

            {/* Intermediate Results */}
            {step.intermediateResults && showIntermediateResults && (
              <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                <h5 className="font-semibold text-yellow-800 mb-2">Intermediate Results</h5>
                <div className="space-y-2">
                  {step.intermediateResults.map((result, resultIndex) => (
                    <div key={resultIndex} className="flex justify-between items-center">
                      <span className="text-yellow-700">{result.name}:</span>
                      <span className="font-medium text-yellow-800">
                        {typeof result.value === 'number' ? result.value.toLocaleString() : result.value}
                        {result.unit && <span className="text-sm text-yellow-600 ml-1">{result.unit}</span>}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Validation */}
            {step.validation && showValidation && (
              <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                <h5 className="font-semibold text-orange-800 mb-2 flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Validation
                </h5>
                <div className="space-y-2">
                  {step.validation.map((validation, validationIndex) => (
                    <div key={validationIndex} className="flex items-center justify-between">
                      <span className="text-orange-700">{validation.check}:</span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        validation.passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {validation.passed ? 'Passed' : 'Failed'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Explanation */}
            {step.explanation && (
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                <h5 className="font-semibold text-gray-800 mb-2 flex items-center">
                  <Info className="h-4 w-4 mr-2" />
                  Explanation
                </h5>
                <p className="text-sm text-gray-700">{step.explanation}</p>
              </div>
            )}

            {/* Warnings */}
            {step.warnings && step.warnings.length > 0 && (
              <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                <h5 className="font-semibold text-red-800 mb-2 flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Warnings
                </h5>
                <div className="space-y-1">
                  {step.warnings.map((warning, warningIndex) => (
                    <p key={warningIndex} className="text-sm text-red-700">
                      • {warning}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  if (!steps || steps.length === 0) {
    return (
      <div className={`card ${className}`}>
        <div className="text-center py-8 text-gray-500">
          <Calculator className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>No calculation steps available</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`card ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-100 p-2 rounded-lg">
            <Play className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
            <p className="text-sm text-gray-600">{steps.length} calculation steps</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleAllSteps}
            className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
          >
            {showAllSteps ? 'Collapse All' : 'Expand All'}
          </button>
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-3">
        {steps.map((step, index) => renderStep(step, index))}
      </div>

      {/* Summary */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h4 className="font-semibold text-gray-800 mb-2">Calculation Summary</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Total Steps:</span>
            <span className="ml-2 font-semibold text-gray-800">{steps.length}</span>
          </div>
          <div>
            <span className="text-gray-600">Completed:</span>
            <span className="ml-2 font-semibold text-green-600">
              {steps.filter(s => s.status === 'completed').length}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Warnings:</span>
            <span className="ml-2 font-semibold text-yellow-600">
              {steps.filter(s => s.status === 'warning').length}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Errors:</span>
            <span className="ml-2 font-semibold text-red-600">
              {steps.filter(s => s.status === 'error').length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalculationStepViewer;
