import React, { useState } from 'react';
import { calculations } from '../../utils/api';
import { formatCurrency, formatPercentage } from '../../utils/formatters';

const STRESS_SCENARIOS = [
    {
        id: 'market_crash',
        name: 'Market Crash',
        description: '30% equity decline, 100bps rate increase',
        shocks: { equity_shock: -0.30, rate_shock: 0.01 }
    },
    {
        id: 'mortality_cat',
        name: 'Mortality Catastrophe',
        description: '150% mortality spike for 1 year',
        shocks: { mortality_shock: 1.5 }
    },
    {
        id: 'lapse_crisis',
        name: 'Mass Lapse Event',
        description: '50% lapse rate increase',
        shocks: { lapse_shock: 0.5 }
    },
    {
        id: 'combined',
        name: 'Combined Stress',
        description: 'All risks materialize simultaneously',
        shocks: { equity_shock: -0.20, rate_shock: 0.005, mortality_shock: 1.2, lapse_shock: 0.3 }
    }
];

export default function StressTestPanel({ portfolio, baseResults }) {
    const [stressResults, setStressResults] = useState({});
    const [loading, setLoading] = useState({});
    const [error, setError] = useState(null);

    const runStressTest = async (scenario) => {
        setLoading(prev => ({ ...prev, [scenario.id]: true }));
        setError(null);

        try {
            // Run Solvency calculation with stress parameters
            const response = await calculations.runSolvency(portfolio, {
                stress_scenario: scenario.id,
                ...scenario.shocks
            });

            // Extract result (adjust depending on API response structure)
            const resultData = response.data.results || response.data;

            setStressResults(prev => ({
                ...prev,
                [scenario.id]: resultData
            }));
        } catch (err) {
            console.error(`Stress test failed for ${scenario.name}:`, err);
            setError(`Failed to run ${scenario.name}`);
        } finally {
            setLoading(prev => ({ ...prev, [scenario.id]: false }));
        }
    };

    if (!portfolio) {
        return (
            <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
                Select a portfolio to enable stress testing.
            </div>
        );
    }

    return (
        <div className="space-y-4 bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Stress Testing</h3>

            {error && (
                <div className="bg-red-50 text-red-700 p-3 rounded mb-4 text-sm">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {STRESS_SCENARIOS.map(scenario => (
                    <div key={scenario.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h4 className="font-medium text-gray-900">{scenario.name}</h4>
                                <p className="text-sm text-gray-600 mb-3">{scenario.description}</p>
                            </div>
                            <button
                                onClick={() => runStressTest(scenario)}
                                disabled={loading[scenario.id]}
                                className={`text-sm px-3 py-1 rounded text-white transition-colors ${loading[scenario.id] ? 'bg-gray-400' : 'bg-red-600 hover:bg-red-700'
                                    }`}
                            >
                                {loading[scenario.id] ? 'Running...' : 'Run Test'}
                            </button>
                        </div>

                        {stressResults[scenario.id] && baseResults && (
                            <div className="mt-3 text-sm bg-red-50 p-3 rounded border border-red-100">
                                <div className="flex justify-between mb-1">
                                    <span className="text-gray-700">Stressed SCR:</span>
                                    <span className="font-mono font-medium">
                                        {formatCurrency(stressResults[scenario.id].total_scr || stressResults[scenario.id].scr || 0)}
                                    </span>
                                </div>
                                <div className="flex justify-between text-red-700 font-medium">
                                    <span>Impact:</span>
                                    <span className="font-mono">
                                        {formatPercentage(
                                            ((stressResults[scenario.id].total_scr || 0) - (baseResults.total_scr || baseResults.scr || 0)) /
                                            (baseResults.total_scr || baseResults.scr || 1) // Avoid division by zero
                                        )}
                                    </span>
                                </div>
                            </div>
                        )}

                        {stressResults[scenario.id] && !baseResults && (
                            <div className="mt-3 text-sm bg-gray-50 p-3 rounded">
                                <div className="flex justify-between">
                                    <span className="text-gray-700">Stressed SCR:</span>
                                    <span className="font-mono font-medium">
                                        {formatCurrency(stressResults[scenario.id].total_scr || 0)}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
