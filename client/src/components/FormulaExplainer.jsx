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
        className={`inline-block px-3 py-1 mx-1 rounded-xl cursor-pointer transition-all duration-300 font-bold ${isSelected
          ? 'bg-trust-950 text-growth-400 border border-trust-950 shadow-md'
          : 'bg-gray-50 text-gray-500 hover:bg-gray-100 border border-gray-100'
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
    <div className={`bg-white/90 backdrop-blur-xl rounded-[2.5rem] border border-trust-50 shadow-glass overflow-hidden ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-8 border-b border-gray-50">
        <div className="flex items-center space-x-4">
          <div className="bg-trust-50 p-3 rounded-2xl">
            <Calculator className="h-6 w-6 text-trust-600" />
          </div>
          <div>
            <h3 className="text-[10px] font-black text-trust-950 uppercase tracking-[0.2em] mb-1">Mathematical Architecture</h3>
            <div className="flex items-center space-x-4">
              <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Version {version}</span>
              {lastUpdated && (
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-2 border-l border-gray-200">Validated {new Date(lastUpdated).toLocaleDateString()}</span>
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
      <div className="p-8">
        <div className="bg-gray-50/50 p-10 rounded-[2rem] border border-gray-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-trust-500/5 blur-[60px] rounded-full -mr-16 -mt-16" />
          <div className="text-center relative z-10 transition-transform duration-500 hover:scale-[1.02]">
            <BlockMath math={formula} />
          </div>
          {description && (
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-6 text-center leading-relaxed">
              {description}
            </p>
          )}
        </div>

        {/* Variables */}
        <div className="mt-10">
          <h4 className="text-[10px] font-black text-trust-950 uppercase tracking-[0.2em] mb-4 flex items-center px-1">
            <Info className="h-4 w-4 mr-2 text-trust-500" />
            Active Parameters
          </h4>
          <div className="flex flex-wrap gap-2 px-1">
            {definedVariables.map(variable => renderVariable(variable))}
            {undefinedVariables.map(symbol => (
              <span
                key={symbol}
                className="inline-block px-3 py-1 mx-1 rounded-xl bg-accent-50 text-accent-700 border border-accent-100 text-[10px] font-black"
                title="Variable not defined"
              >
                <InlineMath math={symbol} />
              </span>
            ))}
          </div>
        </div>

        {/* Variable Details */}
        {selectedVariable && (
          <div className="mt-8 p-6 bg-trust-950 rounded-2xl border border-trust-900 shadow-xl animate-in fade-in slide-in-from-top-4 duration-300">
            <h5 className="text-[13px] font-heading font-black text-growth-400 uppercase tracking-tight mb-3">
              <InlineMath math={selectedVariable.symbol} /> — {selectedVariable.name}
            </h5>
            <p className="text-xs text-gray-400 font-medium leading-relaxed mb-4">{selectedVariable.description}</p>
            <div className="grid grid-cols-2 gap-4 text-[10px]">
              <div className="bg-white/5 p-3 rounded-xl">
                <span className="font-black text-gray-400 uppercase tracking-widest block mb-1">Data Type</span>
                <span className="text-white font-bold">{selectedVariable.type}</span>
              </div>
              {selectedVariable.unit && (
                <div className="bg-white/5 p-3 rounded-xl">
                  <span className="font-black text-gray-400 uppercase tracking-widest block mb-1">Standard Unit</span>
                  <span className="text-white font-bold">{selectedVariable.unit}</span>
                </div>
              )}
              {selectedVariable.range && (
                <div className="col-span-2 bg-white/5 p-3 rounded-xl">
                  <span className="font-black text-gray-400 uppercase tracking-widest block mb-1">Domain Range</span>
                  <span className="text-white font-bold">{selectedVariable.range}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-gray-200 pt-4">
          {/* Conditions */}
          {conditions.length > 0 && (
            <div className="p-8 border-t border-gray-50">
              <h4 className="text-[10px] font-black text-trust-950 uppercase tracking-[0.2em] mb-4 flex items-center">
                <AlertCircle className="h-4 w-4 mr-2 text-accent-500" />
                Contextual Constraints
              </h4>
              <div className="space-y-3">
                {conditions.map((condition, index) => (
                  <div key={index} className="bg-accent-50/30 p-4 rounded-2xl border border-accent-100">
                    <p className="text-[11px] font-bold text-accent-950 uppercase tracking-tight">{condition}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Examples */}
          {examples.length > 0 && (
            <div className="p-8 border-t border-gray-50">
              <h4 className="text-[10px] font-black text-trust-950 uppercase tracking-[0.2em] mb-6 flex items-center">
                <BookOpen className="h-4 w-4 mr-2 text-growth-500" />
                Operational Examples
              </h4>
              <div className="space-y-6">
                {examples.map((example, index) => (
                  <div key={index} className="bg-growth-50/30 p-6 rounded-[2rem] border border-growth-100">
                    <h5 className="text-[13px] font-heading font-black text-growth-800 uppercase tracking-tight mb-3">{example.title}</h5>
                    <p className="text-[11px] font-bold text-growth-900/60 uppercase tracking-widest mb-4">{example.description}</p>
                    {example.inputs && (
                      <div className="mb-4">
                        <div className="mt-1 grid grid-cols-2 gap-4">
                          {Object.entries(example.inputs).map(([key, value]) => (
                            <div key={key} className="flex justify-between bg-white/50 p-2 rounded-xl border border-white">
                              <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{key}</span>
                              <span className="text-[9px] font-black text-growth-800 uppercase tracking-widest">{value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {example.result && (
                      <div className="flex justify-between items-center bg-growth-800 text-white p-4 rounded-2xl shadow-lg shadow-growth-100">
                        <span className="text-[9px] font-black uppercase tracking-[0.2em]">Validated Result</span>
                        <span className="text-sm font-black tracking-tighter">{example.result}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Validation Rules */}
          {validationRules.length > 0 && (
            <div className="p-8 border-t border-gray-50 bg-gray-50/50">
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-[10px] font-black text-trust-950 uppercase tracking-[0.2em] flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2 text-trust-500" />
                  Audit & Compliance Rules
                </h4>
                <button
                  onClick={() => setShowValidation(!showValidation)}
                  className="text-[9px] font-black text-trust-600 uppercase tracking-widest hover:text-trust-950 transition-colors"
                >
                  {showValidation ? 'Hide Protocol' : 'Review Protocol'}
                </button>
              </div>
              <div className="space-y-4">
                {validationRules.map((rule, index) => (
                  <div key={index} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="text-[11px] font-black text-trust-950 uppercase tracking-widest">{rule.name}</h5>
                      <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${rule.severity === 'error' ? 'bg-accent-50 text-accent-700 border-accent-100' :
                        rule.severity === 'warning' ? 'bg-trust-50 text-trust-700 border-trust-100' :
                          'bg-growth-50 text-growth-700 border-growth-100'
                        }`}>
                        {rule.severity}
                      </span>
                    </div>
                    <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-tight">{rule.description}</p>
                    {showValidation && (
                      <div className="mt-4 pt-4 border-t border-gray-50 grid grid-cols-2 gap-4 text-[9px] font-bold uppercase tracking-widest">
                        <div><span className="text-gray-400">Target Type:</span> <span className="text-trust-950 ml-1">{rule.type}</span></div>
                        {rule.errorMessage && (
                          <div className="col-span-2 text-accent-600">Protocol Failure: {rule.errorMessage}</div>
                        )}
                        {rule.warningMessage && (
                          <div className="col-span-2 text-trust-600">Compliance Warning: {rule.warningMessage}</div>
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
