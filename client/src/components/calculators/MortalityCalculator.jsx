"use client";

/**
 * Mortality Calculator Component
 * Provides interactive calculators for life tables, survival probabilities, annuities, and life insurance
 */

import React, { useState } from 'react';
import { Heart, Calculator, TrendingUp, BarChart3 } from 'lucide-react';
import { InlineMath, BlockMath } from 'react-katex';
import ExportButton from '../ExportButton';
import { useCalculationHistory } from '../../hooks/useLocalStorage';
import { 
  getMortalityRate,
  getSurvivalProbability,
  calculateAnnuityDue,
  calculateAnnuityImmediate,
  calculateLifeExpectancy,
  calculateLifeInsurancePV,
  generateLifeTable,
  calculateCommutationFunctions,
  mortalityTables
} from '../../utils/mortalityTables';
import { formatCurrency, formatPercentage, formatNumber } from '../../utils/formatters';
import { getCalculatorColors, getStatusColors } from '../../utils/designSystem';

const MortalityCalculator = () => {
  const [activeTab, setActiveTab] = useState('survival');
  const { history, saveCalculation } = useCalculationHistory('mortality');
  const colors = getCalculatorColors('mortality');

  // Survival Probability Calculator State
  const [survivalInputs, setSurvivalInputs] = useState({
    currentAge: 35,
    futureAge: 65,
    tableType: 'standard'
  });

  // Annuity Calculator State
  const [annuityInputs, setAnnuityInputs] = useState({
    payment: 10000,
    interestRate: 0.03,
    term: 30,
    age: 35,
    tableType: 'standard',
    annuityType: 'due'
  });

  // Life Insurance Calculator State
  const [lifeInsuranceInputs, setLifeInsuranceInputs] = useState({
    benefit: 100000,
    interestRate: 0.03,
    term: 20,
    age: 35,
    tableType: 'standard'
  });

  // Life Table Generator State
  const [lifeTableInputs, setLifeTableInputs] = useState({
    startAge: 20,
    endAge: 80,
    tableType: 'standard',
    interestRate: 0.03
  });

  // Results state
  const [results, setResults] = useState({});

  const calculateSurvivalResults = () => {
    const { currentAge, futureAge, tableType } = survivalInputs;
    const survivalProb = getSurvivalProbability('CSO_2017', currentAge, futureAge - currentAge, 'M');
    const lifeExpectancy = calculateLifeExpectancy(currentAge, tableType);
    const mortalityRate = getMortalityRate('CSO_2017', currentAge, 'M');
    
    const newResults = {
      survivalProbability: survivalProb,
      lifeExpectancy,
      mortalityRate,
      currentAge,
      futureAge,
      tableType,
      timestamp: new Date().toISOString()
    };
    
    setResults(prev => ({ ...prev, survival: newResults }));
    saveCalculation({ type: 'survival', ...newResults });
  };

  const calculateAnnuityResults = () => {
    const { payment, interestRate, term, age, tableType, annuityType } = annuityInputs;
    
    let presentValue;
    if (annuityType === 'due') {
      presentValue = calculateAnnuityDue(payment, interestRate, term, age, tableType);
    } else {
      presentValue = calculateAnnuityImmediate(payment, interestRate, term, age, tableType);
    }
    
    const newResults = {
      presentValue,
      payment,
      interestRate,
      term,
      age,
      tableType,
      annuityType,
      timestamp: new Date().toISOString()
    };
    
    setResults(prev => ({ ...prev, annuity: newResults }));
    saveCalculation({ type: 'annuity', ...newResults });
  };

  const calculateLifeInsuranceResults = () => {
    const { benefit, interestRate, term, age, tableType } = lifeInsuranceInputs;
    const presentValue = calculateLifeInsurancePV(benefit, interestRate, term, age, tableType);
    
    const newResults = {
      presentValue,
      benefit,
      interestRate,
      term,
      age,
      tableType,
      timestamp: new Date().toISOString()
    };
    
    setResults(prev => ({ ...prev, lifeInsurance: newResults }));
    saveCalculation({ type: 'life_insurance', ...newResults });
  };

  const generateLifeTableResults = () => {
    const { startAge, endAge, tableType, interestRate } = lifeTableInputs;
    const lifeTable = generateLifeTable(startAge, endAge, tableType);
    const commutationFunctions = calculateCommutationFunctions(interestRate, lifeTable);
    
    const newResults = {
      lifeTable,
      commutationFunctions,
      startAge,
      endAge,
      tableType,
      interestRate,
      timestamp: new Date().toISOString()
    };
    
    setResults(prev => ({ ...prev, lifeTable: newResults }));
    saveCalculation({ type: 'life_table', ...newResults });
  };

  const resetCalculator = (type) => {
    switch (type) {
      case 'survival':
        setSurvivalInputs({ currentAge: 35, futureAge: 65, tableType: 'standard' });
        break;
      case 'annuity':
        setAnnuityInputs({
          payment: 10000,
          interestRate: 0.03,
          term: 30,
          age: 35,
          tableType: 'standard',
          annuityType: 'due'
        });
        break;
      case 'lifeInsurance':
        setLifeInsuranceInputs({
          benefit: 100000,
          interestRate: 0.03,
          term: 20,
          age: 35,
          tableType: 'standard'
        });
        break;
      case 'lifeTable':
        setLifeTableInputs({
          startAge: 20,
          endAge: 80,
          tableType: 'standard',
          interestRate: 0.03
        });
        break;
    }
  };

  const tabs = [
    { id: 'survival', label: 'Survival Probability', icon: Heart },
    { id: 'annuity', label: 'Annuity Calculator', icon: Calculator },
    { id: 'lifeInsurance', label: 'Life Insurance', icon: TrendingUp },
    { id: 'lifeTable', label: 'Life Table', icon: BarChart3 }
  ];

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8 px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-2 px-2">Mortality Calculator</h1>
        <p className="text-gray-600 px-2">
          Interactive calculators for survival probabilities, annuities, life insurance, and life table generation.
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

      {/* Survival Probability Calculator */}
      {activeTab === 'survival' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 px-4">
          <div className="card">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 px-2">Survival Probability</h3>
            
            <div className="space-y-4 px-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 px-1">
                    Current Age
                  </label>
                  <input
                    type="number"
                    value={survivalInputs.currentAge}
                    onChange={(e) => setSurvivalInputs(prev => ({ ...prev, currentAge: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 px-1">
                    Future Age
                  </label>
                  <input
                    type="number"
                    value={survivalInputs.futureAge}
                    onChange={(e) => setSurvivalInputs(prev => ({ ...prev, futureAge: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mortality Table
                </label>
                <select
                  value={survivalInputs.tableType}
                  onChange={(e) => setSurvivalInputs(prev => ({ ...prev, tableType: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="standard">Standard</option>
                  <option value="smoker">Smoker</option>
                  <option value="nonSmoker">Non-Smoker</option>
                </select>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={calculateSurvivalResults}
                  className={`flex-1 bg-gradient-to-r ${colors.gradient} text-white px-6 py-3 rounded-lg hover:bg-gradient-to-r ${colors.hover} transition-all duration-300 font-medium`}
                >
                  Calculate
                </button>
                <button
                  onClick={() => resetCalculator('survival')}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Results</h3>
            
            {results.survival && (
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                  <h4 className="font-semibold text-green-800 mb-2">Survival Probability</h4>
                  <div className="text-2xl font-bold text-green-600">
                    {formatPercentage(results.survival.survivalProbability)}
                  </div>
                  <div className="text-sm text-green-700 mt-1">
                    <InlineMath math="{}_n p_x = \prod_{t=0}^{n-1} (1 - q_{x+t})" />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="font-medium text-gray-600">Life Expectancy</div>
                    <div className="font-semibold text-gray-800">
                      {formatNumber(results.survival.lifeExpectancy, 1)} years
                    </div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="font-medium text-gray-600">Current Mortality Rate</div>
                    <div className="font-semibold text-gray-800">
                      {formatPercentage(results.survival.mortalityRate)}
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-3 rounded-lg">
                  <h5 className="font-medium text-gray-700 mb-2">Calculation Details</h5>
                  <div className="text-sm text-gray-600">
                    <div>From age {results.survival.currentAge} to age {results.survival.futureAge}</div>
                    <div>Table: {results.survival.tableType}</div>
                  </div>
                </div>
                
                <ExportButton
                  data={[results.survival]}
                  title="Survival Probability Results"
                  filename="survival_probability"
                  className="mt-4"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Annuity Calculator */}
      {activeTab === 'annuity' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Annuity Calculator</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Annual Payment
                </label>
                <input
                  type="number"
                  value={annuityInputs.payment}
                  onChange={(e) => setAnnuityInputs(prev => ({ ...prev, payment: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Interest Rate
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    value={annuityInputs.interestRate}
                    onChange={(e) => setAnnuityInputs(prev => ({ ...prev, interestRate: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Term (years)
                  </label>
                  <input
                    type="number"
                    value={annuityInputs.term}
                    onChange={(e) => setAnnuityInputs(prev => ({ ...prev, term: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Age at Start
                  </label>
                  <input
                    type="number"
                    value={annuityInputs.age}
                    onChange={(e) => setAnnuityInputs(prev => ({ ...prev, age: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Annuity Type
                  </label>
                  <select
                    value={annuityInputs.annuityType}
                    onChange={(e) => setAnnuityInputs(prev => ({ ...prev, annuityType: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="due">Annuity Due</option>
                    <option value="immediate">Annuity Immediate</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mortality Table
                </label>
                <select
                  value={annuityInputs.tableType}
                  onChange={(e) => setAnnuityInputs(prev => ({ ...prev, tableType: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="standard">Standard</option>
                  <option value="smoker">Smoker</option>
                  <option value="nonSmoker">Non-Smoker</option>
                </select>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={calculateAnnuityResults}
                  className={`flex-1 bg-gradient-to-r ${colors.gradient} text-white px-6 py-3 rounded-lg hover:bg-gradient-to-r ${colors.hover} transition-all duration-300 font-medium`}
                >
                  Calculate
                </button>
                <button
                  onClick={() => resetCalculator('annuity')}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Annuity Results</h3>
            
            {results.annuity && (
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-2">Present Value</h4>
                  <div className="text-2xl font-bold text-blue-600">
                    {formatCurrency(results.annuity.presentValue)}
                  </div>
                  <div className="text-sm text-blue-700 mt-1">
                    <InlineMath math={results.annuity.annuityType === 'due' ? '\\ddot{a}_{x:\\overline{n}|}' : 'a_{x:\\overline{n}|}'} />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="font-medium text-gray-600">Annual Payment</div>
                    <div className="font-semibold text-gray-800">{formatCurrency(results.annuity.payment)}</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="font-medium text-gray-600">Interest Rate</div>
                    <div className="font-semibold text-gray-800">{formatPercentage(results.annuity.interestRate)}</div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-3 rounded-lg">
                  <h5 className="font-medium text-gray-700 mb-2">Annuity Details</h5>
                  <div className="text-sm text-gray-600">
                    <div>Type: {results.annuity.annuityType === 'due' ? 'Annuity Due' : 'Annuity Immediate'}</div>
                    <div>Term: {results.annuity.term} years</div>
                    <div>Age at start: {results.annuity.age}</div>
                    <div>Table: {results.annuity.tableType}</div>
                  </div>
                </div>
                
                <ExportButton
                  data={[results.annuity]}
                  title="Annuity Calculation Results"
                  filename="annuity_calculation"
                  className="mt-4"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Life Insurance Calculator */}
      {activeTab === 'lifeInsurance' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Life Insurance Calculator</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Death Benefit
                </label>
                <input
                  type="number"
                  value={lifeInsuranceInputs.benefit}
                  onChange={(e) => setLifeInsuranceInputs(prev => ({ ...prev, benefit: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Interest Rate
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    value={lifeInsuranceInputs.interestRate}
                    onChange={(e) => setLifeInsuranceInputs(prev => ({ ...prev, interestRate: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Term (years)
                  </label>
                  <input
                    type="number"
                    value={lifeInsuranceInputs.term}
                    onChange={(e) => setLifeInsuranceInputs(prev => ({ ...prev, term: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Age at Issue
                  </label>
                  <input
                    type="number"
                    value={lifeInsuranceInputs.age}
                    onChange={(e) => setLifeInsuranceInputs(prev => ({ ...prev, age: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mortality Table
                  </label>
                  <select
                    value={lifeInsuranceInputs.tableType}
                    onChange={(e) => setLifeInsuranceInputs(prev => ({ ...prev, tableType: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="standard">Standard</option>
                    <option value="smoker">Smoker</option>
                    <option value="nonSmoker">Non-Smoker</option>
                  </select>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={calculateLifeInsuranceResults}
                  className={`flex-1 bg-gradient-to-r ${colors.gradient} text-white px-6 py-3 rounded-lg hover:bg-gradient-to-r ${colors.hover} transition-all duration-300 font-medium`}
                >
                  Calculate
                </button>
                <button
                  onClick={() => resetCalculator('lifeInsurance')}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Life Insurance Results</h3>
            
            {results.lifeInsurance && (
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-red-50 to-pink-50 p-4 rounded-lg border border-red-200">
                  <h4 className="font-semibold text-red-800 mb-2">Present Value</h4>
                  <div className="text-2xl font-bold text-red-600">
                    {formatCurrency(results.lifeInsurance.presentValue)}
                  </div>
                  <div className="text-sm text-red-700 mt-1">
                    <InlineMath math="A_{x:\\overline{n}|} = \sum_{t=1}^{n} v^t \cdot {}_t p_x \cdot q_{x+t-1}" />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="font-medium text-gray-600">Death Benefit</div>
                    <div className="font-semibold text-gray-800">{formatCurrency(results.lifeInsurance.benefit)}</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="font-medium text-gray-600">Interest Rate</div>
                    <div className="font-semibold text-gray-800">{formatPercentage(results.lifeInsurance.interestRate)}</div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-3 rounded-lg">
                  <h5 className="font-medium text-gray-700 mb-2">Policy Details</h5>
                  <div className="text-sm text-gray-600">
                    <div>Term: {results.lifeInsurance.term} years</div>
                    <div>Age at issue: {results.lifeInsurance.age}</div>
                    <div>Table: {results.lifeInsurance.tableType}</div>
                  </div>
                </div>
                
                <ExportButton
                  data={[results.lifeInsurance]}
                  title="Life Insurance Calculation Results"
                  filename="life_insurance_calculation"
                  className="mt-4"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Life Table Generator */}
      {activeTab === 'lifeTable' && (
        <div className="space-y-6">
          {/* Symbol Definitions */}
          <div className="card">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Mortality Table Symbols</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center space-x-2 mb-2">
                  <InlineMath math="l_x" />
                  <span className="font-semibold text-blue-800">Survivors</span>
                </div>
                <p className="text-sm text-blue-700">Number of lives surviving to exact age x</p>
              </div>
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-center space-x-2 mb-2">
                  <InlineMath math="d_x" />
                  <span className="font-semibold text-red-800">Deaths</span>
                </div>
                <p className="text-sm text-red-700">Number of deaths between ages x and x+1</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center space-x-2 mb-2">
                  <InlineMath math="q_x" />
                  <span className="font-semibold text-green-800">Death Rate</span>
                </div>
                <p className="text-sm text-green-700">Probability of death between ages x and x+1</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex items-center space-x-2 mb-2">
                  <InlineMath math="p_x" />
                  <span className="font-semibold text-purple-800">Survival Rate</span>
                </div>
                <p className="text-sm text-purple-700">Probability of surviving from age x to x+1</p>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-center space-x-2 mb-2">
                  <InlineMath math="D_x" />
                  <span className="font-semibold text-yellow-800">Discount Factor</span>
                </div>
                <p className="text-sm text-yellow-700">Present value of $1 payable at age x</p>
              </div>
              <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                <div className="flex items-center space-x-2 mb-2">
                  <InlineMath math="N_x" />
                  <span className="font-semibold text-indigo-800">Commutation</span>
                </div>
                <p className="text-sm text-indigo-700">Sum of discount factors from age x onwards</p>
              </div>
            </div>
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-2">Key Relationships</h4>
              <div className="space-y-2 text-sm">
                <div><InlineMath math="q_x = \frac{d_x}{l_x}" /> - Death rate calculation</div>
                <div><InlineMath math="p_x = 1 - q_x" /> - Survival rate calculation</div>
                <div><InlineMath math="l_{x+1} = l_x - d_x" /> - Survivor progression</div>
                <div><InlineMath math="D_x = l_x \cdot v^x" /> - Discount factor calculation</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Life Table Generator</h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Age
                    </label>
                    <input
                      type="number"
                      value={lifeTableInputs.startAge}
                      onChange={(e) => setLifeTableInputs(prev => ({ ...prev, startAge: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Age
                    </label>
                    <input
                      type="number"
                      value={lifeTableInputs.endAge}
                      onChange={(e) => setLifeTableInputs(prev => ({ ...prev, endAge: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mortality Table
                    </label>
                    <select
                      value={lifeTableInputs.tableType}
                      onChange={(e) => setLifeTableInputs(prev => ({ ...prev, tableType: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="standard">Standard</option>
                      <option value="smoker">Smoker</option>
                      <option value="nonSmoker">Non-Smoker</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Interest Rate
                    </label>
                    <input
                      type="number"
                      step="0.001"
                      value={lifeTableInputs.interestRate}
                      onChange={(e) => setLifeTableInputs(prev => ({ ...prev, interestRate: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={generateLifeTableResults}
                    className={`flex-1 bg-gradient-to-r ${colors.gradient} text-white px-6 py-3 rounded-lg hover:bg-gradient-to-r ${colors.hover} transition-all duration-300 font-medium`}
                  >
                    Generate Life Table
                  </button>
                  <button
                    onClick={() => resetCalculator('lifeTable')}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>

            <div className="card">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Life Table Summary</h3>
              
              {results.lifeTable && (
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
                    <h4 className="font-semibold text-purple-800 mb-2">Life Table Generated</h4>
                    <div className="text-sm text-purple-700">
                      Ages {results.lifeTable.startAge} to {results.lifeTable.endAge}
                    </div>
                    <div className="text-sm text-purple-700">
                      {results.lifeTable.lifeTable.length} rows
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="font-medium text-gray-600">Starting Population</div>
                      <div className="font-semibold text-gray-800">100,000</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="font-medium text-gray-600">Interest Rate</div>
                      <div className="font-semibold text-gray-800">{formatPercentage(results.lifeTable.interestRate)}</div>
                    </div>
                  </div>
                  
                  <ExportButton
                    data={results.lifeTable.lifeTable}
                    title="Life Table"
                    filename="life_table"
                    className="mt-4"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Life Table Display */}
          {results.lifeTable && (
            <div className="card">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Life Table</h3>
              <div className="overflow-x-auto">
                <table className="w-full table-auto">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Age (x)</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                        <InlineMath math="l_x" />
                        <div className="text-xs text-gray-500 font-normal">Survivors</div>
                      </th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                        <InlineMath math="d_x" />
                        <div className="text-xs text-gray-500 font-normal">Deaths</div>
                      </th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                        <InlineMath math="q_x" />
                        <div className="text-xs text-gray-500 font-normal">Death Rate</div>
                      </th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                        <InlineMath math="p_x" />
                        <div className="text-xs text-gray-500 font-normal">Survival Rate</div>
                      </th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                        <InlineMath math="D_x" />
                        <div className="text-xs text-gray-500 font-normal">Discount Factor</div>
                      </th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                        <InlineMath math="N_x" />
                        <div className="text-xs text-gray-500 font-normal">Commutation</div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.lifeTable.lifeTable.map((row, index) => (
                      <tr key={index} className="border-b border-gray-200">
                        <td className="px-4 py-2 text-sm text-gray-900">{row.age}</td>
                        <td className="px-4 py-2 text-sm text-gray-900">{formatNumber(row.lx)}</td>
                        <td className="px-4 py-2 text-sm text-gray-900">{formatNumber(row.dx)}</td>
                        <td className="px-4 py-2 text-sm text-gray-900">{formatPercentage(row.qx)}</td>
                        <td className="px-4 py-2 text-sm text-gray-900">{formatPercentage(row.px)}</td>
                        <td className="px-4 py-2 text-sm text-gray-900">{formatNumber(results.lifeTable.commutationFunctions[index]?.Dx || 0)}</td>
                        <td className="px-4 py-2 text-sm text-gray-900">{formatNumber(results.lifeTable.commutationFunctions[index]?.Nx || 0)}</td>
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
                  {calc.survivalProbability && formatPercentage(calc.survivalProbability)}
                  {calc.presentValue && formatCurrency(calc.presentValue)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MortalityCalculator;
