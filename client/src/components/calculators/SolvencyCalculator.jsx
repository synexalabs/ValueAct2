"use client";

/**
 * Solvency II Calculator Component
 * Provides interactive calculators for SCR, MCR, and solvency ratio calculations
 */

import React, { useState } from 'react';
import { Shield, Calculator, TrendingUp, AlertTriangle } from 'lucide-react';
import { InlineMath, BlockMath } from 'react-katex';
import ExportButton from '../ExportButton';
import { useCalculationHistory } from '../../hooks/useLocalStorage';
import { 
  calculateSCR, 
  calculateMCR, 
  calculateSolvencyRatio, 
  calculateCapitalAnalysis,
  calculateRiskContributions,
  calculateDiversificationBenefit
} from '../../utils/solvencyCalculations';
import { formatCurrency, formatPercentage, formatNumber } from '../../utils/formatters';
import { getCalculatorColors, getStatusColors } from '../../utils/designSystem';

const SolvencyCalculator = () => {
  const [activeTab, setActiveTab] = useState('scr');
  const { history, saveCalculation } = useCalculationHistory('solvency');
  const colors = getCalculatorColors('solvency');

  // SCR Calculator State
  const [scrInputs, setScrInputs] = useState({
    marketRisk: 500000,
    counterpartyRisk: 200000,
    lifeUnderwritingRisk: 300000,
    healthUnderwritingRisk: 150000,
    nonLifeUnderwritingRisk: 100000,
    operationalRisk: 250000
  });

  // MCR Calculator State
  const [mcrInputs, setMcrInputs] = useState({
    technicalProvisions: 10000000,
    premiumWritten: 5000000,
    claimsPaid: 3000000
  });

  // Solvency Ratio Calculator State
  const [ratioInputs, setRatioInputs] = useState({
    ownFunds: 2000000,
    scr: 1500000,
    mcr: 2500000
  });

  // Results state
  const [results, setResults] = useState({});

  const calculateSCRResults = () => {
    const scr = calculateSCR(scrInputs);
    const contributions = calculateRiskContributions(scrInputs);
    const diversification = calculateDiversificationBenefit(scrInputs);
    
    const newResults = {
      scr,
      contributions,
      diversification,
      riskModules: scrInputs,
      timestamp: new Date().toISOString()
    };
    
    setResults(prev => ({ ...prev, scr: newResults }));
    saveCalculation({ type: 'scr', ...newResults });
  };

  const calculateMCRResults = () => {
    const { technicalProvisions, premiumWritten, claimsPaid } = mcrInputs;
    const mcr = calculateMCR(technicalProvisions, premiumWritten, claimsPaid);
    
    const newResults = {
      mcr,
      technicalProvisions,
      premiumWritten,
      claimsPaid,
      timestamp: new Date().toISOString()
    };
    
    setResults(prev => ({ ...prev, mcr: newResults }));
    saveCalculation({ type: 'mcr', ...newResults });
  };

  const calculateRatioResults = () => {
    const { ownFunds, scr, mcr } = ratioInputs;
    const solvencyRatio = calculateSolvencyRatio(ownFunds, scr);
    const capitalAnalysis = calculateCapitalAnalysis(ownFunds, scr, mcr);
    
    const newResults = {
      solvencyRatio,
      capitalAnalysis,
      ownFunds,
      scr,
      mcr,
      timestamp: new Date().toISOString()
    };
    
    setResults(prev => ({ ...prev, ratio: newResults }));
    saveCalculation({ type: 'solvency_ratio', ...newResults });
  };

  const resetCalculator = (type) => {
    switch (type) {
      case 'scr':
        setScrInputs({
          marketRisk: 500000,
          counterpartyRisk: 200000,
          lifeUnderwritingRisk: 300000,
          healthUnderwritingRisk: 150000,
          nonLifeUnderwritingRisk: 100000,
          operationalRisk: 250000
        });
        break;
      case 'mcr':
        setMcrInputs({
          technicalProvisions: 10000000,
          premiumWritten: 5000000,
          claimsPaid: 3000000
        });
        break;
      case 'ratio':
        setRatioInputs({
          ownFunds: 2000000,
          scr: 1500000,
          mcr: 2500000
        });
        break;
    }
  };

  const tabs = [
    { id: 'scr', label: 'SCR Calculator', icon: Shield },
    { id: 'mcr', label: 'MCR Calculator', icon: AlertTriangle },
    { id: 'ratio', label: 'Solvency Ratio', icon: TrendingUp }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-50 border-green-200';
      case 'good': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'adequate': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'insufficient': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8 px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-2 px-2">Solvency II Calculator</h1>
        <p className="text-gray-600 px-2">
          Interactive calculators for Solvency Capital Requirement (SCR), Minimum Capital Requirement (MCR), and solvency ratio analysis.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 mb-6 px-4">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
              activeTab === tab.id
                ? `bg-gradient-to-r ${colors.gradient} text-white shadow-lg`
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            <span className="px-1">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* SCR Calculator */}
      {activeTab === 'scr' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 px-4">
          <div className="card">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 px-2">Risk Module Inputs</h3>
            
            <div className="space-y-4 px-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 px-1">
                  Market Risk
                </label>
                <input
                  type="number"
                  value={scrInputs.marketRisk}
                  onChange={(e) => setScrInputs(prev => ({ ...prev, marketRisk: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 px-1">
                  Counterparty Risk
                </label>
                <input
                  type="number"
                  value={scrInputs.counterpartyRisk}
                  onChange={(e) => setScrInputs(prev => ({ ...prev, counterpartyRisk: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 px-1">
                  Life Underwriting Risk
                </label>
                <input
                  type="number"
                  value={scrInputs.lifeUnderwritingRisk}
                  onChange={(e) => setScrInputs(prev => ({ ...prev, lifeUnderwritingRisk: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 px-1">
                  Health Underwriting Risk
                </label>
                <input
                  type="number"
                  value={scrInputs.healthUnderwritingRisk}
                  onChange={(e) => setScrInputs(prev => ({ ...prev, healthUnderwritingRisk: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 px-1">
                  Non-Life Underwriting Risk
                </label>
                <input
                  type="number"
                  value={scrInputs.nonLifeUnderwritingRisk}
                  onChange={(e) => setScrInputs(prev => ({ ...prev, nonLifeUnderwritingRisk: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 px-1">
                  Operational Risk
                </label>
                <input
                  type="number"
                  value={scrInputs.operationalRisk}
                  onChange={(e) => setScrInputs(prev => ({ ...prev, operationalRisk: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex space-x-3 px-1">
                <button
                  onClick={calculateSCRResults}
                  className={`flex-1 bg-gradient-to-r ${colors.gradient} text-white px-6 py-3 rounded-lg hover:bg-gradient-to-r ${colors.hover} transition-all duration-300 font-medium`}
                >
                  Calculate SCR
                </button>
                <button
                  onClick={() => resetCalculator('scr')}
                  className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 px-2">SCR Results</h3>
            
            {results.scr && (
              <div className="space-y-4 px-2">
                <div className={`bg-gradient-to-r ${getStatusColors('info').gradient} p-6 rounded-lg border ${getStatusColors('info').border}`}>
                  <h4 className={`font-semibold ${getStatusColors('info').text} mb-3 px-1`}>Total SCR</h4>
                  <div className={`text-2xl font-bold ${getStatusColors('info').value} px-1`}>
                    {formatCurrency(results.scr.scr)}
                  </div>
                  <div className={`text-sm ${getStatusColors('info').text} mt-2 px-1`}>
                    <InlineMath math="SCR = \sqrt{\sum_{i} SCR_i^2 + \sum_{i \neq j} \rho_{ij} SCR_i SCR_j}" />
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                  <h4 className="font-semibold text-green-800 mb-2">Diversification Benefit</h4>
                  <div className="text-xl font-bold text-green-600">
                    {formatCurrency(results.scr.diversification.diversificationBenefit)}
                  </div>
                  <div className="text-sm text-green-700">
                    {formatPercentage(results.scr.diversification.diversificationPercent / 100)} reduction
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h5 className="font-medium text-gray-700">Risk Contributions</h5>
                  {results.scr.contributions.map((contribution, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="text-sm text-gray-700 capitalize">
                        {contribution.riskType.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-gray-800">
                          {formatCurrency(contribution.contributionAmount)}
                        </div>
                        <div className="text-xs text-gray-600">
                          {formatPercentage(contribution.contribution / 100)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <ExportButton
                  data={[results.scr]}
                  title="SCR Calculation Results"
                  filename="scr_calculation"
                  className="mt-4"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* MCR Calculator */}
      {activeTab === 'mcr' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">MCR Calculation</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Technical Provisions
                </label>
                <input
                  type="number"
                  value={mcrInputs.technicalProvisions}
                  onChange={(e) => setMcrInputs(prev => ({ ...prev, technicalProvisions: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Premium Written
                </label>
                <input
                  type="number"
                  value={mcrInputs.premiumWritten}
                  onChange={(e) => setMcrInputs(prev => ({ ...prev, premiumWritten: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Claims Paid
                </label>
                <input
                  type="number"
                  value={mcrInputs.claimsPaid}
                  onChange={(e) => setMcrInputs(prev => ({ ...prev, claimsPaid: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={calculateMCRResults}
                  className={`flex-1 bg-gradient-to-r ${colors.gradient} text-white px-6 py-3 rounded-lg hover:bg-gradient-to-r ${colors.hover} transition-all duration-300 font-medium`}
                >
                  Calculate MCR
                </button>
                <button
                  onClick={() => resetCalculator('mcr')}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">MCR Results</h3>
            
            {results.mcr && (
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-lg border border-orange-200">
                  <h4 className="font-semibold text-orange-800 mb-2">Minimum Capital Requirement</h4>
                  <div className="text-2xl font-bold text-orange-600">
                    {formatCurrency(results.mcr.mcr)}
                  </div>
                  <div className="text-sm text-orange-700 mt-1">
                    <InlineMath math="MCR = \max(TP \times 25\%, PW \times 15\%, CP \times 10\%)" />
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="font-medium text-gray-600">TP × 25%</div>
                    <div className="font-semibold text-gray-800">
                      {formatCurrency(results.mcr.technicalProvisions * 0.25)}
                    </div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="font-medium text-gray-600">PW × 15%</div>
                    <div className="font-semibold text-gray-800">
                      {formatCurrency(results.mcr.premiumWritten * 0.15)}
                    </div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="font-medium text-gray-600">CP × 10%</div>
                    <div className="font-semibold text-gray-800">
                      {formatCurrency(results.mcr.claimsPaid * 0.10)}
                    </div>
                  </div>
                </div>
                
                <ExportButton
                  data={[results.mcr]}
                  title="MCR Calculation Results"
                  filename="mcr_calculation"
                  className="mt-4"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Solvency Ratio Calculator */}
      {activeTab === 'ratio' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Solvency Ratio Inputs</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Own Funds
                </label>
                <input
                  type="number"
                  value={ratioInputs.ownFunds}
                  onChange={(e) => setRatioInputs(prev => ({ ...prev, ownFunds: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SCR
                </label>
                <input
                  type="number"
                  value={ratioInputs.scr}
                  onChange={(e) => setRatioInputs(prev => ({ ...prev, scr: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  MCR
                </label>
                <input
                  type="number"
                  value={ratioInputs.mcr}
                  onChange={(e) => setRatioInputs(prev => ({ ...prev, mcr: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={calculateRatioResults}
                  className={`flex-1 bg-gradient-to-r ${colors.gradient} text-white px-6 py-3 rounded-lg hover:bg-gradient-to-r ${colors.hover} transition-all duration-300 font-medium`}
                >
                  Calculate Ratio
                </button>
                <button
                  onClick={() => resetCalculator('ratio')}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Solvency Analysis</h3>
            
            {results.ratio && (
              <div className="space-y-4">
                <div className={`p-4 rounded-lg border ${getStatusColor(results.ratio.solvencyRatio.status)}`}>
                  <h4 className="font-semibold mb-2">Solvency Ratio</h4>
                  <div className="text-2xl font-bold">
                    {formatRatio(results.ratio.solvencyRatio.ratio)}
                  </div>
                  <div className="text-sm mt-1 capitalize">
                    Status: {results.ratio.solvencyRatio.status}
                  </div>
                  <div className="text-sm mt-1">
                    <InlineMath math="SR = \frac{\text{Own Funds}}{SCR} \times 100\%" />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="font-medium text-gray-600">SCR Surplus</div>
                    <div className={`font-semibold ${results.ratio.capitalAnalysis.scrSurplus >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(results.ratio.capitalAnalysis.scrSurplus)}
                    </div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="font-medium text-gray-600">MCR Surplus</div>
                    <div className={`font-semibold ${results.ratio.capitalAnalysis.mcrSurplus >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(results.ratio.capitalAnalysis.mcrSurplus)}
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-3 rounded-lg">
                  <h5 className="font-medium text-gray-700 mb-2">Compliance Status</h5>
                  <div className="space-y-1 text-sm">
                    <div className={`flex justify-between ${results.ratio.capitalAnalysis.isSCRCompliant ? 'text-green-600' : 'text-red-600'}`}>
                      <span>SCR Compliance:</span>
                      <span>{results.ratio.capitalAnalysis.isSCRCompliant ? '✓ Compliant' : '✗ Non-compliant'}</span>
                    </div>
                    <div className={`flex justify-between ${results.ratio.capitalAnalysis.isMCRCompliant ? 'text-green-600' : 'text-red-600'}`}>
                      <span>MCR Compliance:</span>
                      <span>{results.ratio.capitalAnalysis.isMCRCompliant ? '✓ Compliant' : '✗ Non-compliant'}</span>
                    </div>
                  </div>
                </div>
                
                <ExportButton
                  data={[results.ratio]}
                  title="Solvency Ratio Analysis"
                  filename="solvency_ratio_analysis"
                  className="mt-4"
                />
              </div>
            )}
          </div>
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
                  {calc.scr && formatCurrency(calc.scr)}
                  {calc.mcr && formatCurrency(calc.mcr)}
                  {calc.solvencyRatio && formatRatio(calc.solvencyRatio.ratio)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SolvencyCalculator;
