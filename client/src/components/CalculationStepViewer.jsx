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
      <div key={index} className="bg-white/50 border border-gray-100/50 rounded-3xl mb-4 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
        {/* Step Header */}
        <div className="flex items-center justify-between p-6 bg-gray-50/50">
          <div className="flex items-center space-x-4">
            <div className={`p-2.5 rounded-xl ${step.status === 'completed' ? 'bg-growth-100 text-growth-700' : 'bg-trust-50 text-trust-700'}`}>
              <Calculator className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Operation {index + 1}</span>
                {step.status && (
                  <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${step.status === 'completed' ? 'bg-growth-50 text-growth-700 border-growth-100' :
                      step.status === 'error' ? 'bg-accent-50 text-accent-700 border-accent-100' :
                        step.status === 'warning' ? 'bg-trust-50 text-trust-700 border-trust-100' :
                          'bg-gray-100 text-gray-500 border-gray-100'
                    }`}>
                    {step.status}
                  </span>
                )}
              </div>
              <h4 className="text-[13px] font-heading font-black text-trust-950 uppercase tracking-tight">
                {step.name}
              </h4>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {hasDetails && (
              <button
                onClick={() => toggleStep(index)}
                className="p-2 hover:bg-gray-200/50 rounded-xl transition-colors"
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
          <div className="p-6 space-y-6 bg-white">
            {/* Formula */}
            {step.formula && showFormulas && (
              <div className="bg-trust-950 p-6 rounded-[2rem] border border-trust-900 shadow-xl text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-growth-400/5 blur-[40px] rounded-full -mr-16 -mt-16" />
                <h5 className="text-[9px] font-black text-growth-400 uppercase tracking-[0.2em] mb-4 text-left">Mathematical Core</h5>
                <div className="text-white relative z-10 transition-transform hover:scale-105 duration-500">
                  <BlockMath math={step.formula} />
                </div>
              </div>
            )}

            {/* Inputs */}
            {step.inputs && Object.keys(step.inputs).length > 0 && (
              <div className="bg-trust-50/50 p-6 rounded-2xl border border-trust-100">
                <h5 className="text-[10px] font-black text-trust-950 uppercase tracking-[0.2em] mb-4">Input Vector</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {Object.entries(step.inputs).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center bg-white p-3 rounded-xl border border-white shadow-sm">
                      <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{key}</span>
                      <span className="text-[10px] font-black text-trust-950">
                        {typeof value === 'number' ? value.toLocaleString() : String(value)}
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
              <div className="bg-growth-800 p-6 rounded-2xl shadow-lg shadow-growth-100 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-growth-700 to-growth-800 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10 flex justify-between items-center">
                  <div>
                    <h5 className="text-[9px] font-black text-white/50 uppercase tracking-[0.2em] mb-1">Step Result</h5>
                    <div className="text-xl font-heading font-black text-white tracking-tight">
                      {typeof step.output === 'number' ? step.output.toLocaleString() : step.output}
                      {step.unit && <span className="text-xs font-bold text-growth-200 ml-1">{step.unit}</span>}
                    </div>
                  </div>
                  <div className="bg-white/10 p-2 rounded-xl border border-white/10 backdrop-blur-sm">
                    <CheckCircle className="h-5 w-5 text-growth-300" />
                  </div>
                </div>
              </div>
            )}

            {/* Intermediate Results */}
            {step.intermediateResults && showIntermediateResults && (
              <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                <h5 className="text-[10px] font-black text-trust-950 uppercase tracking-[0.2em] mb-4">Intermediate Metrics</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {step.intermediateResults.map((result, resultIndex) => (
                    <div key={resultIndex} className="flex justify-between items-center bg-white p-3 rounded-xl border border-white shadow-sm">
                      <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{result.name}</span>
                      <span className="text-[10px] font-black text-trust-950">
                        {typeof result.value === 'number' ? result.value.toLocaleString() : result.value}
                        {result.unit && <span className="text-[8px] text-gray-400 ml-1">{result.unit}</span>}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Validation */}
            {step.validation && showValidation && (
              <div className="bg-growth-50/30 p-6 rounded-2xl border border-growth-100">
                <h5 className="text-[10px] font-black text-growth-800 uppercase tracking-[0.2em] mb-4 flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Logic Validation
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {step.validation.map((validation, validationIndex) => (
                    <div key={validationIndex} className="flex items-center justify-between bg-white/50 p-3 rounded-xl border border-white shadow-sm">
                      <span className="text-[10px] font-black text-growth-900 uppercase tracking-tight">{validation.check}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${validation.passed ? 'bg-growth-50 text-growth-700 border-growth-100' : 'bg-accent-50 text-accent-700 border-accent-100'
                        }`}>
                        {validation.passed ? 'PASSED' : 'FAILED'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Explanation & Warnings stack */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {step.explanation && (
                <div className="bg-trust-50/30 p-6 rounded-2xl border border-trust-100">
                  <h5 className="text-[10px] font-black text-trust-800 uppercase tracking-[0.2em] mb-3 flex items-center">
                    <Info className="h-4 w-4 mr-2" />
                    Analytical Context
                  </h5>
                  <p className="text-[11px] font-bold text-trust-950/70 leading-relaxed italic">"{step.explanation}"</p>
                </div>
              )}

              {step.warnings && step.warnings.length > 0 && (
                <div className="bg-accent-50/30 p-6 rounded-2xl border border-accent-100">
                  <h5 className="text-[10px] font-black text-accent-800 uppercase tracking-[0.2em] mb-3 flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Advisory Notices
                  </h5>
                  <div className="space-y-2">
                    {step.warnings.map((warning, warningIndex) => (
                      <p key={warningIndex} className="text-[10px] font-bold text-accent-950 flex gap-2">
                        <span className="text-accent-400 opacity-50">•</span>
                        {warning}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (!steps || steps.length === 0) {
    return (
      <div className={`bg-white/80 backdrop-blur-xl rounded-[2.5rem] border border-trust-50 shadow-glass p-12 overflow-hidden ${className}`}>
        <div className="text-center py-8 text-gray-400">
          <Calculator className="h-12 w-12 mx-auto mb-4 opacity-20" />
          <div className="text-[10px] font-black uppercase tracking-[0.2em]">Sequence Missing</div>
          <p className="text-xs mt-2 font-medium">No calculation steps were recorded for this transaction.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-8 px-1">
        <div className="flex items-center space-x-4">
          <div className="bg-trust-950 p-3 rounded-2xl shadow-lg ring-1 ring-white/10">
            <Play className="h-5 w-5 text-growth-400" />
          </div>
          <div>
            <h3 className="text-2xl font-heading font-black text-trust-950 uppercase tracking-tight">{title}</h3>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Foundational Computation Sequence</p>
          </div>
        </div>
        <div>
          <button
            onClick={toggleAllSteps}
            className="px-5 py-2.5 text-[10px] font-black text-trust-950 uppercase tracking-[0.2em] bg-white border border-gray-100 rounded-xl hover:bg-gray-50 transition-all duration-300 shadow-sm"
          >
            {showAllSteps ? 'Minimize Ledger' : 'Expand Details'}
          </button>
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-4">
        {steps.map((step, index) => renderStep(step, index))}
      </div>

      {/* Summary */}
      <div className="mt-12 p-10 bg-trust-950 rounded-[2.5rem] border border-trust-900 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-growth-500/5 blur-[100px] rounded-full -mr-32 -mt-32" />
        <h4 className="text-[10px] font-black text-growth-400 uppercase tracking-[0.2em] mb-8 relative z-10">Sequence Quality Audit</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 relative z-10">
          <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
            <div className="text-[8px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2">Total Operations</div>
            <div className="text-2xl font-heading font-black text-white">{steps.length}</div>
          </div>
          <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
            <div className="text-[8px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2">Verified Passes</div>
            <div className="text-2xl font-heading font-black text-growth-500">
              {steps.filter(s => s.status === 'completed').length}
            </div>
          </div>
          <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
            <div className="text-[8px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2">Risk Advisories</div>
            <div className="text-2xl font-heading font-black text-accent-500">
              {steps.filter(s => s.status === 'warning').length}
            </div>
          </div>
          <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
            <div className="text-[8px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2">Critical Deviations</div>
            <div className="text-2xl font-heading font-black text-red-500">
              {steps.filter(s => s.status === 'error').length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalculationStepViewer;
