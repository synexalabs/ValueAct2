'use client';

import React, { useState, useMemo } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    ReferenceLine
} from 'recharts';
import { calculations } from '../../utils/api';
import { formatCurrency, formatPercentage } from '../../utils/formatters';
import { useCalculation } from '../../hooks/useCalculation';

const DEFAULT_SCENARIOS = [
    { id: 'discount_up_100', name: 'Discount +100bps', param: 'discountRate', shock: 0.01 },
    { id: 'discount_up_50', name: 'Discount +50bps', param: 'discountRate', shock: 0.005 },
    { id: 'discount_down_50', name: 'Discount -50bps', param: 'discountRate', shock: -0.005 },
    { id: 'discount_down_100', name: 'Discount -100bps', param: 'discountRate', shock: -0.01 },
    { id: 'lapse_up_50', name: 'Lapse +50%', param: 'lapseRate', shockMultiplier: 1.5 },
    { id: 'lapse_down_50', name: 'Lapse -50%', param: 'lapseRate', shockMultiplier: 0.5 },
    { id: 'mortality_up_15', name: 'Mortality +15%', param: 'mortalityShock', shock: 0.15 },
    { id: 'mortality_down_15', name: 'Mortality -15%', param: 'mortalityShock', shock: -0.15 },
    { id: 'expense_up_10', name: 'Expense +10%', param: 'expenseInflation', shock: 0.10 },
];

export default function SensitivityAnalysis({
    portfolio,
    baseAssumptions,
    calculationType = 'ifrs17',
}) {
    const [selectedScenarios, setSelectedScenarios] = useState(
        DEFAULT_SCENARIOS.slice(0, 5).map(s => s.id)
    );
    const [results, setResults] = useState(null);
    const { loading, error, runSensitivity } = useCalculation();

    const scenarios = useMemo(() => {
        return DEFAULT_SCENARIOS.filter(s => selectedScenarios.includes(s.id)).map(s => ({
            name: s.name,
            shocks: s.shockMultiplier
                ? { [s.param]: (baseAssumptions?.[s.param] || 0.05) * s.shockMultiplier }
                : { [s.param]: (baseAssumptions?.[s.param] || 0) + s.shock },
        }));
    }, [selectedScenarios, baseAssumptions]);

    const handleRunAnalysis = async () => {
        if (!portfolio || portfolio.length === 0) return;

        const scenariosWithBase = [
            { name: 'Base', shocks: {} },
            ...scenarios,
        ];

        try {
            const result = await runSensitivity(
                calculationType,
                portfolio,
                baseAssumptions || {},
                scenariosWithBase
            );
            setResults(result);
        } catch (err) {
            console.error('Sensitivity analysis failed:', err);
        }
    };

    const chartData = useMemo(() => {
        if (!results?.scenarios) return [];

        const baseResult = results.scenarios.find(s => s.scenario === 'Base');
        const baseCSM = baseResult?.results?.total_csm || baseResult?.results?.csm || 0;

        return results.scenarios.map(s => {
            const csm = s.results?.total_csm || s.results?.csm || 0;
            return {
                scenario: s.scenario,
                csm,
                fcf: s.results?.total_fcf || s.results?.fcf || 0,
                ra: s.results?.total_risk_adjustment || s.results?.ra || 0,
                change: baseCSM !== 0 ? ((csm - baseCSM) / baseCSM) : 0,
                absoluteChange: csm - baseCSM,
            };
        });
    }, [results]);

    const toggleScenario = (scenarioId) => {
        setSelectedScenarios(prev =>
            prev.includes(scenarioId)
                ? prev.filter(id => id !== scenarioId)
                : [...prev, scenarioId]
        );
    };

    return (
        <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Sensitivity Analysis</h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Analyze impact of assumption changes on {calculationType.toUpperCase()} metrics
                    </p>
                </div>
                <button
                    onClick={handleRunAnalysis}
                    disabled={loading || selectedScenarios.length === 0 || !portfolio}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {loading ? 'Running...' : 'Run Analysis'}
                </button>
            </div>

            {/* Scenario Selection */}
            <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Select Scenarios</h3>
                <div className="flex flex-wrap gap-2">
                    {DEFAULT_SCENARIOS.map(scenario => (
                        <button
                            key={scenario.id}
                            onClick={() => toggleScenario(scenario.id)}
                            className={`px-3 py-1 rounded-full text-sm transition-colors ${selectedScenarios.includes(scenario.id)
                                ? 'bg-blue-100 text-blue-800 border border-blue-300'
                                : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
                                }`}
                        >
                            {scenario.name}
                        </button>
                    ))}
                </div>
            </div>

            {!portfolio && (
                <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg mb-4">
                    Please select or upload a portfolio to run sensitivity analysis.
                </div>
            )}

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                    {error}
                </div>
            )}

            {results && chartData.length > 0 && (
                <>
                    {/* Bar Chart */}
                    <div className="mb-8">
                        <h3 className="text-lg font-semibold mb-4">CSM Impact by Scenario</h3>
                        <ResponsiveContainer width="100%" height={400}>
                            <BarChart data={chartData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" tickFormatter={(v) => formatCurrency(v)} />
                                <YAxis type="category" dataKey="scenario" width={120} />
                                <Tooltip
                                    formatter={(value, name) => [formatCurrency(value), name]}
                                />
                                <Legend />
                                <ReferenceLine x={chartData[0]?.csm || 0} stroke="#666" strokeDasharray="3 3" />
                                <Bar dataKey="csm" fill="#3B82F6" name="CSM" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Results Table */}
                    <div className="mb-8">
                        <h3 className="text-lg font-semibold mb-4">Impact Analysis</h3>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                            Scenario
                                        </th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                            CSM
                                        </th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                            Change
                                        </th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                            % Change
                                        </th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                            FCF
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {chartData.map((row, idx) => (
                                        <tr key={row.scenario} className={idx === 0 ? 'bg-blue-50' : ''}>
                                            <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                                {row.scenario}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-right font-mono">
                                                {formatCurrency(row.csm)}
                                            </td>
                                            <td className={`px-4 py-3 text-sm text-right font-mono ${row.absoluteChange > 0 ? 'text-green-600' :
                                                row.absoluteChange < 0 ? 'text-red-600' : ''
                                                }`}>
                                                {idx === 0 ? '-' : formatCurrency(row.absoluteChange)}
                                            </td>
                                            <td className={`px-4 py-3 text-sm text-right font-mono ${row.change > 0 ? 'text-green-600' :
                                                row.change < 0 ? 'text-red-600' : ''
                                                }`}>
                                                {idx === 0 ? '-' : formatPercentage(row.change)}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-right font-mono">
                                                {formatCurrency(row.fcf)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Methodology Note */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Methodology</h4>
                        <p className="text-sm text-gray-600">
                            Sensitivity analysis applies shocks to base assumptions and recalculates all metrics
                            using the server-side calculation engine. Changes shown are relative to the base scenario.
                        </p>
                    </div>
                </>
            )}
        </div>
    );
}

