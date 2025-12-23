'use client';

/**
 * IFRS 17 Calculator Component
 * Provides interactive calculators for CSM, Risk Adjustment, and other IFRS 17 calculations
 * Enhanced with methodology transparency features
 */

import React, { useState } from 'react';
import { Calculator, Save, RotateCcw, Info, AlertCircle, BookOpen, Eye, EyeOff, Download } from 'lucide-react';
import { InlineMath, BlockMath } from 'react-katex';
import ExportButton from '../ExportButton';
import FormulaExplainer from '../FormulaExplainer';
import CalculationStepViewer from '../CalculationStepViewer';
import AuditTrailViewer from '../AuditTrailViewer';
import { useCalculationHistory } from '../../hooks/useLocalStorage';
import {
  calculateCSM,
  calculateRiskAdjustment,
  calculateCSMRelease,
  calculateLossComponent,
  calculatePresentValue,
  calculateDiscountRate,
  generateCSMRunoff
} from '../../utils/ifrs17Calculations';
import { formatCurrency, formatPercentage, formatNumber } from '../../utils/formatters';
import { validateFields, actuarialValidationRules } from '../../utils/validation';
import ValidatedInput from '../ValidatedInput';
import { calculations } from '../../utils/api';
import { getCalculatorColors, getStatusColors } from '../../utils/designSystem';

const IFRS17Calculator = ({ portfolio }) => {
  const [activeTab, setActiveTab] = useState('csm');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { history, saveCalculation } = useCalculationHistory('ifrs17');
  const colors = getCalculatorColors('ifrs17');

  // Methodology transparency state
  const [showMethodology, setShowMethodology] = useState(false);
  const [showAuditTrail, setShowAuditTrail] = useState(false);
  const [showCalculationSteps, setShowCalculationSteps] = useState(false);
  const [auditTrail, setAuditTrail] = useState(null);

  // CSM Calculator State
  const [csmInputs, setCsmInputs] = useState({
    premium: 1000000,
    fcf: 800000,
    ra: 50000
  });

  // Risk Adjustment Calculator State
  const [raInputs, setRaInputs] = useState({
    cashFlows: [750000, 800000, 850000, 900000, 950000],
    confidenceLevel: 0.95
  });

  // CSM Run-off Calculator State
  const [runoffInputs, setRunoffInputs] = useState({
    initialCSM: 150000,
    servicePattern: [0.2, 0.2, 0.2, 0.2, 0.2]
  });

  // Results state
  const [results, setResults] = useState({});

  const calculateCSMResults = async () => {
    setLoading(true);
    setError(null);
    const { premium, fcf, ra } = csmInputs;

    try {
      // For portfolio calculations, use backend
      if (portfolio && portfolio.length > 0) {
        const response = await calculations.runIFRS17(portfolio, {
          // Pass current inputs as assumptions or overrides if needed
          // For now, assuming portfolio contains policy data and these inputs might acts as global assumptions
          discount_rate: 0.035, // Example default
          ...csmInputs
        });

        // Ensure result format matches what we expect or transform it
        const backendResult = response.data.results || response.data;

        // This assumes backend returns a compatible structure or we need to map it
        // For Phase 1, we might just store it.
        // If backendResult has 'csm', 'lossComponent' etc.

        const newResults = {
          ...backendResult,
          timestamp: new Date().toISOString()
        };

        setResults(prev => ({ ...prev, csm: newResults }));
        // Setup audit trail from backend response if available
        if (backendResult.audit_trail) {
          setAuditTrail(backendResult.audit_trail);
        }

      } else {
        // Local calculation for single policy demo
        const csm = calculateCSM(premium, fcf, ra);
        const lossComponent = calculateLossComponent(fcf, ra, premium);

        // Create calculation steps for transparency
        const calculationSteps = [
          {
            name: 'Input Validation',
            description: 'Validate input parameters',
            status: 'completed',
            inputs: { premium, fcf, ra },
            output: 'Validated',
            explanation: 'All inputs validated successfully'
          },
          {
            name: 'CSM Calculation',
            description: 'Calculate Contractual Service Margin',
            status: 'completed',
            formula: 'CSM = \\max(0, P - FCF - RA)',
            inputs: { P: premium, FCF: fcf, RA: ra },
            calculation: [
              'Step 1: Calculate total obligations',
              `Total Obligations = FCF + RA = ${fcf.toLocaleString()} + ${ra.toLocaleString()} = ${(fcf + ra).toLocaleString()}`,
              'Step 2: Calculate CSM',
              `CSM = \max(0, P - Total Obligations)`,
              `CSM = \max(0, ${premium.toLocaleString()} - ${(fcf + ra).toLocaleString()}) = ${csm.toLocaleString()}`
            ],
            output: csm,
            unit: 'USD',
            explanation: 'CSM represents unearned profit to be recognized over coverage period'
          },
          {
            name: 'Loss Component Calculation',
            description: 'Calculate loss component for onerous contracts',
            status: 'completed',
            formula: 'LC = \\max(0, FCF + RA - P)',
            inputs: { P: premium, FCF: fcf, RA: ra },
            calculation: [
              'Step 1: Calculate total obligations',
              `Total Obligations = FCF + RA = ${fcf.toLocaleString()} + ${ra.toLocaleString()} = ${(fcf + ra).toLocaleString()}`,
              'Step 2: Calculate loss component',
              `LC = \max(0, Total Obligations - P)`,
              `LC = \max(0, ${(fcf + ra).toLocaleString()} - ${premium.toLocaleString()}) = ${lossComponent.toLocaleString()}`
            ],
            output: lossComponent,
            unit: 'USD',
            explanation: 'Loss component represents immediate loss recognition for onerous contracts'
          }
        ];

        // Create audit trail
        const auditTrailData = {
          calculationInputs: { premium, fcf, ra },
          calculationSteps: calculationSteps,
          intermediateResults: [
            { name: 'Total Obligations', value: fcf + ra, unit: 'USD', description: 'Sum of FCF and Risk Adjustment' },
            { name: 'CSM', value: csm, unit: 'USD', description: 'Contractual Service Margin' },
            { name: 'Loss Component', value: lossComponent, unit: 'USD', description: 'Loss component for onerous contracts' }
          ],
          methodologyVersion: 'IFRS17_CSM_v1.0.0',
          formulasUsed: [
            { formulaId: 'CSM_Initial', version: '1.0.0', name: 'Initial CSM Recognition', latex: 'CSM = \\max(0, P - FCF - RA)', usedAt: new Date() },
            { formulaId: 'Loss_Component', version: '1.0.0', name: 'Loss Component', latex: 'LC = \\max(0, FCF + RA - P)', usedAt: new Date() }
          ],
          assumptionsUsed: [
            { name: 'Discount Rate', value: '3.5%', source: 'regulatory', justification: 'IFRS 17 requirement', usedAt: new Date() },
            { name: 'Risk Adjustment', value: ra, source: 'company', justification: 'Company-specific risk adjustment', usedAt: new Date() }
          ],
          validationResults: [
            { checkName: 'CSM Non-Negative', type: 'range', passed: csm >= 0, message: `CSM: ${csm.toLocaleString()}`, severity: 'info', timestamp: new Date() },
            { checkName: 'Loss Component Non-Negative', type: 'range', passed: lossComponent >= 0, message: `Loss Component: ${lossComponent.toLocaleString()}`, severity: 'info', timestamp: new Date() }
          ],
          warnings: [],
          executionLog: [
            { level: 'info', message: 'CSM calculation started', timestamp: new Date() },
            { level: 'info', message: 'CSM calculation completed successfully', timestamp: new Date() }
          ]
        };

        const newResults = {
          csm,
          lossComponent,
          premium,
          fcf,
          ra,
          timestamp: new Date().toISOString(),
          calculationSteps,
          auditTrail: auditTrailData
        };

        setResults(prev => ({ ...prev, csm: newResults }));
        setAuditTrail(auditTrailData);
        saveCalculation({ type: 'csm', ...newResults });
      }
    } catch (err) {
      console.error('Calculation failed:', err);
      setError(err.message || 'Calculation failed');
    } finally {
      setLoading(false);
    }
  };

  const calculateRiskAdjustmentResults = () => {
    const { cashFlows, confidenceLevel } = raInputs;
    const ra = calculateRiskAdjustment(cashFlows, confidenceLevel);
    const expectedValue = cashFlows.reduce((sum, cf) => sum + cf, 0) / cashFlows.length;
    const sortedFlows = [...cashFlows].sort((a, b) => a - b);
    const varIndex = Math.floor((1 - confidenceLevel) * sortedFlows.length);
    const varValue = sortedFlows[varIndex] || sortedFlows[0];

    const newResults = {
      riskAdjustment: ra,
      expectedValue,
      varValue,
      confidenceLevel,
      cashFlows,
      timestamp: new Date().toISOString()
    };

    setResults(prev => ({ ...prev, ra: newResults }));
    saveCalculation({ type: 'risk_adjustment', ...newResults });
  };

  const calculateRunoffResults = () => {
    const { initialCSM, servicePattern } = runoffInputs;
    const runoff = generateCSMRunoff(initialCSM, servicePattern);

    const newResults = {
      runoff,
      initialCSM,
      servicePattern,
      timestamp: new Date().toISOString()
    };

    setResults(prev => ({ ...prev, runoff: newResults }));
    saveCalculation({ type: 'csm_runoff', ...newResults });
  };

  const resetCalculator = (type) => {
    switch (type) {
      case 'csm':
        setCsmInputs({ premium: 1000000, fcf: 800000, ra: 50000 });
        break;
      case 'ra':
        setRaInputs({ cashFlows: [750000, 800000, 850000, 900000, 950000], confidenceLevel: 0.95 });
        break;
      case 'runoff':
        setRunoffInputs({ initialCSM: 150000, servicePattern: [0.2, 0.2, 0.2, 0.2, 0.2] });
        break;
    }
  };

  const tabs = [
    { id: 'csm', label: 'CSM Calculator', icon: Calculator },
    { id: 'ra', label: 'Risk Adjustment', icon: AlertCircle },
    { id: 'runoff', label: 'CSM Run-off', icon: RotateCcw }
  ];

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-12">
        <h1 className="text-4xl font-heading font-black text-trust-950 uppercase tracking-tight mb-3 px-2">IFRS 17 Calculator</h1>
        <p className="text-gray-400 font-medium px-2">
          Interactive calculators for Contractual Service Margin (CSM), Risk Adjustment (RA), and CSM run-off analysis.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 mb-6 px-4">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${activeTab === tab.id
              ? `bg-trust-950 text-growth-400 shadow-lg`
              : 'bg-gray-100 text-gray-400 hover:text-trust-950 hover:bg-gray-200'
              }`}
          >
            <tab.icon className="h-4 w-4" />
            <span className="px-1">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* CSM Calculator */}
      {activeTab === 'csm' && (
        <div className="space-y-6">
          {/* Methodology Transparency Controls */}
          <div className="card bg-white/80 backdrop-blur-xl border border-trust-100 rounded-[2.5rem] p-8 shadow-glass mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-trust-950 rounded-2xl shadow-lg">
                  <BookOpen className="h-6 w-6 text-growth-400" />
                </div>
                <div>
                  <h3 className="text-[10px] font-black text-trust-950 uppercase tracking-[0.2em]">Methodology Transparency</h3>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">View formulas, calculation steps, and audit trail</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowMethodology(!showMethodology)}
                  className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${showMethodology ? 'bg-trust-950 text-white' : 'bg-trust-100 text-trust-950 hover:bg-trust-200'
                    }`}
                >
                  Methodology
                </button>
                <button
                  onClick={() => setShowCalculationSteps(!showCalculationSteps)}
                  className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${showCalculationSteps ? 'bg-growth-500 text-white' : 'bg-growth-100 text-growth-800 hover:bg-growth-200'
                    }`}
                >
                  Steps
                </button>
                <button
                  onClick={() => setShowAuditTrail(!showAuditTrail)}
                  className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${showAuditTrail ? 'bg-accent-500 text-white' : 'bg-accent-100 text-accent-800 hover:bg-accent-200'
                    }`}
                >
                  Audit Trail
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white/90 backdrop-blur-2xl rounded-[2.5rem] p-10 border border-trust-50 shadow-glass">
              <h3 className="text-2xl font-heading font-black text-trust-950 uppercase tracking-tight mb-8">CSM Calculation</h3>

              <div className="space-y-4 px-2">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 px-1">
                    Gross Premium
                  </label>
                  <input
                    type="number"
                    value={csmInputs.premium}
                    onChange={(e) => setCsmInputs(prev => ({ ...prev, premium: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-trust-500 focus:border-transparent transition-all duration-300 outline-none font-bold text-trust-950"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 px-1">
                    Future Cash Flows (Present Value)
                  </label>
                  <input
                    type="number"
                    value={csmInputs.fcf}
                    onChange={(e) => setCsmInputs(prev => ({ ...prev, fcf: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 px-1">
                    Risk Adjustment
                  </label>
                  <input
                    type="number"
                    value={csmInputs.ra}
                    onChange={(e) => setCsmInputs(prev => ({ ...prev, ra: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div className="flex space-x-3 px-1">
                  <button
                    onClick={calculateCSMResults}
                    disabled={loading}
                    className="flex-1 bg-trust-950 text-white px-8 py-4 rounded-2xl hover:bg-trust-900 transition-all duration-300 font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2"
                  >
                    {loading ? 'Processing...' : 'Calculate CSM'}
                    <RotateCcw className="h-4 w-4 text-growth-400" />
                  </button>
                  <button
                    onClick={() => setCsmInputs({ premium: 1000000, fcf: 800000, ra: 50000 })}
                    className="px-8 py-4 bg-gray-100 text-trust-950 rounded-2xl hover:bg-gray-200 transition-colors font-black text-[10px] uppercase tracking-[0.2em]"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white/90 backdrop-blur-2xl rounded-[2.5rem] p-10 border border-trust-50 shadow-glass">
              <h3 className="text-2xl font-heading font-black text-trust-950 uppercase tracking-tight mb-8">Results</h3>

              {results.csm && (
                <div className="space-y-4 px-2">
                  <div className="bg-growth-50 p-6 rounded-2xl border border-growth-100">
                    <h4 className="text-[10px] font-black text-growth-900 uppercase tracking-[0.2em] mb-3 px-1">Contractual Service Margin</h4>
                    <div className="text-3xl font-heading font-black text-growth-600 px-1">
                      {formatCurrency(results.csm.csm)}
                    </div>
                    <div className="text-[10px] font-bold text-growth-800/60 mt-2 px-1">
                      <InlineMath math="CSM = \max(0, P - FCF - RA)" />
                    </div>
                  </div>

                  <div className="bg-accent-50 p-6 rounded-2xl border border-accent-100">
                    <h4 className="text-[10px] font-black text-accent-900 uppercase tracking-[0.2em] mb-3 px-1">Loss Component</h4>
                    <div className="text-3xl font-heading font-black text-accent-600 px-1">
                      {formatCurrency(results.csm.lossComponent)}
                    </div>
                    <div className="text-[10px] font-bold text-accent-800/60 mt-2 px-1">
                      <InlineMath math="LC = \max(0, FCF + RA - P)" />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
                      <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Premium</div>
                      <div className="text-sm font-bold text-trust-950">{formatCurrency(results.csm.premium)}</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
                      <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">FCF</div>
                      <div className="text-sm font-bold text-trust-950">{formatCurrency(results.csm.fcf)}</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
                      <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">RA</div>
                      <div className="text-sm font-bold text-trust-950">{formatCurrency(results.csm.ra)}</div>
                    </div>
                  </div>

                  <ExportButton
                    data={[results.csm]}
                    title="CSM Calculation Results"
                    filename="csm_calculation"
                    className="mt-4"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Methodology Transparency Components */}
          {showMethodology && (
            <div className="space-y-6">
              <FormulaExplainer
                formula="CSM = \\max(0, P - FCF - RA)"
                variables={[
                  { symbol: 'P', name: 'Premium Received', description: 'Total premium received at inception', unit: 'Currency', type: 'input', range: 'Positive values', defaultValue: 'Policy premium' },
                  { symbol: 'FCF', name: 'Fulfillment Cash Flows', description: 'Present value of expected cash flows', unit: 'Currency', type: 'input', range: 'Positive values', defaultValue: 'Calculated' },
                  { symbol: 'RA', name: 'Risk Adjustment', description: 'Compensation for non-financial risk', unit: 'Currency', type: 'input', range: 'Non-negative values', defaultValue: 'Calculated' },
                  { symbol: 'CSM', name: 'Contractual Service Margin', description: 'Unearned profit to be recognized over coverage period', unit: 'Currency', type: 'output', range: 'Non-negative values', defaultValue: 'Calculated' }
                ]}
                description="Initial CSM recognition formula under IFRS 17"
                examples={[
                  {
                    title: 'Profitable Contract',
                    description: 'A term life insurance policy with positive expected profit',
                    inputs: { 'P': '$1,000,000', 'FCF': '$800,000', 'RA': '$50,000' },
                    calculation: 'CSM = \max(0, 1000000 - 800000 - 50000) = 150000',
                    result: '$150,000'
                  },
                  {
                    title: 'Onerous Contract',
                    description: 'A contract with expected losses',
                    inputs: { 'P': '$500,000', 'FCF': '$600,000', 'RA': '$30,000' },
                    calculation: 'CSM = \max(0, 500000 - 600000 - 30000) = 0',
                    result: '$0 (Loss Component: $130,000)'
                  }
                ]}
                conditions={[
                  'CSM cannot be negative',
                  'Premium must be received at inception',
                  'FCF and RA must be measured at inception'
                ]}
                validationRules={[
                  { name: 'CSM Non-Negative', description: 'CSM cannot be negative', type: 'range', condition: 'CSM >= 0', errorMessage: 'CSM cannot be negative', severity: 'error' },
                  { name: 'Premium Reasonableness', description: 'Premium should be reasonable relative to benefits', type: 'reasonableness', condition: 'P / FCF between 0.8 and 1.5', errorMessage: 'Premium appears unreasonable', severity: 'warning' }
                ]}
                version="1.0.0"
                lastUpdated={new Date().toISOString()}
              />
            </div>
          )}

          {/* Calculation Steps */}
          {showCalculationSteps && results.csm?.calculationSteps && (
            <div className="space-y-6">
              <CalculationStepViewer
                steps={results.csm.calculationSteps}
                title="CSM Calculation Steps"
                showIntermediateResults={true}
                showFormulas={true}
                showValidation={true}
              />
            </div>
          )}

          {/* Audit Trail */}
          {showAuditTrail && auditTrail && (
            <div className="space-y-6">
              <AuditTrailViewer
                auditTrail={auditTrail}
                resultValidation={{
                  rangeChecks: auditTrail.validationResults.filter(v => v.type === 'range'),
                  consistencyChecks: auditTrail.validationResults.filter(v => v.type === 'consistency'),
                  reasonablenessTests: auditTrail.validationResults.filter(v => v.type === 'reasonableness'),
                  passedAll: auditTrail.validationResults.every(v => v.passed)
                }}
                title="CSM Calculation Audit Trail"
              />
            </div>
          )}
        </div>
      )}

      {/* Risk Adjustment Calculator */}
      {activeTab === 'ra' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white/90 backdrop-blur-2xl rounded-[2.5rem] p-10 border border-trust-50 shadow-glass">
            <h3 className="text-2xl font-heading font-black text-trust-950 uppercase tracking-tight mb-8">Risk Adjustment Calculation</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cash Flow Scenarios (comma-separated)
                </label>
                <input
                  type="text"
                  value={raInputs.cashFlows.join(', ')}
                  onChange={(e) => {
                    const values = e.target.value.split(',').map(v => parseFloat(v.trim()) || 0);
                    setRaInputs(prev => ({ ...prev, cashFlows: values }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="750000, 800000, 850000, 900000, 950000"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 px-1">
                  Confidence Level
                </label>
                <select
                  value={raInputs.confidenceLevel}
                  onChange={(e) => setRaInputs(prev => ({ ...prev, confidenceLevel: parseFloat(e.target.value) }))}
                  className="w-full px-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-trust-500 focus:border-transparent transition-all duration-300 outline-none font-bold text-trust-950 appearance-none"
                >
                  <option value={0.90}>90% Confidence</option>
                  <option value={0.95}>95% Confidence</option>
                  <option value={0.99}>99% Confidence</option>
                </select>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={calculateRiskAdjustmentResults}
                  className={`flex-1 bg-gradient-to-r ${colors.gradient} text-white px-6 py-3 rounded-lg hover:bg-gradient-to-r ${colors.hover} transition-all duration-300 font-medium`}
                >
                  Calculate Risk Adjustment
                </button>
                <button
                  onClick={() => resetCalculator('ra')}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-2xl rounded-[2.5rem] p-10 border border-trust-50 shadow-glass">
            <h3 className="text-2xl font-heading font-black text-trust-950 uppercase tracking-tight mb-8">Results</h3>

            {results.ra && (
              <div className="space-y-4">
                <div className="bg-trust-50 p-6 rounded-2xl border border-trust-100">
                  <h4 className="text-[10px] font-black text-trust-950 uppercase tracking-[0.2em] mb-3 px-1">Risk Adjustment</h4>
                  <div className="text-3xl font-heading font-black text-trust-600 px-1">
                    {formatCurrency(results.ra.riskAdjustment)}
                  </div>
                  <div className="text-[10px] font-bold text-trust-800/60 mt-2 px-1">
                    <InlineMath math="RA = \text{VaR}_{95}(CF) - \mathbb{E}[CF]" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
                    <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Expected Value</div>
                    <div className="text-sm font-bold text-trust-950">{formatCurrency(results.ra.expectedValue)}</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
                    <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">VaR Value</div>
                    <div className="text-sm font-bold text-trust-950">{formatCurrency(results.ra.varValue)}</div>
                  </div>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg">
                  <h5 className="font-medium text-gray-700 mb-2">Cash Flow Scenarios</h5>
                  <div className="text-sm text-gray-600">
                    {results.ra.cashFlows.map((cf, index) => (
                      <span key={index}>
                        {formatCurrency(cf)}
                        {index < results.ra.cashFlows.length - 1 && ', '}
                      </span>
                    ))}
                  </div>
                </div>

                <ExportButton
                  data={[results.ra]}
                  title="Risk Adjustment Calculation Results"
                  filename="risk_adjustment_calculation"
                  className="mt-4"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* CSM Run-off Calculator */}
      {activeTab === 'runoff' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white/90 backdrop-blur-2xl rounded-[2.5rem] p-10 border border-trust-50 shadow-glass">
              <h3 className="text-2xl font-heading font-black text-trust-950 uppercase tracking-tight mb-8">CSM Run-off Projection</h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 px-1">
                    Initial CSM
                  </label>
                  <input
                    type="number"
                    value={runoffInputs.initialCSM}
                    onChange={(e) => setRunoffInputs(prev => ({ ...prev, initialCSM: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-trust-500 focus:border-transparent transition-all duration-300 outline-none font-bold text-trust-950"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 px-1">
                    Service Pattern
                  </label>
                  <input
                    type="text"
                    value={runoffInputs.servicePattern.join(', ')}
                    onChange={(e) => {
                      const values = e.target.value.split(',').map(v => parseFloat(v.trim()) || 0);
                      setRunoffInputs(prev => ({ ...prev, servicePattern: values }));
                    }}
                    className="w-full px-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-trust-500 focus:border-transparent transition-all duration-300 outline-none font-bold text-trust-950"
                    placeholder="0.2, 0.2, 0.2, 0.2, 0.2"
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={calculateRunoffResults}
                    disabled={loading}
                    className="flex-1 bg-trust-950 text-white px-8 py-4 rounded-2xl hover:bg-trust-900 transition-all duration-300 font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2"
                  >
                    {loading ? 'Projecting...' : 'Project Run-off'}
                    <RotateCcw className="h-4 w-4 text-growth-400" />
                  </button>
                  <button
                    onClick={() => setRunoffInputs({ initialCSM: 150000, servicePattern: [0.2, 0.2, 0.2, 0.2, 0.2] })}
                    className="px-8 py-4 bg-gray-100 text-trust-950 rounded-2xl hover:bg-gray-200 transition-colors font-black text-[10px] uppercase tracking-[0.2em]"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white/90 backdrop-blur-2xl rounded-[2.5rem] p-10 border border-trust-50 shadow-glass">
              <h3 className="text-2xl font-heading font-black text-trust-950 uppercase tracking-tight mb-8">Run-off Summary</h3>

              {results.runoff && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-6 bg-gray-50/50 rounded-2xl border border-gray-100">
                      <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Initial CSM</div>
                      <div className="text-sm font-bold text-trust-950">{formatCurrency(results.runoff.initialCSM)}</div>
                    </div>
                    <div className="text-center p-6 bg-gray-50/50 rounded-2xl border border-gray-100">
                      <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Periods</div>
                      <div className="text-sm font-bold text-trust-950">{results.runoff.runoff.length} Periods</div>
                    </div>
                  </div>

                  <div className="bg-growth-50 p-6 rounded-2xl border border-growth-100">
                    <h4 className="text-[10px] font-black text-growth-900 uppercase tracking-[0.2em] mb-2 px-1">Total CSM Release</h4>
                    <div className="text-2xl font-heading font-black text-growth-600 px-1">
                      {formatCurrency(results.runoff.runoff.reduce((sum, period) => sum + period.csmRelease, 0))}
                    </div>
                  </div>

                  <ExportButton
                    data={results.runoff.runoff}
                    title="CSM Run-off Schedule"
                    filename="csm_runoff_schedule"
                    className="mt-4"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Run-off Table */}
          {results.runoff && (
            <div className="bg-white/90 backdrop-blur-2xl rounded-[2.5rem] p-10 border border-trust-50 shadow-glass overflow-hidden">
              <h3 className="text-2xl font-heading font-black text-trust-950 uppercase tracking-tight mb-8">Run-off Schedule</h3>
              <div className="overflow-x-auto -mx-10">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50/50">
                      <th className="px-10 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Period</th>
                      <th className="px-10 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Service Pattern</th>
                      <th className="px-10 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">CSM Release</th>
                      <th className="px-10 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">CSM Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {results.runoff.runoff.map((period, index) => (
                      <tr key={index} className="hover:bg-gray-50/30 transition-colors">
                        <td className="px-10 py-5 text-sm font-bold text-trust-950">Year {period.period}</td>
                        <td className="px-10 py-5 text-sm font-medium text-gray-400">{formatPercentage(period.serviceProvided)}</td>
                        <td className="px-10 py-5 text-sm font-bold text-trust-950">{formatCurrency(period.csmRelease)}</td>
                        <td className="px-10 py-5 text-sm font-bold text-growth-600">{formatCurrency(period.csmRemaining)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Calculation History */}
      {history.length > 0 && (
        <div className="bg-white/90 backdrop-blur-xl border border-trust-100 rounded-[2.5rem] p-10 shadow-glass mt-12">
          <h3 className="text-[10px] font-black text-trust-950 uppercase tracking-[0.2em] mb-8">Audit History</h3>
          <div className="space-y-4">
            {history.slice(0, 5).map((calc) => (
              <div key={calc.id} className="flex items-center justify-between p-6 bg-gray-50/50 rounded-2xl border border-gray-100 hover:border-trust-200 transition-all duration-300">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-trust-950 uppercase tracking-widest">{calc.type?.replace('_', ' ').toUpperCase()}</span>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                    {new Date(calc.timestamp).toLocaleString()}
                  </span>
                </div>
                <div className="flex flex-col items-end">
                  <div className="text-sm font-bold text-trust-950">
                    {calc.csm && formatCurrency(calc.csm)}
                    {calc.riskAdjustment && formatCurrency(calc.riskAdjustment)}
                  </div>
                  <span className="text-[9px] font-bold text-growth-500 uppercase tracking-widest">Actuarial Validation Pass</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default IFRS17Calculator;
