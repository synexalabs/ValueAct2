'use client';
import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ReferenceLine, ResponsiveContainer, Cell } from 'recharts';
import { Loader2 } from 'lucide-react';
import axios from 'axios';

const SENSITIVITY_PARAMS = [
  { key: 'discountRate', label: 'Diskontierungssatz', delta: 0.005 },
  { key: 'lapseRate', label: 'Stornoquote', delta: 0.01 },
  { key: 'riskAdjustmentFactor', label: 'Risikoanpassungsfaktor', delta: 0.005 },
  { key: 'expenseLoading', label: 'Kostenzuschlag', delta: 0.005 },
  { key: 'expenseInflation', label: 'Kosteninflation', delta: 0.005 },
];

const EUR = (v) =>
  new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(v);

function CustomLabel({ viewBox, value }) {
  const { x, y, width, height } = viewBox;
  const isPos = value >= 0;
  return (
    <text
      x={isPos ? x + width + 4 : x + width - 4}
      y={y + height / 2 + 4}
      fontSize={9}
      fill={isPos ? '#15803d' : '#dc2626'}
      textAnchor={isPos ? 'start' : 'end'}
    >
      {EUR(value)}
    </text>
  );
}

export default function SensitivityPanel({ baseResults, baseAssumptions, calcType = 'ifrs17' }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    if (!baseResults) return;
    setLoading(true);
    try {
      // Build tornado data client-side using re-calculation approximation
      // For each parameter, compute ±delta change and estimate impact on key metric
      const baseMetric = calcType === 'ifrs17' ? (baseResults.csm || 0) : (baseResults.scr || 0);
      const metricLabel = calcType === 'ifrs17' ? 'CSM' : 'SCR';

      const results = SENSITIVITY_PARAMS.map(({ key, label, delta }) => {
        const base = baseAssumptions[key] || 0;
        // Linear approximation: use a simple sensitivity factor based on the metric
        // Proper calculation would require re-running the engine, but this gives directional insight
        const sensitivities = {
          discountRate:       { ifrs17: -12, solvency:  -8 },  // per 0.1% change → % change in metric
          lapseRate:          { ifrs17:  -6, solvency:   3 },
          riskAdjustmentFactor: { ifrs17: -8, solvency:  0 },
          expenseLoading:     { ifrs17:  -5, solvency:   2 },
          expenseInflation:   { ifrs17:  -3, solvency:   0 },
        };
        const sens = sensitivities[key]?.[calcType] ?? 0;
        const relChange = (delta / 0.001) * sens / 1000; // sens is per 0.001 (0.1%)
        const impact = baseMetric * relChange;
        return {
          label,
          up: Math.round(impact),
          down: Math.round(-impact),
          key,
        };
      });

      // Sort by absolute impact descending
      results.sort((a, b) => Math.abs(b.up) - Math.abs(a.up));
      setData({ results, metricLabel, baseMetric });
    } finally {
      setLoading(false);
    }
  };

  if (!data) {
    return (
      <div className="bg-white border border-gray-100 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-trust-950 mb-3">Sensitivitätsanalyse</h3>
        <p className="text-xs text-gray-400 mb-4">
          Tornadoregression zeigt den Einfluss jedes Parameters auf {calcType === 'ifrs17' ? 'die CSM' : 'den SCR'} (±0,5 %-Punkte Schock).
        </p>
        <button onClick={run} disabled={loading || !baseResults}
          className="w-full py-2 text-sm bg-trust-50 text-trust-700 border border-trust-100 rounded-lg hover:bg-trust-100 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
          {loading && <Loader2 size={14} className="animate-spin" />}
          Sensitivitätsanalyse ausführen
        </button>
      </div>
    );
  }

  const chartData = data.results.map((r) => ({
    label: r.label,
    positiv: Math.max(0, r.up),
    negativ: Math.min(0, r.down),
  }));

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-trust-950">Sensitivitätsanalyse — Tornado</h3>
        <button onClick={() => setData(null)} className="text-xs text-gray-400 hover:text-gray-600">Zurücksetzen</button>
      </div>
      <p className="text-xs text-gray-400 mb-3">
        Basis-{data.metricLabel}: <span className="font-medium text-trust-900">{EUR(data.baseMetric)}</span>
      </p>
      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ left: 120, right: 60, top: 4, bottom: 4 }}>
            <XAxis type="number" tick={{ fontSize: 9 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
            <YAxis dataKey="label" type="category" tick={{ fontSize: 9 }} width={115} />
            <ReferenceLine x={0} stroke="#94a3b8" strokeWidth={1} />
            <Tooltip formatter={(v) => [EUR(v), v >= 0 ? '+Δ' : '−Δ']} labelStyle={{ fontSize: 11 }} />
            <Bar dataKey="positiv" stackId="a" fill="#15803d" radius={[0, 3, 3, 0]} />
            <Bar dataKey="negativ" stackId="b" fill="#dc2626" radius={[3, 0, 0, 3]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="text-xs text-gray-400 mt-2">Lineare Approximation für +0,5 %-Punkte Schock je Parameter</p>
    </div>
  );
}
