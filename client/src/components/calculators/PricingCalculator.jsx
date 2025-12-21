"use client";

/**
 * Pricing Calculator Component
 * Provides interactive calculators for premium calculation, profit testing, and sensitivity analysis
 */

import React, { useState } from 'react';
import { DollarSign, Calculator, TrendingUp, BarChart3 } from 'lucide-react';
import { InlineMath, BlockMath } from 'react-katex';
import ExportButton from '../ExportButton';
import { useCalculationHistory } from '../../hooks/useLocalStorage';
import { 
  calculateNetPremium,
  calculateGrossPremium,
  calculateNPV,
  calculateIRR,
  calculateBreakEvenPremium,
  performSensitivityAnalysis,
  calculateProfitTestingMetrics
} from '../../utils/pricingCalculations';
import { formatCurrency, formatPercentage, formatNumber } from '../../utils/formatters';
import { getCalculatorColors, getStatusColors } from '../../utils/designSystem';

const PricingCalculator = () => {
  const [activeTab, setActiveTab] = useState('premium');
  const { history, saveCalculation } = useCalculationHistory('pricing');
  const colors = getCalculatorColors('pricing');

  // Premium Calculator State
  const [premiumInputs, setPremiumInputs] = useState({
    sumAssured: 100000,
    age: 35,
    term: 20,
    gender: 'M',
    mortalityRate: 0.002,
    interestRate: 0.03,
    expenseRatio: 0.15,
    profitMargin: 0.05
  });

  // Profit Testing State
  const [profitInputs, setProfitInputs] = useState({
    premium: 5000,
    sumAssured: 100000,
    age: 35,
    term: 20,
    mortalityRate: 0.002,
    interestRate: 0.03,
    expenseRatio: 0.15,
    initialExpenses: 2000,
    renewalExpenses: 500
  });

  // Sensitivity Analysis State
  const [sensitivityInputs, setSensitivityInputs] = useState({
    baseAssumptions: {
      sumAssured: 100000,
      age: 35,
      term: 20,
      mortalityRate: 0.002,
      interestRate: 0.03,
      expenseRatio: 0.15,
      targetProfitMargin: 0.05
    },
    sensitivityRanges: {
      mortalityRate: { min: 0.001, max: 0.005, steps: 5 },
      interestRate: { min: 0.01, max: 0.05, steps: 5 },
      expenseRatio: { min: 0.10, max: 0.20, steps: 5 }
    }
  });

  // Results state
  const [results, setResults] = useState({});

  const calculatePremiumResults = () => {
    const { sumAssured, age, term, gender, mortalityRate, interestRate, expenseRatio, profitMargin } = premiumInputs;
    
    // Use proper mortality table and gender parameters
    const netPremium = calculateNetPremium(sumAssured, age, term, 'CSO_2017', gender, interestRate);
    const grossPremium = calculateGrossPremium(netPremium, expenseRatio, profitMargin);
    
    const newResults = {
      netPremium,
      grossPremium,
      sumAssured,
      age,
      term,
      gender,
      mortalityRate,
      interestRate,
      expenseRatio,
      profitMargin,
      timestamp: new Date().toISOString()
    };
    
    setResults(prev => ({ ...prev, premium: newResults }));
    saveCalculation({ type: 'premium', ...newResults });
  };

  const calculateProfitTestingResults = () => {
    const profitMetrics = calculateProfitTestingMetrics(profitInputs);
    
    const newResults = {
      ...profitMetrics,
      inputs: profitInputs,
      timestamp: new Date().toISOString()
    };
    
    setResults(prev => ({ ...prev, profit: newResults }));
    saveCalculation({ type: 'profit_testing', ...newResults });
  };

  const calculateSensitivityResults = () => {
    const { baseAssumptions, sensitivityRanges } = sensitivityInputs;
    const sensitivityResults = performSensitivityAnalysis(baseAssumptions, sensitivityRanges);
    
    const newResults = {
      sensitivityResults,
      baseAssumptions,
      sensitivityRanges,
      timestamp: new Date().toISOString()
    };
    
    setResults(prev => ({ ...prev, sensitivity: newResults }));
    saveCalculation({ type: 'sensitivity', ...newResults });
  };

  const resetCalculator = (type) => {
    switch (type) {
      case 'premium':
        setPremiumInputs({
          sumAssured: 100000,
          age: 35,
          term: 20,
          gender: 'M',
          mortalityRate: 0.002,
          interestRate: 0.03,
          expenseRatio: 0.15,
          profitMargin: 0.05
        });
        break;
      case 'profit':
        setProfitInputs({
          premium: 5000,
          sumAssured: 100000,
          age: 35,
          term: 20,
          mortalityRate: 0.002,
          interestRate: 0.03,
          expenseRatio: 0.15,
          initialExpenses: 2000,
          renewalExpenses: 500
        });
        break;
      case 'sensitivity':
        setSensitivityInputs({
          baseAssumptions: {
            sumAssured: 100000,
            age: 35,
            term: 20,
            mortalityRate: 0.002,
            interestRate: 0.03,
            expenseRatio: 0.15,
            targetProfitMargin: 0.05
          },
          sensitivityRanges: {
            mortalityRate: { min: 0.001, max: 0.005, steps: 5 },
            interestRate: { min: 0.01, max: 0.05, steps: 5 },
            expenseRatio: { min: 0.10, max: 0.20, steps: 5 }
          }
        });
        break;
    }
  };

  const tabs = [
    { id: 'premium', label: 'Premium Calculator', icon: DollarSign },
    { id: 'profit', label: 'Profit Testing', icon: BarChart3 },
    { id: 'sensitivity', label: 'Sensitivity Analysis', icon: TrendingUp }
  ];

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8 px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-2 px-2">Pricing Calculator</h1>
        <p className="text-gray-600 px-2">
          Interactive calculators for premium calculation, profit testing, and sensitivity analysis for life insurance products.
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

      {/* Premium Calculator */}
      {activeTab === 'premium' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 px-4">
          <div className="card">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 px-2">Premium Calculation</h3>
            
            <div className="space-y-4 px-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 px-1">
                  Sum Assured
                </label>
                <input
                  type="number"
                  value={premiumInputs.sumAssured}
                  onChange={(e) => setPremiumInputs(prev => ({ ...prev, sumAssured: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 px-1">
                    Age
                  </label>
                  <input
                    type="number"
                    value={premiumInputs.age}
                    onChange={(e) => setPremiumInputs(prev => ({ ...prev, age: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 px-1">
                    Term (years)
                  </label>
                  <input
                    type="number"
                    value={premiumInputs.term}
                    onChange={(e) => setPremiumInputs(prev => ({ ...prev, term: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 px-1">
                    Gender
                  </label>
                  <select
                    value={premiumInputs.gender}
                    onChange={(e) => setPremiumInputs(prev => ({ ...prev, gender: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 px-1">
                    Mortality Rate
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    value={premiumInputs.mortalityRate}
                    onChange={(e) => setPremiumInputs(prev => ({ ...prev, mortalityRate: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 px-1">
                    Interest Rate
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    value={premiumInputs.interestRate}
                    onChange={(e) => setPremiumInputs(prev => ({ ...prev, interestRate: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 px-1">
                    Expense Ratio
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={premiumInputs.expenseRatio}
                    onChange={(e) => setPremiumInputs(prev => ({ ...prev, expenseRatio: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 px-1">
                    Profit Margin
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={premiumInputs.profitMargin}
                    onChange={(e) => setPremiumInputs(prev => ({ ...prev, profitMargin: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="flex space-x-3 px-1">
                <button
                  onClick={calculatePremiumResults}
                  className={`flex-1 bg-gradient-to-r ${colors.gradient} text-white px-6 py-3 rounded-lg hover:bg-gradient-to-r ${colors.hover} transition-all duration-300 font-medium`}
                >
                  Calculate Premium
                </button>
                <button
                  onClick={() => resetCalculator('premium')}
                  className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 px-2">Premium Results</h3>
            
            {results.premium && (
              <div className="space-y-4 px-2">
                <div className={`bg-gradient-to-r ${getStatusColors('success').gradient} p-6 rounded-lg border ${getStatusColors('success').border}`}>
                  <h4 className={`font-semibold ${getStatusColors('success').text} mb-3 px-1`}>Net Premium</h4>
                  <div className={`text-2xl font-bold ${getStatusColors('success').value} px-1`}>
                    {formatCurrency(results.premium.netPremium)}
                  </div>
                  <div className={`text-sm ${getStatusColors('success').text} mt-2 px-1`}>
                    <InlineMath math="NP = \frac{\text{PV of Benefits}}{\text{PV of Premiums}}" />
                  </div>
                </div>
                
                <div className={`bg-gradient-to-r ${getStatusColors('info').gradient} p-6 rounded-lg border ${getStatusColors('info').border}`}>
                  <h4 className={`font-semibold ${getStatusColors('info').text} mb-3 px-1`}>Gross Premium</h4>
                  <div className={`text-2xl font-bold ${getStatusColors('info').value} px-1`}>
                    {formatCurrency(results.premium.grossPremium)}
                  </div>
                  <div className={`text-sm ${getStatusColors('info').text} mt-2 px-1`}>
                    <InlineMath math="GP = \frac{NP}{1 - ER - PM}" />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="font-medium text-gray-600 px-1">Expense Loading</div>
                    <div className="font-semibold text-gray-800 px-1">
                      {formatCurrency(results.premium.grossPremium * results.premium.expenseRatio)}
                    </div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="font-medium text-gray-600 px-1">Profit Loading</div>
                    <div className="font-semibold text-gray-800 px-1">
                      {formatCurrency(results.premium.grossPremium * results.premium.profitMargin)}
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h5 className="font-medium text-gray-700 mb-3 px-1">Policy Details</h5>
                  <div className="grid grid-cols-2 gap-3 text-sm text-gray-600">
                    <div className="px-1">Sum Assured: {formatCurrency(results.premium.sumAssured)}</div>
                    <div className="px-1">Age: {results.premium.age}</div>
                    <div className="px-1">Term: {results.premium.term} years</div>
                    <div className="px-1">Gender: {results.premium.gender === 'M' ? 'Male' : 'Female'}</div>
                    <div className="px-1">Mortality Rate: {formatPercentage(results.premium.mortalityRate)}</div>
                    <div className="px-1">Interest Rate: {formatPercentage(results.premium.interestRate)}</div>
                  </div>
                </div>
                
                <ExportButton
                  data={[results.premium]}
                  title="Premium Calculation Results"
                  filename="premium_calculation"
                  className="mt-4"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Profit Testing Calculator */}
      {activeTab === 'profit' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Profit Testing Inputs</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Premium
                </label>
                <input
                  type="number"
                  value={profitInputs.premium}
                  onChange={(e) => setProfitInputs(prev => ({ ...prev, premium: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sum Assured
                  </label>
                  <input
                    type="number"
                    value={profitInputs.sumAssured}
                    onChange={(e) => setProfitInputs(prev => ({ ...prev, sumAssured: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Age
                  </label>
                  <input
                    type="number"
                    value={profitInputs.age}
                    onChange={(e) => setProfitInputs(prev => ({ ...prev, age: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Term (years)
                  </label>
                  <input
                    type="number"
                    value={profitInputs.term}
                    onChange={(e) => setProfitInputs(prev => ({ ...prev, term: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Interest Rate
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    value={profitInputs.interestRate}
                    onChange={(e) => setProfitInputs(prev => ({ ...prev, interestRate: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Initial Expenses
                  </label>
                  <input
                    type="number"
                    value={profitInputs.initialExpenses}
                    onChange={(e) => setProfitInputs(prev => ({ ...prev, initialExpenses: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Renewal Expenses
                  </label>
                  <input
                    type="number"
                    value={profitInputs.renewalExpenses}
                    onChange={(e) => setProfitInputs(prev => ({ ...prev, renewalExpenses: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={calculateProfitTestingResults}
                  className={`flex-1 bg-gradient-to-r ${colors.gradient} text-white px-6 py-3 rounded-lg hover:bg-gradient-to-r ${colors.hover} transition-all duration-300 font-medium`}
                >
                  Run Profit Test
                </button>
                <button
                  onClick={() => resetCalculator('profit')}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Profit Testing Results</h3>
            
            {results.profit && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                    <h4 className="font-semibold text-green-800 mb-2">NPV</h4>
                    <div className="text-xl font-bold text-green-600">
                      {formatCurrency(results.profit.npv)}
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-blue-800 mb-2">IRR</h4>
                    <div className="text-xl font-bold text-blue-600">
                      {formatPercentage(results.profit.irr)}
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="font-medium text-gray-600">Profit Margin</div>
                    <div className="font-semibold text-gray-800">
                      {formatPercentage(results.profit.profitMargin / 100)}
                    </div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="font-medium text-gray-600">Payback Period</div>
                    <div className="font-semibold text-gray-800">
                      {formatNumber(results.profit.paybackPeriod, 1)} years
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-3 rounded-lg">
                  <h5 className="font-medium text-gray-700 mb-2">Cash Flow Summary</h5>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Year 0:</span>
                      <span>{formatCurrency(results.profit.cashFlows[0])}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Cash Flows:</span>
                      <span>{formatCurrency(results.profit.cashFlows.reduce((sum, cf) => sum + cf, 0))}</span>
                    </div>
                  </div>
                </div>
                
                <ExportButton
                  data={[results.profit]}
                  title="Profit Testing Results"
                  filename="profit_testing_results"
                  className="mt-4"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sensitivity Analysis */}
      {activeTab === 'sensitivity' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Sensitivity Analysis</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Base Premium
                  </label>
                  <div className="text-lg font-semibold text-gray-800">
                    {formatCurrency(calculateBreakEvenPremium(sensitivityInputs.baseAssumptions))}
                  </div>
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={calculateSensitivityResults}
                    className={`flex-1 bg-gradient-to-r ${colors.gradient} text-white px-6 py-3 rounded-lg hover:bg-gradient-to-r ${colors.hover} transition-all duration-300 font-medium`}
                  >
                    Run Sensitivity Analysis
                  </button>
                  <button
                    onClick={() => resetCalculator('sensitivity')}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>

            <div className="card">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Analysis Summary</h3>
              
              {results.sensitivity && (
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
                    <h4 className="font-semibold text-purple-800 mb-2">Sensitivity Analysis Complete</h4>
                    <div className="text-sm text-purple-700">
                      Analyzed {Object.keys(results.sensitivity.sensitivityRanges).length} parameters
                    </div>
                  </div>
                  
                  <ExportButton
                    data={results.sensitivity.sensitivityResults}
                    title="Sensitivity Analysis Results"
                    filename="sensitivity_analysis"
                    className="mt-4"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Sensitivity Results Table */}
          {results.sensitivity && (
            <div className="card">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Sensitivity Results</h3>
              <div className="overflow-x-auto">
                <table className="w-full table-auto">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Parameter</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Value</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Premium</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Change from Base</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.sensitivity.sensitivityResults.map((result, index) => (
                      <tr key={index} className="border-b border-gray-200">
                        <td className="px-4 py-2 text-sm text-gray-900 capitalize">
                          {result.parameter.replace(/([A-Z])/g, ' $1').trim()}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {formatPercentage(result.value)}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {formatCurrency(result.premium)}
                        </td>
                        <td className={`px-4 py-2 text-sm ${
                          result.changeFromBase >= 0 ? 'text-red-600' : 'text-green-600'
                        }`}>
                          {formatPercentage(result.changeFromBase / 100, 1, true)}
                        </td>
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
                  {calc.grossPremium && formatCurrency(calc.grossPremium)}
                  {calc.npv && formatCurrency(calc.npv)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PricingCalculator;
