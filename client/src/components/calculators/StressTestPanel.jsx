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
    const colors = {
        high: 'bg-red-100 text-red-800 border-red-200',
        medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        low: 'bg-green-100 text-green-800 border-green-200',
    };

    return (
        <span className={`text-xs px-2 py-0.5 rounded-full border ${colors[severity] || colors.medium}`}>
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
            <div className="bg-white rounded-lg shadow-lg p-6 text-center text-gray-500">
                Select a portfolio to enable stress testing.
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900">Stress Testing</h2>
                <p className="text-sm text-gray-500 mt-1">
                    Regulatory and scenario-based stress tests for {calculationType.toUpperCase()}
                </p>
            </div>

            {error && (
                <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4 text-sm border border-red-200">
                    {error}
                </div>
            )}

            {/* Regulatory Scenarios */}
            <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4">Regulatory Scenarios</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {scenarios.map(scenario => {
                        const metricKey = calculationType === 'solvency' ? 'total_scr' : 'total_csm';
                        const impact = calculateImpact(scenario.id, metricKey);
                        const isRunning = loading[scenario.id];

                        return (
                            <div
                                key={scenario.id}
                                className="border rounded-lg p-4 hover:border-blue-500 transition-colors hover:shadow-sm"
                            >
                                <div className="flex items-start gap-3 mb-3">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className="font-medium text-gray-900">{scenario.name}</h4>
                                            <SeverityBadge severity={scenario.severity} />
                                        </div>
                                        <p className="text-xs text-gray-500 mb-1">{scenario.description}</p>
                                        <p className="text-xs text-blue-600">{scenario.regulation}</p>
                                    </div>
                                </div>

                                {stressResults[scenario.id] && impact && (
                                    <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">
                                                {calculationType === 'solvency' ? 'SCR Impact:' : 'CSM Impact:'}
                                            </span>
                                            <span className={`font-mono font-medium ${impact.relative > 0 ? 'text-red-600' : 'text-green-600'
                                                }`}>
                                                {formatCurrency(impact.absolute)}
                                                <span className="text-xs ml-1">
                                                    ({formatPercentage(impact.relative)})
                                                </span>
                                            </span>
                                        </div>
                                    </div>
                                )}

                                <button
                                    onClick={() => runStressTest(scenario)}
                                    disabled={isRunning}
                                    className={`w-full py-2 px-4 rounded-lg text-sm font-medium transition-colors ${isRunning
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        : 'bg-blue-600 text-white hover:bg-blue-700'
                                        }`}
                                >
                                    {isRunning ? 'Running...' : stressResults[scenario.id] ? 'Re-run' : 'Run Test'}
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Combined Scenarios */}
            <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4">Combined Scenarios</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {COMBINED_SCENARIOS.map(scenario => {
                        const metricKey = calculationType === 'solvency' ? 'total_scr' : 'total_csm';
                        const impact = calculateImpact(scenario.id, metricKey);
                        const isRunning = loading[scenario.id];

                        return (
                            <div
                                key={scenario.id}
                                className={`border-2 rounded-lg p-4 ${scenario.severity === 'high'
                                    ? 'border-red-200 bg-red-50'
                                    : 'border-yellow-200 bg-yellow-50'
                                    }`}
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    <h4 className="font-semibold text-gray-900">{scenario.name}</h4>
                                    <SeverityBadge severity={scenario.severity} />
                                </div>
                                <p className="text-sm text-gray-600 mb-3">{scenario.description}</p>

                                <div className="text-xs text-gray-500 mb-3">
                                    <strong>Shocks:</strong>{' '}
                                    {Object.entries(scenario.shocks).map(([k, v]) => (
                                        <span key={k} className="mr-2">
                                            {k}: {typeof v === 'number' ? formatPercentage(v) : String(v)}
                                        </span>
                                    ))}
                                </div>

                                {stressResults[scenario.id] && impact && (
                                    <div className="p-3 bg-white rounded-lg mb-3">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Impact:</span>
                                            <span className={`font-mono font-medium ${impact.relative > 0 ? 'text-red-600' : 'text-green-600'
                                                }`}>
                                                {formatCurrency(impact.absolute)} ({formatPercentage(impact.relative)})
                                            </span>
                                        </div>
                                    </div>
                                )}

                                <button
                                    onClick={() => runStressTest(scenario)}
                                    disabled={isRunning}
                                    className={`w-full py-2 px-4 rounded-lg text-sm font-medium ${isRunning
                                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                        : scenario.severity === 'high'
                                            ? 'bg-red-600 text-white hover:bg-red-700'
                                            : 'bg-yellow-600 text-white hover:bg-yellow-700'
                                        }`}
                                >
                                    {isRunning ? 'Running...' : 'Run Combined Test'}
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Methodology */}
            <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Stress Test Methodology</h4>
                <p className="text-sm text-gray-600">
                    Stress tests are applied instantaneously to the current portfolio. Results show the
                    impact on key metrics compared to the base scenario. Regulatory scenarios follow
                    {calculationType === 'solvency' ? ' Solvency II Standard Formula' : ' IFRS 17'} specifications.
                </p>
            </div>
        </div>
    );
}

