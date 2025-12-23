/**
 * AuditTrailViewer Component
 * Displays complete audit trail for calculations
 */

import React, { useState } from 'react';
import { FileText, Clock, User, CheckCircle, AlertTriangle, Info, Download, Eye, EyeOff } from 'lucide-react';
import { InlineMath, BlockMath } from 'react-katex';
import CalculationStepViewer from './CalculationStepViewer';
import { jsPDF } from 'jspdf';
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
    const doc = new jsPDF();

    // Add Title
    doc.setFontSize(20);
    doc.text(title, 20, 20);
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 30);

    let yPos = 40;

    // Helper function to add text and manage page breaks
    const addText = (text, x, y, options = {}) => {
      if (y > 280) {
        doc.addPage();
        y = 20;
      }
      doc.text(text, x, y, options);
      return y + (options.lineHeight || 10);
    };

    // Calculation Steps
    if (auditTrail.calculationSteps) {
      doc.setFontSize(16);
      yPos = addText('Calculation Steps', 20, yPos);
      doc.setFontSize(10);

      auditTrail.calculationSteps.forEach((step, idx) => {
        yPos = addText(`${idx + 1}. ${step.name}`, 20, yPos);
        // Add more details if needed
        if (step.description) {
          yPos = addText(`   ${step.description}`, 20, yPos);
        }
        if (step.result) {
          yPos = addText(`   Result: ${step.result}`, 20, yPos);
        }
      });
      yPos += 10;
    }

    // Inputs
    if (auditTrail.calculationInputs) {
      doc.setFontSize(16);
      yPos = addText('Inputs', 20, yPos);
      doc.setFontSize(10);
      Object.entries(auditTrail.calculationInputs).forEach(([key, value]) => {
        yPos = addText(`${key}: ${value}`, 20, yPos);
      });
      yPos += 10;
    }

    // Save the PDF
    doc.save(`audit_trail_${new Date().toISOString().split('T')[0]}.pdf`);
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
      <div className="space-y-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="p-6 bg-trust-50 border border-trust-100 rounded-3xl group hover:bg-trust-100 transition-all duration-300">
            <div className="flex items-center space-x-2 mb-3">
              <CheckCircle className="h-4 w-4 text-trust-600" />
              <span className="text-[10px] font-black text-trust-950 uppercase tracking-widest">Steps</span>
            </div>
            <div className="text-3xl font-heading font-black text-trust-600">{summary.totalSteps}</div>
          </div>

          <div className="p-6 bg-growth-50 border border-growth-100 rounded-3xl group hover:bg-growth-100 transition-all duration-300">
            <div className="flex items-center space-x-2 mb-3">
              <FileText className="h-4 w-4 text-growth-600" />
              <span className="text-[10px] font-black text-growth-950 uppercase tracking-widest">Formulas</span>
            </div>
            <div className="text-3xl font-heading font-black text-growth-600">{summary.totalFormulasUsed}</div>
          </div>

          <div className="p-6 bg-accent-50 border border-accent-100 rounded-3xl group hover:bg-accent-100 transition-all duration-300">
            <div className="flex items-center space-x-2 mb-3">
              <AlertTriangle className="h-4 w-4 text-accent-600" />
              <span className="text-[10px] font-black text-accent-950 uppercase tracking-widest">Warnings</span>
            </div>
            <div className="text-3xl font-heading font-black text-accent-600">{summary.totalWarnings}</div>
          </div>

          <div className="p-6 bg-trust-900 border border-trust-950 rounded-3xl group hover:bg-trust-950 transition-all duration-300">
            <div className="flex items-center space-x-2 mb-3">
              <Info className="h-4 w-4 text-growth-400" />
              <span className="text-[10px] font-black text-white uppercase tracking-widest">Assumptions</span>
            </div>
            <div className="text-3xl font-heading font-black text-white">{summary.totalAssumptionsUsed}</div>
          </div>
        </div>

        {/* Methodology Info */}
        <div className="p-8 bg-gray-50/50 border border-gray-100 rounded-3xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-trust-500/5 blur-[50px] rounded-full -mr-16 -mt-16" />
          <h4 className="text-[10px] font-black text-trust-950 uppercase tracking-[0.2em] mb-4">Methodology Framework</h4>
          <div className="grid grid-cols-2 gap-8 text-[11px]">
            <div className="flex justify-between items-center bg-white/80 p-3 rounded-xl border border-white">
              <span className="font-black text-gray-400 uppercase tracking-widest">Protocol Version</span>
              <span className="text-trust-950 font-black">{summary.methodologyVersion}</span>
            </div>
            <div className="flex justify-between items-center bg-white/80 p-3 rounded-xl border border-white">
              <span className="font-black text-gray-400 uppercase tracking-widest">Compliance Status</span>
              <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${summary.hasValidationIssues ? 'bg-accent-50 text-accent-700 border-accent-100' : 'bg-growth-50 text-growth-700 border-growth-100'
                }`}>
                {summary.hasValidationIssues ? 'Deviation Found' : 'Compliant'}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="p-8 bg-white border border-gray-100 rounded-3xl shadow-sm">
          <h4 className="text-[10px] font-black text-trust-950 uppercase tracking-[0.2em] mb-6 px-1">Deep Logic validation</h4>
          <div className="grid grid-cols-2 gap-8 text-[11px]">
            <div className="flex justify-between items-center px-1">
              <span className="font-black text-gray-400 uppercase tracking-widest">Intermediate Data Points</span>
              <span className="text-trust-950 font-black">{summary.totalIntermediateResults}</span>
            </div>
            <div className="flex justify-between items-center px-1">
              <span className="font-black text-gray-400 uppercase tracking-widest">Validation Test Suite</span>
              <span className="text-trust-950 font-black">{summary.totalValidationResults}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderInputs = () => {
    if (!auditTrail.calculationInputs) return null;

    return (
      <div className="space-y-6">
        <div className="p-8 bg-gray-50/50 border border-gray-100 rounded-3xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-trust-500/5 blur-[50px] rounded-full -mr-16 -mt-16" />
          <h4 className="text-[10px] font-black text-trust-950 uppercase tracking-[0.2em] mb-6 px-1">Raw Input Vector</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(auditTrail.calculationInputs).filter(([key]) => key !== 'timestamp').map(([key, value]) => (
              <div key={key} className="flex justify-between items-center bg-white/80 p-4 rounded-2xl border border-white shadow-sm">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                <span className="text-[11px] font-black text-trust-950 truncate max-w-[150px]">
                  {typeof value === 'number' ? value.toLocaleString() : String(value)}
                </span>
              </div>
            ))}
          </div>
          {auditTrail.calculationInputs.timestamp && (
            <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between px-1">
              <div className="flex items-center space-x-2 text-[9px] font-black text-gray-400 uppercase tracking-widest">
                <Clock className="h-3 w-3" />
                <span>Ingestion Timestamp</span>
              </div>
              <span className="text-[9px] font-black text-trust-600 uppercase tracking-widest">
                {new Date(auditTrail.calculationInputs.timestamp).toLocaleString()}
              </span>
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
        <div className="text-center py-16 bg-gray-50/50 rounded-3xl border border-gray-100">
          <CheckCircle className="h-12 w-12 mx-auto mb-4 text-gray-200" />
          <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">No Formulas Injected</div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {auditTrail.formulasUsed.map((formula, index) => (
          <div key={index} className="p-8 bg-white border border-gray-100 rounded-3xl shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h4 className="text-[13px] font-heading font-black text-trust-950 uppercase tracking-tight">{formula.name}</h4>
                <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">ID: {formula.formulaId}</div>
              </div>
              <div className="flex items-center space-x-3">
                <span className="px-3 py-1 bg-trust-50 text-trust-700 rounded-full text-[9px] font-black uppercase tracking-widest border border-trust-100">
                  VER {formula.version}
                </span>
              </div>
            </div>

            {formula.latex && (
              <div className="mb-8 p-10 bg-gray-50/50 rounded-2xl border border-gray-100 text-center">
                <BlockMath math={formula.latex} />
              </div>
            )}

            <div className="flex items-center justify-between text-[9px] font-black text-gray-400 uppercase tracking-widest pt-6 border-t border-gray-50">
              <div className="flex items-center gap-2">
                <Clock className="h-3 w-3" />
                <span>Injected {new Date(formula.usedAt).toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2 text-growth-600">
                <CheckCircle className="h-3 w-3" />
                <span>Mathematical Integrity Verified</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderAssumptions = () => {
    if (!auditTrail.assumptionsUsed || auditTrail.assumptionsUsed.length === 0) {
      return (
        <div className="text-center py-16 bg-gray-50/50 rounded-3xl border border-gray-100">
          <Info className="h-12 w-12 mx-auto mb-4 text-gray-200" />
          <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">No Assumptions Loaded</div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {auditTrail.assumptionsUsed.map((assumption, index) => (
          <div key={index} className="p-8 bg-white border border-gray-100 rounded-3xl shadow-sm hover:border-trust-200 transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-[13px] font-heading font-black text-trust-950 uppercase tracking-tight">{assumption.name}</h4>
              <span className="px-3 py-1 bg-gray-50 text-gray-500 rounded-full text-[9px] font-black uppercase tracking-widest border border-gray-100">
                Source: {assumption.source}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-trust-50/50 p-4 rounded-2xl border border-trust-100">
                <span className="text-[9px] font-black text-trust-950/40 uppercase tracking-widest block mb-1">Effective Value</span>
                <span className="text-sm font-black text-trust-950">{assumption.value}</span>
              </div>
              <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">Verification Reference</span>
                <span className="text-xs font-bold text-gray-600">{assumption.source}</span>
              </div>
              <div className="col-span-full bg-growth-50/30 p-4 rounded-2xl border border-growth-100">
                <span className="text-[9px] font-black text-growth-900/40 uppercase tracking-widest block mb-1">Actuarial Justification</span>
                <p className="text-[11px] font-bold text-growth-900 leading-relaxed italic">"{assumption.justification}"</p>
              </div>
            </div>

            <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <Clock className="h-3 w-3" />
              <span>Assumed at {new Date(assumption.usedAt).toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderValidation = () => {
    if (!resultValidation) {
      return (
        <div className="text-center py-16 bg-gray-50/50 rounded-3xl border border-gray-100">
          <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-gray-200" />
          <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Validation Matrix Offline</div>
        </div>
      );
    }

    return (
      <div className="space-y-10">
        {/* Overall Status */}
        <div className={`p-8 rounded-3xl border-2 shadow-xl overflow-hidden relative ${resultValidation.passedAll
          ? 'bg-growth-50/30 border-growth-100 shadow-growth-100/10'
          : 'bg-accent-50/30 border-accent-100 shadow-accent-100/10'
          }`}>
          <div className="absolute top-0 right-0 w-32 h-32 opacity-10 blur-[40px] rounded-full -mr-16 -mt-16 bg-current" />
          <div className="flex items-center gap-4 relative z-10">
            <div className={`p-3 rounded-2xl ${resultValidation.passedAll ? 'bg-growth-100' : 'bg-accent-100'}`}>
              {resultValidation.passedAll ? (
                <CheckCircle className="h-6 w-6 text-growth-700" />
              ) : (
                <AlertTriangle className="h-6 w-6 text-accent-700" />
              )}
            </div>
            <div>
              <span className={`text-[10px] font-black uppercase tracking-[0.2em] block mb-1 ${resultValidation.passedAll ? 'text-growth-700' : 'text-accent-700'}`}>
                Integrity Scan Result
              </span>
              <h4 className={`text-xl font-heading font-black uppercase tracking-tight ${resultValidation.passedAll ? 'text-growth-900' : 'text-accent-900'}`}>
                {resultValidation.passedAll ? 'Standard Conformity Confirmed' : 'Anomalous Variance Detected'}
              </h4>
            </div>
          </div>
        </div>

        {/* Range Checks */}
        {resultValidation.rangeChecks && resultValidation.rangeChecks.length > 0 && (
          <div>
            <h4 className="text-[10px] font-black text-trust-950 uppercase tracking-[0.2em] mb-6 px-1">Dimensional Constraints</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {resultValidation.rangeChecks.map((check, index) => (
                <div key={index} className={`p-6 rounded-2xl border transition-all duration-300 ${check.passed
                  ? 'bg-white border-gray-100 hover:border-growth-200'
                  : 'bg-accent-50 border-accent-100'
                  }`}>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[11px] font-black text-trust-950 uppercase tracking-widest">{check.variable}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${check.passed
                      ? 'bg-growth-50 text-growth-700 border-growth-100'
                      : 'bg-accent-600 text-white border-accent-700'
                      }`}>
                      {check.passed ? 'VALID' : 'OUT OF RANGE'}
                    </span>
                  </div>
                  <div className="bg-gray-50/50 p-3 rounded-xl border border-gray-100 mb-3">
                    <div className="flex justify-between text-[9px] font-black uppercase tracking-widest mb-1">
                      <span className="text-gray-400">Effective Value</span>
                      <span className="text-trust-950">{check.value}</span>
                    </div>
                    <div className="w-full bg-gray-200 h-1 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${check.passed ? 'bg-growth-500' : 'bg-accent-500'}`} style={{ width: '70%' }} />
                    </div>
                    <div className="flex justify-between text-[8px] font-black text-gray-400 uppercase tracking-widest mt-2 font-mono">
                      <span>MIN: {check.minValue}</span>
                      <span>MAX: {check.maxValue}</span>
                    </div>
                  </div>
                  {check.message && (
                    <p className="text-[9px] font-bold text-gray-500 italic mt-2">{check.message}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Consistency & Reasonableness */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Consistency Checks */}
          {resultValidation.consistencyChecks && resultValidation.consistencyChecks.length > 0 && (
            <div>
              <h4 className="text-[10px] font-black text-trust-950 uppercase tracking-[0.2em] mb-6 px-1">Cross-logic Consistency</h4>
              <div className="space-y-4">
                {resultValidation.consistencyChecks.map((check, index) => (
                  <div key={index} className="p-5 bg-white border border-gray-100 rounded-2xl shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="text-[11px] font-black text-trust-950 uppercase tracking-widest">{check.checkName}</h5>
                      <div className={`w-2 h-2 rounded-full ${check.passed ? 'bg-growth-500' : 'bg-accent-500'} shadow-sm shadow-current`} />
                    </div>
                    <p className="text-[10px] font-bold text-gray-400 leading-relaxed">{check.description}</p>
                    {check.message && (
                      <div className={`mt-3 p-2 rounded-xl text-[9px] font-black uppercase tracking-widest border ${check.passed ? 'bg-growth-50 text-growth-700 border-growth-100' : 'bg-accent-50 text-accent-700 border-accent-100'}`}>
                        {check.message}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reasonableness Tests */}
          {resultValidation.reasonablenessTests && resultValidation.reasonablenessTests.length > 0 && (
            <div>
              <h4 className="text-[10px] font-black text-trust-950 uppercase tracking-[0.2em] mb-6 px-1">Economic Rationality</h4>
              <div className="space-y-4">
                {resultValidation.reasonablenessTests.map((test, index) => (
                  <div key={index} className="p-5 bg-white border border-gray-100 rounded-2xl shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="text-[11px] font-black text-trust-950 uppercase tracking-widest">{test.testName}</h5>
                      <span className={`text-[9px] font-black ${test.passed ? 'text-growth-600' : 'text-accent-600'}`}>
                        {test.passed ? 'RATIONAL' : 'IRRATIONAL'}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div className="bg-gray-50 p-2 rounded-xl text-center">
                        <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest block">Observed</span>
                        <span className="text-[11px] font-black text-trust-950">{test.actualValue}</span>
                      </div>
                      <div className="bg-gray-50 p-2 rounded-xl text-center">
                        <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest block">Benchmark</span>
                        <span className="text-[11px] font-black text-trust-950">{test.benchmark}</span>
                      </div>
                    </div>
                    <p className="text-[10px] font-bold text-gray-400 leading-relaxed italic">"{test.description}"</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderWarnings = () => {
    if (!auditTrail.warnings || auditTrail.warnings.length === 0) {
      return (
        <div className="text-center py-16 bg-gray-50/50 rounded-3xl border border-gray-100">
          <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-gray-200" />
          <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Protocol Nominal</div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {auditTrail.warnings.map((warning, index) => (
          <div key={index} className="p-6 bg-accent-50/30 border border-accent-100 rounded-[2rem] animate-in fade-in slide-in-from-left-4 duration-300">
            <div className="flex items-start space-x-4">
              <div className="p-2 rounded-xl bg-accent-100">
                <AlertTriangle className="h-4 w-4 text-accent-700" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-black text-accent-950 uppercase tracking-widest">{warning.category}</span>
                  <span className="text-[9px] font-black text-accent-600 uppercase tracking-widest">
                    {new Date(warning.timestamp).toLocaleString()}
                  </span>
                </div>
                <p className="text-[11px] font-bold text-accent-800 leading-relaxed">{warning.message}</p>
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
        <div className="text-center py-16 bg-gray-50/50 rounded-3xl border border-gray-100">
          <Clock className="h-12 w-12 mx-auto mb-4 text-gray-200" />
          <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Execution Buffer Empty</div>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {auditTrail.executionLog.map((log, index) => (
          <div key={index} className={`p-4 rounded-2xl border transition-all duration-300 flex items-start gap-4 ${log.level === 'error' ? 'bg-accent-50 border-accent-100' :
            log.level === 'warning' ? 'bg-yellow-50 border-yellow-200' :
              log.level === 'info' ? 'bg-trust-50 border-trust-100' :
                'bg-gray-50 border-gray-100'
            }`}>
            <div className={`p-2 rounded-xl ${log.level === 'error' ? 'bg-accent-100 text-accent-700' :
              log.level === 'warning' ? 'bg-yellow-100 text-yellow-700' :
                log.level === 'info' ? 'bg-trust-100 text-trust-700' :
                  'bg-gray-200 text-gray-600'
              }`}>
              <Clock className="h-3 w-3" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className={`text-[9px] font-black uppercase tracking-widest ${log.level === 'error' ? 'text-accent-800' :
                  log.level === 'warning' ? 'text-yellow-800' :
                    log.level === 'info' ? 'text-trust-800' :
                      'text-gray-800'
                  }`}>
                  {log.level}
                </span>
                <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest font-mono">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <p className={`text-[11px] font-bold leading-relaxed truncate ${log.level === 'error' ? 'text-accent-700' :
                log.level === 'warning' ? 'text-yellow-700' :
                  log.level === 'info' ? 'text-trust-700' :
                    'text-gray-700'
                }`}>
                {log.message}
              </p>
              {log.data && (
                <div className="mt-3 overflow-hidden rounded-xl border border-gray-100/10">
                  <pre className="p-3 bg-trust-950 text-growth-400 text-[9px] font-mono leading-tight overflow-x-auto custom-scrollbar">
                    {JSON.stringify(log.data, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (!auditTrail) {
    return (
      <div className={`bg-white/90 backdrop-blur-xl rounded-[2.5rem] border border-trust-50 shadow-glass p-12 overflow-hidden ${className}`}>
        <div className="text-center py-8 text-gray-400">
          <FileText className="h-12 w-12 mx-auto mb-4 opacity-20" />
          <div className="text-[10px] font-black uppercase tracking-[0.2em]">Audit Buffer Empty</div>
          <p className="text-xs mt-2 font-medium">No calculation audit trail data available for the current context.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white/90 backdrop-blur-xl rounded-[2.5rem] border border-trust-50 shadow-glass p-10 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center space-x-4">
          <div className="bg-trust-50 p-3 rounded-2xl">
            <FileText className="h-6 w-6 text-trust-600" />
          </div>
          <div>
            <h3 className="text-2xl font-heading font-black text-trust-950 uppercase tracking-tight">{title}</h3>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Full Immutable Ledger of Actuarial Operations</p>
          </div>
        </div>
        <button
          onClick={handleExport}
          className="bg-trust-950 text-white px-6 py-3 rounded-xl hover:bg-trust-900 transition-all duration-300 font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-2 shadow-sm"
        >
          <Download className="h-4 w-4 text-growth-400" />
          <span>Export PDF</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-100 mb-10 overflow-x-auto no-scrollbar">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 transition-all duration-300 whitespace-nowrap ${activeTab === tab.id
                ? 'border-trust-900 text-trust-950'
                : 'border-transparent text-gray-400 hover:text-trust-950 hover:border-gray-200'
                }`}
            >
              <tab.icon className={`h-4 w-4 ${activeTab === tab.id ? 'text-trust-600' : 'text-gray-300'}`} />
              <span className="text-[10px] font-black uppercase tracking-widest">{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="relative">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'inputs' && renderInputs()}
        {activeTab === 'steps' && renderSteps()}
        {activeTab === 'formulas' && renderFormulas()}
        {activeTab === 'assumptions' && renderAssumptions()}
        {activeTab === 'validation' && renderValidation()}
        {activeTab === 'warnings' && renderWarnings()}
        {activeTab === 'execution' && renderExecutionLog()}
      </div>
    </div>
  );
};

export default AuditTrailViewer;
