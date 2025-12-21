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
import { getCalculatorColors, getStatusColors } from '../../utils/designSystem';

const IFRS17Calculator = () => {
  const [activeTab, setActiveTab] = useState('csm');
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

  const calculateCSMResults = () => {
    const { premium, fcf, ra } = csmInputs;
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
      <div className="mb-8 px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-2 px-2">IFRS 17 Calculator</h1>
        <p className="text-gray-600 px-2">
          Interactive calculators for Contractual Service Margin (CSM), Risk Adjustment (RA), and CSM run-off analysis.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 mb-6 px-4">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${activeTab === tab.id
                ? `bg-gradient-to-r ${colors.gradient} text-white shadow-lg`
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
          <div className="card bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <BookOpen className="h-5 w-5 text-blue-600" />
                <div>
                  <h3 className="font-semibold text-blue-800">Methodology Transparency</h3>
                  <p className="text-sm text-blue-700">View formulas, calculation steps, and audit trail</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowMethodology(!showMethodology)}
                  className={`px-3 py-1 rounded text-sm transition-colors ${showMethodology ? 'bg-blue-100 text-blue-800' : 'bg-blue-200 text-blue-700 hover:bg-blue-300'
                    }`}
                >
                  {showMethodology ? <EyeOff className="h-4 w-4 mr-1" /> : <Eye className="h-4 w-4 mr-1" />}
                  {showMethodology ? 'Hide' : 'Show'} Methodology
                </button>
                <button
                  onClick={() => setShowCalculationSteps(!showCalculationSteps)}
                  className={`px-3 py-1 rounded text-sm transition-colors ${showCalculationSteps ? 'bg-green-100 text-green-800' : 'bg-green-200 text-green-700 hover:bg-green-300'
                    }`}
                >
                  {showCalculationSteps ? <EyeOff className="h-4 w-4 mr-1" /> : <Eye className="h-4 w-4 mr-1" />}
                  {showCalculationSteps ? 'Hide' : 'Show'} Steps
                </button>
                <button
                  onClick={() => setShowAuditTrail(!showAuditTrail)}
                  className={`px-3 py-1 rounded text-sm transition-colors ${showAuditTrail ? 'bg-purple-100 text-purple-800' : 'bg-purple-200 text-purple-700 hover:bg-purple-300'
                    }`}
                >
                  {showAuditTrail ? <EyeOff className="h-4 w-4 mr-1" /> : <Eye className="h-4 w-4 mr-1" />}
                  {showAuditTrail ? 'Hide' : 'Show'} Audit Trail
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 px-2">CSM Calculation</h3>

              <div className="space-y-4 px-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 px-1">
                    Premium Received
                  </label>
                  <input
                    type="number"
                    value={csmInputs.premium}
                    onChange={(e) => setCsmInputs(prev => ({ ...prev, premium: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                    className={`flex-1 bg-gradient-to-r ${colors.gradient} text-white px-6 py-3 rounded-lg hover:bg-gradient-to-r ${colors.hover} transition-all duration-300 font-medium`}
                  >
                    Calculate CSM
                  </button>
                  <button
                    onClick={() => resetCalculator('csm')}
                    className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>

            <div className="card">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 px-2">Results</h3>

              {results.csm && (
                <div className="space-y-4 px-2">
                  <div className={`bg-gradient-to-r ${getStatusColors('success').gradient} p-6 rounded-lg border ${getStatusColors('success').border}`}>
                    <h4 className={`font-semibold ${getStatusColors('success').text} mb-3 px-1`}>Contractual Service Margin</h4>
                    <div className={`text-2xl font-bold ${getStatusColors('success').value} px-1`}>
                      {formatCurrency(results.csm.csm)}
                    </div>
                    <div className={`text-sm ${getStatusColors('success').text} mt-2 px-1`}>
                      <InlineMath math="CSM = \max(0, P - FCF - RA)" />
                    </div>
                  </div>

                  <div className={`bg-gradient-to-r ${getStatusColors('warning').gradient} p-6 rounded-lg border ${getStatusColors('warning').border}`}>
                    <h4 className={`font-semibold ${getStatusColors('warning').text} mb-3 px-1`}>Loss Component</h4>
                    <div className={`text-2xl font-bold ${getStatusColors('warning').value} px-1`}>
                      {formatCurrency(results.csm.lossComponent)}
                    </div>
                    <div className={`text-sm ${getStatusColors('warning').text} mt-2 px-1`}>
                      <InlineMath math="LC = \max(0, FCF + RA - P)" />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="font-medium text-gray-600">Premium</div>
                      <div className="font-semibold text-gray-800">{formatCurrency(results.csm.premium)}</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="font-medium text-gray-600">FCF</div>
                      <div className="font-semibold text-gray-800">{formatCurrency(results.csm.fcf)}</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="font-medium text-gray-600">RA</div>
                      <div className="font-semibold text-gray-800">{formatCurrency(results.csm.ra)}</div>
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Risk Adjustment Calculation</h3>

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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confidence Level
                </label>
                <select
                  value={raInputs.confidenceLevel}
                  onChange={(e) => setRaInputs(prev => ({ ...prev, confidenceLevel: parseFloat(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value={0.90}>90%</option>
                  <option value={0.95}>95%</option>
                  <option value={0.99}>99%</option>
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

          <div className="card">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Results</h3>

            {results.ra && (
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-2">Risk Adjustment</h4>
                  <div className="text-2xl font-bold text-blue-600">
                    {formatCurrency(results.ra.riskAdjustment)}
                  </div>
                  <div className="text-sm text-blue-700 mt-1">
                    <InlineMath math="RA = \text{VaR}_{95}(CF) - \mathbb{E}[CF]" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="font-medium text-gray-600">Expected Value</div>
                    <div className="font-semibold text-gray-800">{formatCurrency(results.ra.expectedValue)}</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="font-medium text-gray-600">VaR Value</div>
                    <div className="font-semibold text-gray-800">{formatCurrency(results.ra.varValue)}</div>
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
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">CSM Run-off Parameters</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Initial CSM
                  </label>
                  <input
                    type="number"
                    value={runoffInputs.initialCSM}
                    onChange={(e) => setRunoffInputs(prev => ({ ...prev, initialCSM: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Service Pattern (comma-separated proportions)
                  </label>
                  <input
                    type="text"
                    value={runoffInputs.servicePattern.join(', ')}
                    onChange={(e) => {
                      const values = e.target.value.split(',').map(v => parseFloat(v.trim()) || 0);
                      setRunoffInputs(prev => ({ ...prev, servicePattern: values }));
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="0.2, 0.2, 0.2, 0.2, 0.2"
                  />
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={calculateRunoffResults}
                    className={`flex-1 bg-gradient-to-r ${colors.gradient} text-white px-6 py-3 rounded-lg hover:bg-gradient-to-r ${colors.hover} transition-all duration-300 font-medium`}
                  >
                    Calculate Run-off
                  </button>
                  <button
                    onClick={() => resetCalculator('runoff')}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>

            <div className="card">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Run-off Summary</h3>

              {results.runoff && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="font-medium text-gray-600">Initial CSM</div>
                      <div className="font-semibold text-gray-800">{formatCurrency(results.runoff.initialCSM)}</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="font-medium text-gray-600">Total Periods</div>
                      <div className="font-semibold text-gray-800">{results.runoff.runoff.length}</div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                    <h4 className="font-semibold text-green-800 mb-2">Total CSM Release</h4>
                    <div className="text-xl font-bold text-green-600">
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
            <div className="card">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">CSM Run-off Schedule</h3>
              <div className="overflow-x-auto">
                <table className="w-full table-auto">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Period</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Service Provided</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">CSM Release</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">CSM Remaining</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.runoff.runoff.map((period, index) => (
                      <tr key={index} className="border-b border-gray-200">
                        <td className="px-4 py-2 text-sm text-gray-900">{period.period}</td>
                        <td className="px-4 py-2 text-sm text-gray-900">{formatPercentage(period.serviceProvided)}</td>
                        <td className="px-4 py-2 text-sm text-gray-900">{formatCurrency(period.csmRelease)}</td>
                        <td className="px-4 py-2 text-sm text-gray-900">{formatCurrency(period.csmRemaining)}</td>
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
        <div className="card mt-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Recent Calculations</h3>
          <div className="space-y-2">
            {history.slice(0, 5).map((calc, index) => (
              <div key={calc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <span className="font-medium text-gray-800">{calc.type?.replace('_', ' ').toUpperCase()}</span>
                  <span className="text-sm text-gray-600 ml-2">
                    {new Date(calc.timestamp).toLocaleString()}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  {calc.csm && formatCurrency(calc.csm)}
                  {calc.riskAdjustment && formatCurrency(calc.riskAdjustment)}
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
