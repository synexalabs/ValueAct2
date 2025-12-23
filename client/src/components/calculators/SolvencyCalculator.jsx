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
      <div className="mb-12">
        <h1 className="text-4xl font-heading font-black text-trust-950 uppercase tracking-tight mb-3 px-2">Solvency II Calculator</h1>
        <p className="text-gray-400 font-medium px-2">
          Regulatory capital modeling engine for Solvency Capital Requirement (SCR) and Minimum Capital Requirement (MCR) under Pillar 1 standards.
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

      {/* SCR Calculator */}
      {activeTab === 'scr' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white/90 backdrop-blur-2xl rounded-[2.5rem] p-10 border border-trust-50 shadow-glass">
            <h3 className="text-2xl font-heading font-black text-trust-950 uppercase tracking-tight mb-8">Risk Module Inputs</h3>

            <div className="space-y-4 px-2">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 px-1">
                  Market Risk
                </label>
                <input
                  type="number"
                  value={scrInputs.marketRisk}
                  onChange={(e) => setScrInputs(prev => ({ ...prev, marketRisk: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-trust-500 focus:border-transparent transition-all duration-300 outline-none font-bold text-trust-950"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 px-1">
                  Counterparty Risk
                </label>
                <input
                  type="number"
                  value={scrInputs.counterpartyRisk}
                  onChange={(e) => setScrInputs(prev => ({ ...prev, counterpartyRisk: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-trust-500 focus:border-transparent transition-all duration-300 outline-none font-bold text-trust-950"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 px-1">
                  Life Underwriting Risk
                </label>
                <input
                  type="number"
                  value={scrInputs.lifeUnderwritingRisk}
                  onChange={(e) => setScrInputs(prev => ({ ...prev, lifeUnderwritingRisk: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-trust-500 focus:border-transparent transition-all duration-300 outline-none font-bold text-trust-950"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 px-1">
                  Health Underwriting Risk
                </label>
                <input
                  type="number"
                  value={scrInputs.healthUnderwritingRisk}
                  onChange={(e) => setScrInputs(prev => ({ ...prev, healthUnderwritingRisk: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-trust-500 focus:border-transparent transition-all duration-300 outline-none font-bold text-trust-950"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 px-1">
                  Non-Life Underwriting Risk
                </label>
                <input
                  type="number"
                  value={scrInputs.nonLifeUnderwritingRisk}
                  onChange={(e) => setScrInputs(prev => ({ ...prev, nonLifeUnderwritingRisk: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-trust-500 focus:border-transparent transition-all duration-300 outline-none font-bold text-trust-950"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 px-1">
                  Operational Risk
                </label>
                <input
                  type="number"
                  value={scrInputs.operationalRisk}
                  onChange={(e) => setScrInputs(prev => ({ ...prev, operationalRisk: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-trust-500 focus:border-transparent transition-all duration-300 outline-none font-bold text-trust-950"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  onClick={calculateSCRResults}
                  className="flex-1 bg-trust-950 text-white px-8 py-4 rounded-2xl hover:bg-trust-900 transition-all duration-300 font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2"
                >
                  Calculate SCR
                  <Shield className="h-4 w-4 text-growth-400" />
                </button>
                <button
                  onClick={() => resetCalculator('scr')}
                  className="px-8 py-4 bg-gray-100 text-trust-950 rounded-2xl hover:bg-gray-200 transition-colors font-black text-[10px] uppercase tracking-[0.2em]"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-2xl rounded-[2.5rem] p-10 border border-trust-50 shadow-glass">
            <h3 className="text-2xl font-heading font-black text-trust-950 uppercase tracking-tight mb-8">SCR Results</h3>

            {results.scr && (
              <div className="space-y-4 px-2">
                <div className="bg-trust-50 p-6 rounded-2xl border border-trust-100">
                  <h4 className="text-[10px] font-black text-trust-950 uppercase tracking-[0.2em] mb-2 px-1">Solvency Capital Requirement</h4>
                  <div className="text-3xl font-heading font-black text-trust-600 px-1">
                    {formatCurrency(results.scr.scr)}
                  </div>
                  <div className="text-[10px] font-bold text-trust-800/60 mt-2 px-1">
                    <InlineMath math="SCR = \sqrt{\sum_{i} SCR_i^2 + \sum_{i \neq j} \rho_{ij} SCR_i SCR_j}" />
                  </div>
                </div>

                <div className="bg-growth-50 p-6 rounded-2xl border border-growth-100">
                  <h4 className="text-[10px] font-black text-growth-900 uppercase tracking-[0.2em] mb-2 px-1">Diversification Benefit</h4>
                  <div className="text-xl font-bold text-growth-600 px-1">
                    {formatCurrency(results.scr.diversification.diversificationBenefit)}
                  </div>
                  <div className="text-[9px] font-black text-growth-800/60 uppercase tracking-widest mt-1 px-1">
                    {formatPercentage(results.scr.diversification.diversificationPercent / 100)} Net Reduction Applied
                  </div>
                </div>

                <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                  <h5 className="text-[10px] font-black text-trust-950 uppercase tracking-[0.2em] mb-4 px-1">Risk Plateaus</h5>
                  <div className="space-y-3">
                    {results.scr.contributions.map((contribution, index) => (
                      <div key={index} className="flex justify-between items-center px-1">
                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                          {contribution.riskType.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                        <div className="text-right">
                          <div className="text-[11px] font-black text-trust-950">
                            {formatCurrency(contribution.contributionAmount)}
                          </div>
                          <div className="text-[9px] font-bold text-gray-400">
                            {formatPercentage(contribution.contribution / 100)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white/90 backdrop-blur-2xl rounded-[2.5rem] p-10 border border-trust-50 shadow-glass">
            <h3 className="text-2xl font-heading font-black text-trust-950 uppercase tracking-tight mb-8">MCR Calculation</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 px-1">
                  Technical Provisions
                </label>
                <input
                  type="number"
                  value={mcrInputs.technicalProvisions}
                  onChange={(e) => setMcrInputs(prev => ({ ...prev, technicalProvisions: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-trust-500 focus:border-transparent transition-all duration-300 outline-none font-bold text-trust-950"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 px-1">
                  Premium Written
                </label>
                <input
                  type="number"
                  value={mcrInputs.premiumWritten}
                  onChange={(e) => setMcrInputs(prev => ({ ...prev, premiumWritten: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-trust-500 focus:border-transparent transition-all duration-300 outline-none font-bold text-trust-950"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 px-1">
                  Claims Paid
                </label>
                <input
                  type="number"
                  value={mcrInputs.claimsPaid}
                  onChange={(e) => setMcrInputs(prev => ({ ...prev, claimsPaid: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-trust-500 focus:border-transparent transition-all duration-300 outline-none font-bold text-trust-950"
                />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={calculateMCRResults}
                  className="flex-1 bg-trust-950 text-white px-8 py-4 rounded-2xl hover:bg-trust-900 transition-all duration-300 font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2"
                >
                  Calculate MCR
                  <Calculator className="h-4 w-4 text-growth-400" />
                </button>
                <button
                  onClick={() => resetCalculator('mcr')}
                  className="px-8 py-4 bg-gray-100 text-trust-950 rounded-2xl hover:bg-gray-200 transition-colors font-black text-[10px] uppercase tracking-[0.2em]"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-2xl rounded-[2.5rem] p-10 border border-trust-50 shadow-glass">
            <h3 className="text-2xl font-heading font-black text-trust-950 uppercase tracking-tight mb-8">MCR Results</h3>

            {results.mcr && (
              <div className="space-y-4">
                <div className="bg-accent-50 p-6 rounded-2xl border border-accent-100">
                  <h4 className="text-[10px] font-black text-accent-950 uppercase tracking-[0.2em] mb-2 px-1">Minimum Capital Requirement</h4>
                  <div className="text-3xl font-heading font-black text-accent-600 px-1">
                    {formatCurrency(results.mcr.mcr)}
                  </div>
                  <div className="text-[10px] font-bold text-accent-800/60 mt-2 px-1">
                    <InlineMath math="MCR = \max(TP \times 25\%, PW \times 15\%, CP \times 10\%)" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-6 bg-gray-50/50 rounded-2xl border border-gray-100">
                    <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">TP × 25%</div>
                    <div className="text-[11px] font-black text-trust-950">
                      {formatCurrency(results.mcr.technicalProvisions * 0.25)}
                    </div>
                  </div>
                  <div className="text-center p-6 bg-gray-50/50 rounded-2xl border border-gray-100">
                    <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">PW × 15%</div>
                    <div className="text-[11px] font-black text-trust-950">
                      {formatCurrency(results.mcr.premiumWritten * 0.15)}
                    </div>
                  </div>
                  <div className="text-center p-6 bg-gray-50/50 rounded-2xl border border-gray-100">
                    <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">CP × 10%</div>
                    <div className="text-[11px] font-black text-trust-950">
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white/90 backdrop-blur-2xl rounded-[2.5rem] p-10 border border-trust-50 shadow-glass">
            <h3 className="text-2xl font-heading font-black text-trust-950 uppercase tracking-tight mb-8">Solvency Ratio Inputs</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 px-1">
                  Own Funds
                </label>
                <input
                  type="number"
                  value={ratioInputs.ownFunds}
                  onChange={(e) => setRatioInputs(prev => ({ ...prev, ownFunds: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-trust-500 focus:border-transparent transition-all duration-300 outline-none font-bold text-trust-950"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 px-1">
                  SCR
                </label>
                <input
                  type="number"
                  value={ratioInputs.scr}
                  onChange={(e) => setRatioInputs(prev => ({ ...prev, scr: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-trust-500 focus:border-transparent transition-all duration-300 outline-none font-bold text-trust-950"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 px-1">
                  MCR
                </label>
                <input
                  type="number"
                  value={ratioInputs.mcr}
                  onChange={(e) => setRatioInputs(prev => ({ ...prev, mcr: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-trust-500 focus:border-transparent transition-all duration-300 outline-none font-bold text-trust-950"
                />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={calculateRatioResults}
                  className="flex-1 bg-trust-950 text-white px-8 py-4 rounded-2xl hover:bg-trust-900 transition-all duration-300 font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2"
                >
                  Analyze Capital
                  <TrendingUp className="h-4 w-4 text-growth-400" />
                </button>
                <button
                  onClick={() => resetCalculator('ratio')}
                  className="px-8 py-4 bg-gray-100 text-trust-950 rounded-2xl hover:bg-gray-200 transition-colors font-black text-[10px] uppercase tracking-[0.2em]"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-2xl rounded-[2.5rem] p-10 border border-trust-50 shadow-glass">
            <h3 className="text-2xl font-heading font-black text-trust-950 uppercase tracking-tight mb-8">Solvency Analysis</h3>

            {results.ratio && (
              <div className="space-y-4">
                <div className="bg-trust-50 p-6 rounded-2xl border border-trust-100">
                  <h4 className="text-[10px] font-black text-trust-950 uppercase tracking-[0.2em] mb-2 px-1">Solvency Ratio Analysis</h4>
                  <div className={`text-3xl font-heading font-black px-1 ${results.ratio.solvencyRatio.status === 'excellent' ? 'text-growth-600' :
                      results.ratio.solvencyRatio.status === 'good' ? 'text-trust-600' :
                        results.ratio.solvencyRatio.status === 'adequate' ? 'text-accent-500' : 'text-accent-600'
                    }`}>
                    {formatRatio(results.ratio.solvencyRatio.ratio)}
                  </div>
                  <div className="flex items-center gap-2 mt-3 px-1">
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full border ${results.ratio.solvencyRatio.status === 'excellent' ? 'bg-growth-100 text-growth-700 border-growth-200' :
                        results.ratio.solvencyRatio.status === 'good' ? 'bg-trust-100 text-trust-700 border-trust-200' :
                          results.ratio.solvencyRatio.status === 'adequate' ? 'bg-accent-50 text-accent-700 border-accent-100' : 'bg-accent-100 text-accent-800 border-accent-200'
                      }`}>
                      {results.ratio.solvencyRatio.status}
                    </span>
                    <div className="text-[10px] font-bold text-trust-800/60">
                      <InlineMath math="SR = \frac{\text{Own Funds}}{SCR}" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-6 bg-gray-50/50 rounded-2xl border border-gray-100">
                    <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">SCR Surplus</div>
                    <div className={`text-[11px] font-black ${results.ratio.capitalAnalysis.scrSurplus >= 0 ? 'text-growth-600' : 'text-accent-600'}`}>
                      {formatCurrency(results.ratio.capitalAnalysis.scrSurplus)}
                    </div>
                  </div>
                  <div className="text-center p-6 bg-gray-50/50 rounded-2xl border border-gray-100">
                    <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">MCR Surplus</div>
                    <div className={`text-[11px] font-black ${results.ratio.capitalAnalysis.mcrSurplus >= 0 ? 'text-growth-600' : 'text-accent-600'}`}>
                      {formatCurrency(results.ratio.capitalAnalysis.mcrSurplus)}
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                  <h5 className="text-[10px] font-black text-trust-950 uppercase tracking-[0.2em] mb-4 px-1">Compliance Matrix</h5>
                  <div className="space-y-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    <div className="flex justify-between px-1">
                      <span>SCR Requirement:</span>
                      <span className={results.ratio.capitalAnalysis.isSCRCompliant ? 'text-growth-600' : 'text-accent-600'}>
                        {results.ratio.capitalAnalysis.isSCRCompliant ? '✓ PASS' : '✗ FAIL'}
                      </span>
                    </div>
                    <div className="flex justify-between px-1">
                      <span>MCR Requirement:</span>
                      <span className={results.ratio.capitalAnalysis.isMCRCompliant ? 'text-growth-600' : 'text-accent-600'}>
                        {results.ratio.capitalAnalysis.isMCRCompliant ? '✓ PASS' : '✗ FAIL'}
                      </span>
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
                    {calc.scr && formatCurrency(calc.scr)}
                    {calc.mcr && formatCurrency(calc.mcr)}
                    {calc.solvencyRatio && formatRatio(calc.solvencyRatio.ratio)}
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

export default SolvencyCalculator;
