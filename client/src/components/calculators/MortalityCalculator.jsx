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
      <div className="mb-12">
        <h1 className="text-4xl font-heading font-black text-trust-950 uppercase tracking-tight mb-3 px-2">Mortality Calculator</h1>
        <p className="text-gray-400 font-medium px-2">
          Interactive calculators for survival probabilities, annuities, life insurance, and life table generation based on Swiss and IORP actuarial standards.
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
            <div className="flex items-center gap-2">
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Survival Probability Calculator */}
      {activeTab === 'survival' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white/90 backdrop-blur-2xl rounded-[2.5rem] p-10 border border-trust-50 shadow-glass">
            <h3 className="text-2xl font-heading font-black text-trust-950 uppercase tracking-tight mb-8">Survival Probability</h3>

            <div className="space-y-4 px-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 px-1">
                    Current Age
                  </label>
                  <input
                    type="number"
                    value={survivalInputs.currentAge}
                    onChange={(e) => setSurvivalInputs(prev => ({ ...prev, currentAge: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-trust-500 focus:border-transparent transition-all duration-300 outline-none font-bold text-trust-950"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 px-1">
                    Future Age
                  </label>
                  <input
                    type="number"
                    value={survivalInputs.futureAge}
                    onChange={(e) => setSurvivalInputs(prev => ({ ...prev, futureAge: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-trust-500 focus:border-transparent transition-all duration-300 outline-none font-bold text-trust-950"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 px-1">
                  Mortality Table
                </label>
                <select
                  value={survivalInputs.tableType}
                  onChange={(e) => setSurvivalInputs(prev => ({ ...prev, tableType: e.target.value }))}
                  className="w-full px-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-trust-500 focus:border-transparent transition-all duration-300 outline-none font-bold text-trust-950"
                >
                  <option value="standard">Swiss Standard (BVG 2020)</option>
                  <option value="smoker">High Risk (Smoker)</option>
                  <option value="nonSmoker">Preferred (Non-Smoker)</option>
                </select>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={calculateSurvivalResults}
                  className="flex-1 bg-trust-950 text-white px-8 py-4 rounded-2xl hover:bg-trust-900 transition-all duration-300 font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2"
                >
                  Analyze Survival
                  <Heart className="h-4 w-4 text-growth-400" />
                </button>
                <button
                  onClick={() => resetCalculator('survival')}
                  className="px-8 py-4 bg-gray-100 text-trust-950 rounded-2xl hover:bg-gray-200 transition-colors font-black text-[10px] uppercase tracking-[0.2em]"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-2xl rounded-[2.5rem] p-10 border border-trust-50 shadow-glass">
            <h3 className="text-2xl font-heading font-black text-trust-950 uppercase tracking-tight mb-8">Results Summary</h3>

            {results.survival && (
              <div className="space-y-4">
                <div className="bg-growth-50 p-6 rounded-2xl border border-growth-100">
                  <h4 className="text-[10px] font-black text-growth-900 uppercase tracking-[0.2em] mb-2 px-1">Survival Probability</h4>
                  <div className="text-3xl font-heading font-black text-growth-600 px-1">
                    {formatPercentage(results.survival.survivalProbability)}
                  </div>
                  <div className="text-[10px] font-bold text-growth-800/60 mt-2 px-1">
                    <InlineMath math="{}_n p_x = \prod_{t=0}^{n-1} (1 - q_{x+t})" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-6 bg-gray-50/50 rounded-2xl border border-gray-100">
                    <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Life Expectancy</div>
                    <div className="text-sm font-bold text-trust-950 px-1">
                      {formatNumber(results.survival.lifeExpectancy, 1)} years
                    </div>
                  </div>
                  <div className="text-center p-6 bg-gray-50/50 rounded-2xl border border-gray-100">
                    <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Mortality Rate</div>
                    <div className="text-sm font-bold text-trust-950 px-1">
                      {formatPercentage(results.survival.mortalityRate)}
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                  <h5 className="text-[10px] font-black text-trust-950 uppercase tracking-[0.2em] mb-4 px-1">Analysis Matrix</h5>
                  <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    <div className="px-1 flex justify-between"><span>Age Range:</span> <span className="text-trust-950">{results.survival.currentAge}-{results.survival.futureAge}</span></div>
                    <div className="px-1 flex justify-between"><span>Table Type:</span> <span className="text-trust-950">{results.survival.tableType}</span></div>
                    <div className="px-1 flex justify-between"><span>Interval:</span> <span className="text-trust-950">{results.survival.futureAge - results.survival.currentAge}y</span></div>
                    <div className="px-1 flex justify-between"><span>Status:</span> <span className="text-growth-500">Verified</span></div>
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white/90 backdrop-blur-2xl rounded-[2.5rem] p-10 border border-trust-50 shadow-glass">
            <h3 className="text-2xl font-heading font-black text-trust-950 uppercase tracking-tight mb-8">Annuity Calculator</h3>

            <div className="space-y-4 px-2">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 px-1">
                  Annual Payment
                </label>
                <input
                  type="number"
                  value={annuityInputs.payment}
                  onChange={(e) => setAnnuityInputs(prev => ({ ...prev, payment: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-trust-500 focus:border-transparent transition-all duration-300 outline-none font-bold text-trust-950"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 px-1">
                    Interest Rate
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    value={annuityInputs.interestRate}
                    onChange={(e) => setAnnuityInputs(prev => ({ ...prev, interestRate: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-trust-500 focus:border-transparent transition-all duration-300 outline-none font-bold text-trust-950"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 px-1">
                    Term (years)
                  </label>
                  <input
                    type="number"
                    value={annuityInputs.term}
                    onChange={(e) => setAnnuityInputs(prev => ({ ...prev, term: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-trust-500 focus:border-transparent transition-all duration-300 outline-none font-bold text-trust-950"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 px-1">
                    Age at Start
                  </label>
                  <input
                    type="number"
                    value={annuityInputs.age}
                    onChange={(e) => setAnnuityInputs(prev => ({ ...prev, age: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-trust-500 focus:border-transparent transition-all duration-300 outline-none font-bold text-trust-950"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 px-1">
                    Annuity Type
                  </label>
                  <select
                    value={annuityInputs.annuityType}
                    onChange={(e) => setAnnuityInputs(prev => ({ ...prev, annuityType: e.target.value }))}
                    className="w-full px-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-trust-500 focus:border-transparent transition-all duration-300 outline-none font-bold text-trust-950"
                  >
                    <option value="due">Annuity Due</option>
                    <option value="immediate">Annuity Immediate</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 px-1">
                  Mortality Table
                </label>
                <select
                  value={annuityInputs.tableType}
                  onChange={(e) => setAnnuityInputs(prev => ({ ...prev, tableType: e.target.value }))}
                  className="w-full px-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-trust-500 focus:border-transparent transition-all duration-300 outline-none font-bold text-trust-950"
                >
                  <option value="standard">Swiss Standard (BVG 2020)</option>
                  <option value="smoker">High Risk (Smoker)</option>
                  <option value="nonSmoker">Preferred (Non-Smoker)</option>
                </select>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={calculateAnnuityResults}
                  className="flex-1 bg-trust-950 text-white px-8 py-4 rounded-2xl hover:bg-trust-900 transition-all duration-300 font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2"
                >
                  Calculate PV
                  <Calculator className="h-4 w-4 text-growth-400" />
                </button>
                <button
                  onClick={() => resetCalculator('annuity')}
                  className="px-8 py-4 bg-gray-100 text-trust-950 rounded-2xl hover:bg-gray-200 transition-colors font-black text-[10px] uppercase tracking-[0.2em]"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-2xl rounded-[2.5rem] p-10 border border-trust-50 shadow-glass">
            <h3 className="text-2xl font-heading font-black text-trust-950 uppercase tracking-tight mb-8">Annuity Results</h3>

            {results.annuity && (
              <div className="space-y-4">
                <div className="bg-trust-50 p-6 rounded-2xl border border-trust-100">
                  <h4 className="text-[10px] font-black text-trust-950 uppercase tracking-[0.2em] mb-2 px-1">Present Value</h4>
                  <div className="text-3xl font-heading font-black text-trust-600 px-1">
                    {formatCurrency(results.annuity.presentValue)}
                  </div>
                  <div className="text-[10px] font-bold text-trust-800/60 mt-2 px-1">
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white/90 backdrop-blur-2xl rounded-[2.5rem] p-10 border border-trust-50 shadow-glass">
            <h3 className="text-2xl font-heading font-black text-trust-950 uppercase tracking-tight mb-8">Life Insurance Calculator</h3>

            <div className="space-y-4 px-2">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 px-1">
                  Death Benefit
                </label>
                <input
                  type="number"
                  value={lifeInsuranceInputs.benefit}
                  onChange={(e) => setLifeInsuranceInputs(prev => ({ ...prev, benefit: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-trust-500 focus:border-transparent transition-all duration-300 outline-none font-bold text-trust-950"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 px-1">
                    Interest Rate
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    value={lifeInsuranceInputs.interestRate}
                    onChange={(e) => setLifeInsuranceInputs(prev => ({ ...prev, interestRate: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-trust-500 focus:border-transparent transition-all duration-300 outline-none font-bold text-trust-950"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 px-1">
                    Term (years)
                  </label>
                  <input
                    type="number"
                    value={lifeInsuranceInputs.term}
                    onChange={(e) => setLifeInsuranceInputs(prev => ({ ...prev, term: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-trust-500 focus:border-transparent transition-all duration-300 outline-none font-bold text-trust-950"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 px-1">
                    Age at Issue
                  </label>
                  <input
                    type="number"
                    value={lifeInsuranceInputs.age}
                    onChange={(e) => setLifeInsuranceInputs(prev => ({ ...prev, age: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-trust-500 focus:border-transparent transition-all duration-300 outline-none font-bold text-trust-950"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 px-1">
                    Mortality Table
                  </label>
                  <select
                    value={lifeInsuranceInputs.tableType}
                    onChange={(e) => setLifeInsuranceInputs(prev => ({ ...prev, tableType: e.target.value }))}
                    className="w-full px-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-trust-500 focus:border-transparent transition-all duration-300 outline-none font-bold text-trust-950"
                  >
                    <option value="standard">Swiss Standard (BVG 2020)</option>
                    <option value="smoker">High Risk (Smoker)</option>
                    <option value="nonSmoker">Preferred (Non-Smoker)</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={calculateLifeInsuranceResults}
                  className="flex-1 bg-trust-950 text-white px-8 py-4 rounded-2xl hover:bg-trust-900 transition-all duration-300 font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2"
                >
                  Calculate Benefit
                  <TrendingUp className="h-4 w-4 text-growth-400" />
                </button>
                <button
                  onClick={() => resetCalculator('lifeInsurance')}
                  className="px-8 py-4 bg-gray-100 text-trust-950 rounded-2xl hover:bg-gray-200 transition-colors font-black text-[10px] uppercase tracking-[0.2em]"
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
                <div className="bg-accent-50 p-6 rounded-2xl border border-accent-100">
                  <h4 className="text-[10px] font-black text-accent-900 uppercase tracking-[0.2em] mb-2 px-1">Present Value</h4>
                  <div className="text-3xl font-heading font-black text-accent-600 px-1">
                    {formatCurrency(results.lifeInsurance.presentValue)}
                  </div>
                  <div className="text-[10px] font-bold text-accent-800/60 mt-2 px-1">
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
        <div className="space-y-8">
          <div className="bg-white/90 backdrop-blur-2xl rounded-[2.5rem] p-10 border border-trust-50 shadow-glass">
            <h3 className="text-2xl font-heading font-black text-trust-950 uppercase tracking-tight mb-8">Mortality Table Symbols</h3>
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white/90 backdrop-blur-2xl rounded-[2.5rem] p-10 border border-trust-50 shadow-glass">
              <h3 className="text-2xl font-heading font-black text-trust-950 uppercase tracking-tight mb-8">Life Table Generator</h3>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 px-1">
                      Start Age
                    </label>
                    <input
                      type="number"
                      value={lifeTableInputs.startAge}
                      onChange={(e) => setLifeTableInputs(prev => ({ ...prev, startAge: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-trust-500 focus:border-transparent transition-all duration-300 outline-none font-bold text-trust-950"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 px-1">
                      End Age
                    </label>
                    <input
                      type="number"
                      value={lifeTableInputs.endAge}
                      onChange={(e) => setLifeTableInputs(prev => ({ ...prev, endAge: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-trust-500 focus:border-transparent transition-all duration-300 outline-none font-bold text-trust-950"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 px-1">
                      Mortality Table
                    </label>
                    <select
                      value={lifeTableInputs.tableType}
                      onChange={(e) => setLifeTableInputs(prev => ({ ...prev, tableType: e.target.value }))}
                      className="w-full px-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-trust-500 focus:border-transparent transition-all duration-300 outline-none font-bold text-trust-950"
                    >
                      <option value="standard"> Swiss Standard (BVG 2020)</option>
                      <option value="smoker">High Risk (Smoker)</option>
                      <option value="nonSmoker">Preferred (Non-Smoker)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 px-1">
                      Interest Rate
                    </label>
                    <input
                      type="number"
                      step="0.001"
                      value={lifeTableInputs.interestRate}
                      onChange={(e) => setLifeTableInputs(prev => ({ ...prev, interestRate: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-trust-500 focus:border-transparent transition-all duration-300 outline-none font-bold text-trust-950"
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={generateLifeTableResults}
                    className="flex-1 bg-trust-950 text-white px-8 py-4 rounded-2xl hover:bg-trust-900 transition-all duration-300 font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2"
                  >
                    Generate Schedule
                    <BarChart3 className="h-4 w-4 text-growth-400" />
                  </button>
                  <button
                    onClick={() => resetCalculator('lifeTable')}
                    className="px-8 py-4 bg-gray-100 text-trust-950 rounded-2xl hover:bg-gray-200 transition-colors font-black text-[10px] uppercase tracking-[0.2em]"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white/90 backdrop-blur-2xl rounded-[2.5rem] p-10 border border-trust-50 shadow-glass">
              <h3 className="text-2xl font-heading font-black text-trust-950 uppercase tracking-tight mb-8">Generation Summary</h3>

              {results.lifeTable && (
                <div className="space-y-4">
                  <div className="bg-trust-50 p-6 rounded-2xl border border-trust-100">
                    <h4 className="text-[10px] font-black text-trust-950 uppercase tracking-[0.2em] mb-2 px-1">Population Model Ready</h4>
                    <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest px-1">
                      Ages {results.lifeTable.startAge} to {results.lifeTable.endAge} ({results.lifeTable.lifeTable.length} Data points)
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-6 bg-gray-50/50 rounded-2xl border border-gray-100">
                      <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Base Population</div>
                      <div className="text-sm font-bold text-trust-950 px-1">100,000</div>
                    </div>
                    <div className="text-center p-6 bg-gray-50/50 rounded-2xl border border-gray-100">
                      <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Interest Rate</div>
                      <div className="text-sm font-bold text-trust-950 px-1">{formatPercentage(results.lifeTable.interestRate)}</div>
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
            <div className="bg-white/90 backdrop-blur-2xl rounded-[2.5rem] p-10 border border-trust-50 shadow-glass overflow-hidden">
              <h3 className="text-2xl font-heading font-black text-trust-950 uppercase tracking-tight mb-8">Detailed Actuarial Table</h3>
              <div className="overflow-x-auto -mx-10">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50/50">
                      <th className="px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Age (x)</th>
                      <th className="px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                        <InlineMath math="l_x" />
                      </th>
                      <th className="px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                        <InlineMath math="d_x" />
                      </th>
                      <th className="px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                        <InlineMath math="q_x" />
                      </th>
                      <th className="px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                        <InlineMath math="p_x" />
                      </th>
                      <th className="px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                        <InlineMath math="D_x" />
                      </th>
                      <th className="px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                        <InlineMath math="N_x" />
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {results.lifeTable.lifeTable.map((row, index) => (
                      <tr key={index} className="hover:bg-gray-50/30 transition-colors">
                        <td className="px-6 py-4 text-sm font-bold text-trust-950">{row.age}</td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-400">{formatNumber(row.lx)}</td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-400">{formatNumber(row.dx)}</td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-400 font-mono">{formatPercentage(row.qx)}</td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-400 font-mono">{formatPercentage(row.px)}</td>
                        <td className="px-6 py-4 text-sm font-bold text-trust-950 font-mono">{formatNumber(results.lifeTable.commutationFunctions[index]?.Dx || 0)}</td>
                        <td className="px-6 py-4 text-sm font-bold text-growth-600 font-mono">{formatNumber(results.lifeTable.commutationFunctions[index]?.Nx || 0)}</td>
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
                    {calc.survivalProbability && formatPercentage(calc.survivalProbability)}
                    {calc.presentValue && formatCurrency(calc.presentValue)}
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

export default MortalityCalculator;
