'use client';

import React, { useState } from 'react';
import { calculations } from '../../utils/api';
import { formatCurrency, formatPercentage } from '../../utils/formatters';

const REGULATORY_SCENARIOS = {
    solvency: [
        {
            id: 'equity_stress',
            name: 'Equity Stress',
            description: 'Type 1 equities: 39% shock, Type 2: 49% shock',
            shocks: { equity_shock: -0.39 },
            regulation: 'SII Art. 169',
            severity: 'high',
        },
        {
            id: 'interest_rate_down',
            name: 'Interest Rate Down',
            description: 'Parallel shift down per EIOPA curve',
            shocks: { rate_shock_down: true },
            regulation: 'SII Art. 166',
            severity: 'medium',
        },
        {
            id: 'interest_rate_up',
            name: 'Interest Rate Up',
            description: 'Parallel shift up per EIOPA curve',
            shocks: { rate_shock_up: true },
            regulation: 'SII Art. 166',
            severity: 'medium',
        },
        {
            id: 'mortality_cat',
            name: 'Mortality Catastrophe',
            description: '0.15% additional mortality rate for 1 year',
            shocks: { mortality_cat: 0.0015 },
            regulation: 'SII Art. 136',
            severity: 'high',
        },
        {
            id: 'mass_lapse_up',
            name: 'Mass Lapse Up',
            description: '40% immediate surrender of policies',
            shocks: { mass_lapse: 0.40 },
            regulation: 'SII Art. 142',
            severity: 'high',
        },
    ],
    ifrs17: [
        {
            id: 'discount_100bp',
            name: 'Discount Rate +100bp',
            description: 'Parallel increase in risk-free rates',
            shocks: { discount_shock: 0.01 },
            regulation: 'IFRS 17.36',
            severity: 'medium',
        },
        {
            id: 'discount_minus_100bp',
            name: 'Discount Rate -100bp',
            description: 'Parallel decrease in risk-free rates',
            shocks: { discount_shock: -0.01 },
            regulation: 'IFRS 17.36',
            severity: 'medium',
        },
        {
            id: 'expense_inflation',
            name: 'Expense Inflation +2%',
            description: 'Increase in expense inflation assumption',
            shocks: { expense_inflation_shock: 0.02 },
            regulation: 'IFRS 17.33',
            severity: 'low',
        },
        {
            id: 'mortality_15',
            name: 'Mortality +15%',
            description: '15% increase in all mortality rates',
            shocks: { mortality_shock: 0.15 },
            regulation: 'IFRS 17.33',
            severity: 'medium',
        },
    ],
};

const COMBINED_SCENARIOS = [
    {
        id: 'adverse_combined',
        name: 'Adverse Combined',
        description: 'Multiple adverse scenarios occurring simultaneously',
        shocks: {
            equity_shock: -0.25,
            discount_shock: 0.01,
            mortality_shock: 0.10,
            lapse_shock: 0.20,
        },
        severity: 'high',
    },
    {
        id: 'moderate_stress',
        name: 'Moderate Stress',
        description: 'Moderate deterioration across all risk factors',
        shocks: {
            equity_shock: -0.15,
            discount_shock: 0.005,
            mortality_shock: 0.05,
            lapse_shock: 0.10,
        },
        severity: 'medium',
    },
];

const SeverityBadge = ({ severity }) => {
    const styles = {
        high: 'bg-accent-50 text-accent-700 border-accent-100',
        medium: 'bg-trust-50 text-trust-700 border-trust-100',
        low: 'bg-growth-50 text-growth-700 border-growth-100',
    };

    return (
        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${styles[severity] || styles.medium}`}>
            {severity}
        </span>
    );
};

export default function StressTestPanel({
    portfolio,
    baseResults,
    calculationType = 'solvency',
}) {
    const [stressResults, setStressResults] = useState({});
    const [loading, setLoading] = useState({});
    const [error, setError] = useState(null);

    const scenarios = REGULATORY_SCENARIOS[calculationType] || REGULATORY_SCENARIOS.solvency;

    const runStressTest = async (scenario) => {
        setLoading(prev => ({ ...prev, [scenario.id]: true }));
        setError(null);

        try {
            const response = calculationType === 'solvency'
                ? await calculations.runSolvency(portfolio, {
                    stress_scenario: scenario.id,
                    ...scenario.shocks,
                })
                : await calculations.runIFRS17(portfolio, {
                    stress_scenario: scenario.id,
                    ...scenario.shocks,
                });

            const resultData = response.data?.calculation?.results || response.data?.results || response.data;

            setStressResults(prev => ({
                ...prev,
                [scenario.id]: resultData,
            }));
        } catch (err) {
            console.error(`Stress test failed for ${scenario.name}:`, err);
            setError(`Failed to run ${scenario.name}`);
        } finally {
            setLoading(prev => ({ ...prev, [scenario.id]: false }));
        }
    };

    const calculateImpact = (scenarioId, metric) => {
        const stressedValue = stressResults[scenarioId]?.[metric] || stressResults[scenarioId]?.aggregate_results?.[metric];
        const baseValue = baseResults?.[metric] || baseResults?.aggregate_results?.[metric];

        if (stressedValue === undefined || baseValue === undefined) return null;

        return {
            absolute: stressedValue - baseValue,
            relative: baseValue !== 0 ? (stressedValue - baseValue) / Math.abs(baseValue) : 0,
        };
    };

    if (!portfolio) {
        return (
            <div className="bg-white/90 backdrop-blur-2xl rounded-[2.5rem] p-16 border border-trust-50 shadow-glass text-center">
                <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Simulation Engine Idle</div>
                <p className="text-xs text-gray-400 font-medium">Select a portfolio to enable regulatory stress testing.</p>
            </div>
        );
    }

    return (
        <div className="bg-white/90 backdrop-blur-2xl rounded-[2.5rem] p-10 border border-trust-50 shadow-glass">
            <div className="mb-10">
                <h2 className="text-3xl font-heading font-black text-trust-950 uppercase tracking-tight mb-2">Regulatory Stress Testing</h2>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                    Systemic Risk Modeling ({calculationType.toUpperCase()})
                </p>
            </div>

            {error && (
                <div className="mb-6 p-6 bg-accent-50/50 border border-accent-100 rounded-2xl text-accent-700 text-[11px] font-bold uppercase tracking-widest flex items-center gap-2">
                    <span className="w-1 h-1 bg-accent-500 rounded-full animate-pulse" />
                    {error}
                </div>
            )}

            {/* Regulatory Scenarios */}
            <div className="mb-12">
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6 px-1">Pillar 1 Regulatory Scenarios</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {scenarios.map(scenario => {
                        const metricKey = calculationType === 'solvency' ? 'total_scr' : 'total_csm';
                        const impact = calculateImpact(scenario.id, metricKey);
                        const isRunning = loading[scenario.id];

                        return (
                            <div
                                key={scenario.id}
                                className="group bg-gray-50/50 border border-gray-100 rounded-2xl p-6 hover:border-trust-200 transition-all duration-300 hover:shadow-md"
                            >
                                <div className="flex flex-col mb-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="text-[11px] font-black text-trust-950 uppercase tracking-widest">{scenario.name}</h4>
                                        <SeverityBadge severity={scenario.severity} />
                                    </div>
                                    <p className="text-[10px] font-bold text-gray-400 leading-relaxed mb-3">{scenario.description}</p>
                                    <p className="text-[9px] font-black text-trust-500 uppercase tracking-[0.2em]">{scenario.regulation}</p>
                                </div>

                                {stressResults[scenario.id] && impact && (
                                    <div className="mb-4 p-4 bg-white/50 rounded-xl border border-white/80 shadow-sm">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                                                {calculationType === 'solvency' ? 'SCR Impact' : 'CSM Impact'}
                                            </span>
                                            <div className="text-right">
                                                <span className={`text-[11px] font-black tracking-tighter block ${impact.relative > 0 ? 'text-accent-600' : 'text-growth-600'}`}>
                                                    {formatCurrency(impact.absolute)}
                                                </span>
                                                <span className={`text-[9px] font-bold ${impact.relative > 0 ? 'text-accent-500' : 'text-growth-500'}`}>
                                                    {formatPercentage(impact.relative)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <button
                                    onClick={() => runStressTest(scenario)}
                                    disabled={isRunning}
                                    className={`w-full py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${isRunning
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        : 'bg-trust-950 text-white hover:bg-trust-900 shadow-sm hover:shadow-md'
                                        }`}
                                >
                                    {isRunning ? 'Processing...' : stressResults[scenario.id] ? 'Re-run Analysis' : 'Execute Test'}
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Combined Scenarios */}
            <div className="mb-12">
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6 px-1">Internal Risk Aggregation</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {COMBINED_SCENARIOS.map(scenario => {
                        const metricKey = calculationType === 'solvency' ? 'total_scr' : 'total_csm';
                        const impact = calculateImpact(scenario.id, metricKey);
                        const isRunning = loading[scenario.id];

                        return (
                            <div
                                key={scenario.id}
                                className={`rounded-[2rem] p-8 border-2 transition-all duration-300 ${scenario.severity === 'high'
                                    ? 'border-accent-100 bg-accent-50/30'
                                    : 'border-trust-100 bg-trust-50/30'
                                    }`}
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="text-[13px] font-heading font-black text-trust-950 uppercase tracking-tight">{scenario.name}</h4>
                                    <SeverityBadge severity={scenario.severity} />
                                </div>
                                <p className="text-[11px] font-bold text-gray-500 mb-6 leading-relaxed italic">{scenario.description}</p>

                                <div className="grid grid-cols-2 gap-2 mb-6">
                                    {Object.entries(scenario.shocks).map(([k, v]) => (
                                        <div key={k} className="bg-white/50 px-3 py-2 rounded-xl border border-white/80">
                                            <div className="text-[8px] font-black text-gray-400 uppercase tracking-widest truncate">{k.replace('_', ' ')}</div>
                                            <div className="text-[10px] font-black text-trust-950">
                                                {typeof v === 'number' ? formatPercentage(v) : String(v)}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {stressResults[scenario.id] && impact && (
                                    <div className="mb-6 p-5 bg-white rounded-2xl border border-white shadow-sm">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Aggregate Impact</span>
                                            <div className="text-right">
                                                <span className={`text-sm font-black tracking-tighter block ${impact.relative > 0 ? 'text-accent-600' : 'text-growth-600'}`}>
                                                    {formatCurrency(impact.absolute)}
                                                </span>
                                                <span className={`text-[10px] font-bold ${impact.relative > 0 ? 'text-accent-500' : 'text-growth-500'}`}>
                                                    {formatPercentage(impact.relative)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <button
                                    onClick={() => runStressTest(scenario)}
                                    disabled={isRunning}
                                    className={`w-full py-4 px-6 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${isRunning
                                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                        : scenario.severity === 'high'
                                            ? 'bg-accent-600 text-white hover:bg-accent-700 shadow-lg shadow-accent-200'
                                            : 'bg-trust-950 text-white hover:bg-trust-900 shadow-lg shadow-trust-200'
                                        }`}
                                >
                                    {isRunning ? 'Running Analysis...' : 'Execute Aggregation'}
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Methodology */}
            {/* Methodology */}
            <div className="bg-trust-950 p-8 rounded-3xl border border-trust-900 shadow-xl overflow-hidden relative mt-12">
                <div className="absolute top-0 right-0 w-64 h-64 bg-accent-400/10 blur-[100px] rounded-full -mr-32 -mt-32" />
                <h4 className="text-[10px] font-black text-accent-400 uppercase tracking-[0.2em] mb-3 relative z-10">Stress Test Methodology</h4>
                <p className="text-sm text-gray-400 leading-relaxed font-medium relative z-10">
                    Stress modeling is executed as instantaneous shocks to the current recognition period. Results indicate the immediate delta in solvency and profitability metrics compared to the baseline audited scenario. Regulatory scenarios are modeled in compliance with {calculationType === 'solvency' ? 'Solvency II Standard Formula' : 'IFRS 17 Transition'} standards.
                </p>
            </div>
        </div>
    );
}

