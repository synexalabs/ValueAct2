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
        <div className="bg-white/90 backdrop-blur-2xl rounded-[2.5rem] p-10 border border-trust-50 shadow-glass">
            <div className="flex justify-between items-start mb-10">
                <div>
                    <h2 className="text-3xl font-heading font-black text-trust-950 uppercase tracking-tight mb-2">Sensitivity Analysis</h2>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                        Assumption Shock Modeling ({calculationType.toUpperCase()} Standard)
                    </p>
                </div>
                <button
                    onClick={handleRunAnalysis}
                    disabled={loading || selectedScenarios.length === 0 || !portfolio}
                    className="bg-trust-950 text-white px-8 py-4 rounded-2xl hover:bg-trust-900 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300 font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-2"
                >
                    {loading ? 'Processing Shock...' : 'Run Analysis'}
                </button>
            </div>

            {/* Scenario Selection */}
            <div className="mb-10">
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Select Stress Vectors</h3>
                <div className="flex flex-wrap gap-2">
                    {DEFAULT_SCENARIOS.map(scenario => (
                        <button
                            key={scenario.id}
                            onClick={() => toggleScenario(scenario.id)}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 border ${selectedScenarios.includes(scenario.id)
                                ? 'bg-trust-950 text-growth-400 border-trust-950 shadow-md'
                                : 'bg-gray-50 text-gray-400 border-gray-100 hover:text-trust-950 hover:bg-gray-100'
                                }`}
                        >
                            {scenario.name}
                        </button>
                    ))}
                </div>
            </div>

            {!portfolio && (
                <div className="text-center py-16 bg-gray-50/50 rounded-3xl border border-dashed border-gray-100 mb-4">
                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Data Injection Required</div>
                    <p className="text-xs text-gray-400 mt-2">Please select or upload a portfolio to run sensitivity analysis.</p>
                </div>
            )}

            {error && (
                <div className="mb-6 p-6 bg-accent-50/50 border border-accent-100 rounded-2xl text-accent-700 text-[11px] font-bold uppercase tracking-widest">
                    <span className="flex items-center gap-2 text-accent-900">
                        <span className="w-1 h-1 bg-accent-500 rounded-full animate-pulse" />
                        {error}
                    </span>
                </div>
            )}

            {results && chartData.length > 0 && (
                <>
                    {/* Bar Chart */}
                    <div className="mb-12">
                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6 px-1">Risk Exposure Delta (CSM)</h3>
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
                                <Bar dataKey="csm" fill="#0A0F1D" radius={[0, 8, 8, 0]} name="CSM" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Results Table */}
                    <div className="mb-12">
                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6 px-1">Scenario Sensitivity matrix</h3>
                        <div className="overflow-x-auto -mx-10 px-10">
                            <table className="min-w-full">
                                <thead>
                                    <tr className="bg-gray-50/50">
                                        <th className="px-6 py-4 text-left text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Scenario</th>
                                        <th className="px-6 py-4 text-right text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">CSM Delta</th>
                                        <th className="px-6 py-4 text-right text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Abs Change</th>
                                        <th className="px-6 py-4 text-right text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">% Impact</th>
                                        <th className="px-6 py-4 text-right text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">FCF Effect</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {chartData.map((row, idx) => (
                                        <tr key={row.scenario} className={`hover:bg-gray-50/30 transition-colors ${idx === 0 ? 'bg-trust-50/50' : ''}`}>
                                            <td className="px-6 py-4 text-[11px] font-black text-trust-950 uppercase tracking-tight">
                                                {row.scenario}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-right font-bold text-trust-950">
                                                {formatCurrency(row.csm)}
                                            </td>
                                            <td className={`px-6 py-4 text-[11px] text-right font-black tracking-tighter ${row.absoluteChange > 0 ? 'text-growth-600' :
                                                row.absoluteChange < 0 ? 'text-accent-600' : 'text-gray-400'
                                                }`}>
                                                {idx === 0 ? 'BASELINE' : formatCurrency(row.absoluteChange)}
                                            </td>
                                            <td className={`px-6 py-4 text-[11px] text-right font-black tracking-tighter ${row.change > 0 ? 'text-growth-600' :
                                                row.change < 0 ? 'text-accent-600' : 'text-gray-400'
                                                }`}>
                                                {idx === 0 ? '0.00%' : formatPercentage(row.change)}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-right font-medium text-gray-400">
                                                {formatCurrency(row.fcf)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Methodology Note */}
                    {/* Methodology Note */}
                    <div className="bg-trust-950 p-8 rounded-3xl border border-trust-900 shadow-xl overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-growth-400/10 blur-[100px] rounded-full -mr-32 -mt-32" />
                        <h4 className="text-[10px] font-black text-growth-400 uppercase tracking-[0.2em] mb-3 relative z-10">Actuarial Methodology Note</h4>
                        <p className="text-sm text-gray-400 leading-relaxed font-medium relative z-10">
                            The sensitivity engine applies granular shocks to the base assumption vectors (discount, lapse, mortality, expense) and executes full re-estimations of the FCF, CSM, and Risk Adjustment under the specified methodology ({calculationType.toUpperCase()}). All deltas are computed relative to the baseline production scenario.
                        </p>
                    </div>
                </>
            )}
        </div>
    );
}

