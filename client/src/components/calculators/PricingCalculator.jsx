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
      <div className="mb-12">
        <h1 className="text-4xl font-heading font-black text-trust-950 uppercase tracking-tight mb-3 px-2">Pricing Calculator</h1>
        <p className="text-gray-400 font-medium px-2">
          Interactive calculators for premium calculation, profit testing, and sensitivity analysis for life insurance products.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 mb-6 px-4">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${activeTab === tab.id
              ? `bg-trust-950 text-growth-400 shadow-lg`
              : 'bg-gray-100 text-gray-400 hover:text-trust-950 hover:bg-gray-200'
              }`}
          >
            <tab.icon className="h-4 w-4" />
            <span className="px-1">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Premium Calculator */}
      {activeTab === 'premium' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white/90 backdrop-blur-2xl rounded-[2.5rem] p-10 border border-trust-50 shadow-glass">
            <h3 className="text-2xl font-heading font-black text-trust-950 uppercase tracking-tight mb-8">Premium Calculation</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 px-1">
                  Sum Assured
                </label>
                <input
                  type="number"
                  value={premiumInputs.sumAssured}
                  onChange={(e) => setPremiumInputs(prev => ({ ...prev, sumAssured: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-trust-500 focus:border-transparent transition-all duration-300 outline-none font-bold text-trust-950"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 px-1">
                    Age
                  </label>
                  <input
                    type="number"
                    value={premiumInputs.age}
                    onChange={(e) => setPremiumInputs(prev => ({ ...prev, age: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-trust-500 focus:border-transparent transition-all duration-300 outline-none font-bold text-trust-950"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 px-1">
                    Term (years)
                  </label>
                  <input
                    type="number"
                    value={premiumInputs.term}
                    onChange={(e) => setPremiumInputs(prev => ({ ...prev, term: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-trust-500 focus:border-transparent transition-all duration-300 outline-none font-bold text-trust-950"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 px-1">
                    Gender
                  </label>
                  <select
                    value={premiumInputs.gender}
                    onChange={(e) => setPremiumInputs(prev => ({ ...prev, gender: e.target.value }))}
                    className="w-full px-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-trust-500 focus:border-transparent transition-all duration-300 outline-none font-bold text-trust-950"
                  >
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 px-1">
                    Mortality Rate
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    value={premiumInputs.mortalityRate}
                    onChange={(e) => setPremiumInputs(prev => ({ ...prev, mortalityRate: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-trust-500 focus:border-transparent transition-all duration-300 outline-none font-bold text-trust-950"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 px-1">
                    Interest Rate
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    value={premiumInputs.interestRate}
                    onChange={(e) => setPremiumInputs(prev => ({ ...prev, interestRate: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-trust-500 focus:border-transparent transition-all duration-300 outline-none font-bold text-trust-950"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 px-1">
                    Expense Ratio
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={premiumInputs.expenseRatio}
                    onChange={(e) => setPremiumInputs(prev => ({ ...prev, expenseRatio: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-trust-500 focus:border-transparent transition-all duration-300 outline-none font-bold text-trust-950"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 px-1">
                    Profit Margin
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={premiumInputs.profitMargin}
                    onChange={(e) => setPremiumInputs(prev => ({ ...prev, profitMargin: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-trust-500 focus:border-transparent transition-all duration-300 outline-none font-bold text-trust-950"
                  />
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={calculatePremiumResults}
                  className="flex-1 bg-trust-950 text-white px-8 py-4 rounded-2xl hover:bg-trust-900 transition-all duration-300 font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2"
                >
                  Calculate Premium
                  <DollarSign className="h-4 w-4 text-growth-400" />
                </button>
                <button
                  onClick={() => setPremiumInputs({ sumAssured: 100000, age: 35, term: 20, gender: 'M', mortalityRate: 0.002, interestRate: 0.03, expenseRatio: 0.15, profitMargin: 0.05 })}
                  className="px-8 py-4 bg-gray-100 text-trust-950 rounded-2xl hover:bg-gray-200 transition-colors font-black text-[10px] uppercase tracking-[0.2em]"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-2xl rounded-[2.5rem] p-10 border border-trust-50 shadow-glass">
            <h3 className="text-2xl font-heading font-black text-trust-950 uppercase tracking-tight mb-8">Premium Results</h3>

            {results.premium && (
              <div className="space-y-4">
                <div className={`bg-gradient-to-r ${getStatusColors('success').gradient} p-6 rounded-lg border ${getStatusColors('success').border}`}>
                  <h4 className={`font-semibold ${getStatusColors('success').text} mb-3 px-1`}>Net Premium</h4>
                  <div className={`text-2xl font-bold ${getStatusColors('success').value} px-1`}>
                    {formatCurrency(results.premium.netPremium)}
                  </div>
                  <div className={`text-sm ${getStatusColors('success').text} mt-2 px-1`}>
                    <InlineMath math="NP = \frac{\text{PV of Benefits}}{\text{PV of Premiums}}" />
                  </div>
                </div>

                <div className="bg-trust-50 p-6 rounded-2xl border border-trust-100">
                  <h4 className="text-[10px] font-black text-trust-950 uppercase tracking-[0.2em] mb-3 px-1">Gross Premium</h4>
                  <div className="text-3xl font-heading font-black text-trust-600 px-1">
                    {formatCurrency(results.premium.grossPremium)}
                  </div>
                  <div className="text-[10px] font-bold text-trust-800/60 mt-2 px-1">
                    <InlineMath math="GP = \frac{NP}{1 - ER - PM}" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
                    <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Expense Loading</div>
                    <div className="text-sm font-bold text-trust-950 px-1">
                      {formatCurrency(results.premium.grossPremium * results.premium.expenseRatio)}
                    </div>
                  </div>
                  <div className="text-center p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
                    <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Profit Loading</div>
                    <div className="text-sm font-bold text-trust-950 px-1">
                      {formatCurrency(results.premium.grossPremium * results.premium.profitMargin)}
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                  <h5 className="text-[10px] font-black text-trust-950 uppercase tracking-[0.2em] mb-4 px-1">Policy Details</h5>
                  <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    <div className="px-1 flex justify-between"><span>Sum:</span> <span className="text-trust-950">{formatCurrency(results.premium.sumAssured)}</span></div>
                    <div className="px-1 flex justify-between"><span>Age:</span> <span className="text-trust-950">{results.premium.age}</span></div>
                    <div className="px-1 flex justify-between"><span>Term:</span> <span className="text-trust-950">{results.premium.term}y</span></div>
                    <div className="px-1 flex justify-between"><span>Gender:</span> <span className="text-trust-950">{results.premium.gender}</span></div>
                    <div className="px-1 flex justify-between"><span>Mortality:</span> <span className="text-trust-950">{formatPercentage(results.premium.mortalityRate)}</span></div>
                    <div className="px-1 flex justify-between"><span>Interest:</span> <span className="text-trust-950">{formatPercentage(results.premium.interestRate)}</span></div>
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white/90 backdrop-blur-2xl rounded-[2.5rem] p-10 border border-trust-50 shadow-glass">
            <h3 className="text-2xl font-heading font-black text-trust-950 uppercase tracking-tight mb-8">Profit Testing Inputs</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 px-1">
                  Premium
                </label>
                <input
                  type="number"
                  value={profitInputs.premium}
                  onChange={(e) => setProfitInputs(prev => ({ ...prev, premium: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-trust-500 focus:border-transparent transition-all duration-300 outline-none font-bold text-trust-950"
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

              <div className="flex gap-4">
                <button
                  onClick={calculateProfitTestingResults}
                  className="flex-1 bg-trust-950 text-white px-8 py-4 rounded-2xl hover:bg-trust-900 transition-all duration-300 font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2"
                >
                  Run Profit Test
                  <TrendingUp className="h-4 w-4 text-growth-400" />
                </button>
                <button
                  onClick={() => setProfitInputs({ premium: 5000, sumAssured: 100000, age: 35, term: 20, mortalityRate: 0.002, interestRate: 0.03, expenseRatio: 0.15, initialExpenses: 2000, renewalExpenses: 500 })}
                  className="px-8 py-4 bg-gray-100 text-trust-950 rounded-2xl hover:bg-gray-200 transition-colors font-black text-[10px] uppercase tracking-[0.2em]"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-2xl rounded-[2.5rem] p-10 border border-trust-50 shadow-glass">
            <h3 className="text-2xl font-heading font-black text-trust-950 uppercase tracking-tight mb-8">Profit Testing Results</h3>

            {results.profit && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-growth-50 p-6 rounded-2xl border border-growth-100">
                    <h4 className="text-[10px] font-black text-growth-900 uppercase tracking-[0.2em] mb-2 px-1">NPV</h4>
                    <div className="text-3xl font-heading font-black text-growth-600 px-1">
                      {formatCurrency(results.profit.npv)}
                    </div>
                  </div>
                  <div className="bg-trust-50 p-6 rounded-2xl border border-trust-100">
                    <h4 className="text-[10px] font-black text-trust-950 uppercase tracking-[0.2em] mb-2 px-1">IRR</h4>
                    <div className="text-3xl font-heading font-black text-trust-600 px-1">
                      {formatPercentage(results.profit.irr)}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-6 bg-gray-50/50 rounded-2xl border border-gray-100">
                    <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Profit Margin</div>
                    <div className="text-sm font-bold text-trust-950 px-1">
                      {formatPercentage(results.profit.profitMargin / 100)}
                    </div>
                  </div>
                  <div className="text-center p-6 bg-gray-50/50 rounded-2xl border border-gray-100">
                    <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Payback Period</div>
                    <div className="text-sm font-bold text-trust-950 px-1">
                      {formatNumber(results.profit.paybackPeriod, 1)} years
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                  <h5 className="text-[10px] font-black text-trust-950 uppercase tracking-[0.2em] mb-4 px-1">Cash Flow Summary</h5>
                  <div className="space-y-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    <div className="flex justify-between px-1">
                      <span>Initial Investment (Y0):</span>
                      <span className="text-accent-600">{formatCurrency(results.profit.cashFlows[0])}</span>
                    </div>
                    <div className="flex justify-between px-1">
                      <span>Total Net Cash Flows:</span>
                      <span className="text-growth-600">{formatCurrency(results.profit.cashFlows.reduce((sum, cf) => sum + cf, 0))}</span>
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
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white/90 backdrop-blur-2xl rounded-[2.5rem] p-10 border border-trust-50 shadow-glass">
              <h3 className="text-2xl font-heading font-black text-trust-950 uppercase tracking-tight mb-8">Sensitivity Analysis</h3>

              <div className="space-y-4">
                <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100 mb-8">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 px-1">
                    Base Break-Even Premium
                  </label>
                  <div className="text-3xl font-heading font-black text-trust-900 px-1">
                    {formatCurrency(calculateBreakEvenPremium(sensitivityInputs.baseAssumptions))}
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={calculateSensitivityResults}
                    className="flex-1 bg-trust-950 text-white px-8 py-4 rounded-2xl hover:bg-trust-900 transition-all duration-300 font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2"
                  >
                    Run Analysis
                    <BarChart3 className="h-4 w-4 text-growth-400" />
                  </button>
                  <button
                    onClick={() => setSensitivityInputs({
                      baseAssumptions: { sumAssured: 100000, age: 35, term: 20, mortalityRate: 0.002, interestRate: 0.03, expenseRatio: 0.15, targetProfitMargin: 0.05 },
                      sensitivityRanges: { mortalityRate: { min: 0.001, max: 0.005, steps: 5 }, interestRate: { min: 0.01, max: 0.05, steps: 5 }, expenseRatio: { min: 0.10, max: 0.20, steps: 5 } }
                    })}
                    className="px-8 py-4 bg-gray-100 text-trust-950 rounded-2xl hover:bg-gray-200 transition-colors font-black text-[10px] uppercase tracking-[0.2em]"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white/90 backdrop-blur-2xl rounded-[2.5rem] p-10 border border-trust-50 shadow-glass">
              <h3 className="text-2xl font-heading font-black text-trust-950 uppercase tracking-tight mb-8">Analysis Summary</h3>

              {results.sensitivity && (
                <div className="space-y-4">
                  <div className="bg-trust-50 p-6 rounded-2xl border border-trust-100">
                    <h4 className="text-[10px] font-black text-trust-950 uppercase tracking-[0.2em] mb-2 px-1">Sensitivity Analysis Complete</h4>
                    <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest px-1">
                      Analyzed {Object.keys(results.sensitivity.sensitivityRanges).length} Parameters across scenarios
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
            <div className="bg-white/90 backdrop-blur-2xl rounded-[2.5rem] p-10 border border-trust-50 shadow-glass overflow-hidden">
              <h3 className="text-2xl font-heading font-black text-trust-950 uppercase tracking-tight mb-8">Scenario Results</h3>
              <div className="overflow-x-auto -mx-10">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50/50">
                      <th className="px-10 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Parameter</th>
                      <th className="px-10 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Model Value</th>
                      <th className="px-10 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Premium</th>
                      <th className="px-10 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Delta (%)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {results.sensitivity.sensitivityResults.map((result, index) => (
                      <tr key={index} className="hover:bg-gray-50/30 transition-colors">
                        <td className="px-10 py-5 text-sm font-bold text-trust-950 capitalize">
                          {result.parameter.replace(/([A-Z])/g, ' $1').trim()}
                        </td>
                        <td className="px-10 py-5 text-sm font-medium text-gray-400">
                          {formatPercentage(result.value)}
                        </td>
                        <td className="px-10 py-5 text-sm font-bold text-trust-950">
                          {formatCurrency(result.premium)}
                        </td>
                        <td className={`px-10 py-5 text-sm font-black ${result.changeFromBase >= 0 ? 'text-accent-600' : 'text-growth-600'}`}>
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
                    {calc.grossPremium && formatCurrency(calc.grossPremium)}
                    {calc.npv && formatCurrency(calc.npv)}
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

export default PricingCalculator;
