import React, { useState } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import { calculations } from '../../utils/api';
import { formatCurrency } from '../../utils/formatters';

export default function SensitivityAnalysis({ portfolio, baseAssumptions }) {
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const runSensitivityAnalysis = async () => {
        setLoading(true);
        setError(null);

        // Define shock scenarios to test
        const scenarios = [
            { name: 'Base', discount_rate: baseAssumptions.discount_rate || 0.035 },
            { name: '-100bps', discount_rate: (baseAssumptions.discount_rate || 0.035) - 0.01 },
            { name: '-50bps', discount_rate: (baseAssumptions.discount_rate || 0.035) - 0.005 },
            { name: '+50bps', discount_rate: (baseAssumptions.discount_rate || 0.035) + 0.005 },
            { name: '+100bps', discount_rate: (baseAssumptions.discount_rate || 0.035) + 0.01 },
        ];

        try {
            // Run scenarios in parallel
            const scenarioResults = await Promise.all(
                scenarios.map(async (scenario) => {
                    try {
                        const response = await calculations.runIFRS17(portfolio, {
                            ...baseAssumptions,
                            discount_rate: scenario.discount_rate,
                        });

                        // Extract aggregate results
                        // Adjust based on actual response structure
                        const resultData = response.data.results || response.data;

                        return {
                            scenario: scenario.name,
                            csm: resultData.total_csm || resultData.csm || 0,
                            fcf: resultData.total_fcf || resultData.fcf || 0,
                            loss_component: resultData.total_loss_component || resultData.lossComponent || 0
                        };
                    } catch (err) {
                        console.error(`Failed scenario ${scenario.name}:`, err);
                        return {
                            scenario: scenario.name,
                            csm: 0,
                            fcf: 0,
                            error: true
                        };
                    }
                })
            );

            setResults(scenarioResults);
        } catch (err) {
            setError('Failed to run sensitivity analysis');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-800">Sensitivity Analysis (Discount Rate)</h3>
                <button
                    onClick={runSensitivityAnalysis}
                    disabled={loading || !portfolio}
                    className={`px-4 py-2 rounded-lg font-medium text-white transition-colors ${loading || !portfolio
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                >
                    {loading ? 'Running Analysis...' : 'Run Analysis'}
                </button>
            </div>

            {!portfolio && (
                <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg mb-4">
                    Please select or upload a portfolio to run sensitivity analysis.
                </div>
            )}

            {error && (
                <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-4">
                    {error}
                </div>
            )}

            {results && (
                <div className="space-y-8">
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={results} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="scenario" />
                                <YAxis />
                                <Tooltip
                                    formatter={(value) => formatCurrency(value)}
                                    labelStyle={{ color: '#374151' }}
                                />
                                <Legend />
                                <Line type="monotone" dataKey="csm" stroke="#3B82F6" name="CSM" strokeWidth={2} activeDot={{ r: 8 }} />
                                <Line type="monotone" dataKey="fcf" stroke="#10B981" name="FCF" strokeWidth={2} />
                                <Line type="monotone" dataKey="loss_component" stroke="#EF4444" name="Loss Component" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Scenario</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">CSM</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">FCF</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Loss Component</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {results.map((row, idx) => (
                                    <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{row.scenario}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">{formatCurrency(row.csm)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">{formatCurrency(row.fcf)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">{formatCurrency(row.loss_component)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
