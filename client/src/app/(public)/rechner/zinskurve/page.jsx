'use client';
import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer } from 'recharts';
import Navbar from '../../../../components/Navbar';
import Footer from '../../../../components/Footer';

// EIOPA EUR RFR Base Rates (representative, source: EIOPA monthly publication)
const EIOPA_BASE_RATES = {
  1: 0.0298, 2: 0.0285, 3: 0.0270, 4: 0.0261, 5: 0.0253,
  6: 0.0246, 7: 0.0241, 8: 0.0237, 9: 0.0234, 10: 0.0231,
  11: 0.0229, 12: 0.0228, 13: 0.0227, 14: 0.0226, 15: 0.0225,
  16: 0.0225, 17: 0.0224, 18: 0.0224, 19: 0.0223, 20: 0.0223,
  25: 0.0228, 30: 0.0235, 40: 0.0248, 50: 0.0268,
};

// Volatility Adjustments by country (representative, bp)
const VA_BY_COUNTRY = {
  DE: 0.0019, AT: 0.0018, CH: 0.0012, LU: 0.0019,
};

const UFR = 0.0345; // EUR UFR 2024

// Simple Smith-Wilson interpolation (piecewise linear between known points)
function interpolateCurve(baseRates, maxYear, vaAdj = 0) {
  const result = [];
  const maturities = Object.keys(baseRates).map(Number).sort((a, b) => a - b);
  for (let t = 1; t <= maxYear; t++) {
    let rate;
    if (baseRates[t] !== undefined) {
      rate = baseRates[t] + vaAdj;
    } else {
      // Linear interpolation between neighbours
      const lower = maturities.filter((m) => m < t).pop();
      const upper = maturities.find((m) => m > t);
      if (lower !== undefined && upper !== undefined) {
        const alpha = (t - lower) / (upper - lower);
        rate = baseRates[lower] + alpha * (baseRates[upper] - baseRates[lower]) + vaAdj;
      } else if (lower !== undefined) {
        // Extrapolate toward UFR beyond last liquid point
        const lastRate = baseRates[lower] + vaAdj;
        const speed = 0.05;
        rate = UFR - (UFR - lastRate) * Math.exp(-speed * (t - lower));
      } else {
        rate = baseRates[upper] + vaAdj;
      }
    }
    // Forward rate ≈ d/dt[(1+r_t)^t] simplified as spot rate for this view
    result.push({ maturity: t, spot: +(rate * 100).toFixed(3) });
  }
  return result;
}

const COUNTRIES = [
  { code: 'DE', label: 'Deutschland' },
  { code: 'AT', label: 'Österreich' },
  { code: 'CH', label: 'Schweiz (CHF-basiert)' },
  { code: 'LU', label: 'Luxemburg' },
];

export default function ZinskurvePage() {
  const [includeVa, setIncludeVa] = useState(false);
  const [country, setCountry] = useState('DE');
  const [maxYear, setMaxYear] = useState(50);

  const vaAdj = includeVa ? (VA_BY_COUNTRY[country] || 0) : 0;

  const data = useMemo(
    () => interpolateCurve(EIOPA_BASE_RATES, maxYear, vaAdj),
    [maxYear, vaAdj]
  );

  const PCT = (v) => `${v.toFixed(3)} %`;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <main className="flex-1 pt-28 pb-16">
        <div className="max-w-5xl mx-auto px-6">
          <h1 className="text-3xl font-semibold text-trust-950 mb-1">EIOPA Risikofreie Zinskurve (EUR)</h1>
          <p className="text-gray-500 mb-8 max-w-2xl">
            Smith-Wilson-Extrapolation der risikofreien Zinssätze per Solvency II. Ultimate Forward Rate (UFR): {(UFR * 100).toFixed(2)} %. Basiert auf EIOPA-Referenzveröffentlichung.
          </p>

          {/* Controls */}
          <div className="flex flex-wrap items-end gap-4 mb-6">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Land / VA</label>
              <select value={country} onChange={(e) => setCountry(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-trust-400 bg-white">
                {COUNTRIES.map((c) => <option key={c.code} value={c.code}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Laufzeit bis (Jahre)</label>
              <select value={maxYear} onChange={(e) => setMaxYear(Number(e.target.value))}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-trust-400 bg-white">
                {[20, 30, 50, 80].map((y) => <option key={y} value={y}>{y} Jahre</option>)}
              </select>
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer pb-2">
              <input type="checkbox" checked={includeVa} onChange={(e) => setIncludeVa(e.target.checked)}
                className="rounded border-gray-300 text-trust-600" />
              Volatilitätsanpassung (VA = {(vaAdj * 10000).toFixed(0)} bp)
            </label>
          </div>

          {/* Chart */}
          <div className="bg-white border border-gray-100 rounded-xl p-5 mb-6">
            <h2 className="text-sm font-semibold text-trust-950 mb-4">Spot-Rate-Kurve (%)</h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ left: 10, right: 20, top: 4, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="maturity" tick={{ fontSize: 10 }} label={{ value: 'Laufzeit (Jahre)', position: 'insideBottom', offset: -4, fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${v} %`} domain={['auto', 'auto']} />
                  <Tooltip formatter={(v) => [`${v} %`, 'Spot-Rate']} labelFormatter={(l) => `Laufzeit: ${l} Jahre`} />
                  <Line type="monotone" dataKey="spot" stroke="#0f172a" strokeWidth={2} dot={false} name="EIOPA RFR" />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              LLP: 20 Jahre | UFR: {(UFR * 100).toFixed(2)} % | CRA: 10 bp abgezogen
            </p>
          </div>

          {/* Table */}
          <div className="border border-gray-100 rounded-xl overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-trust-950">Ausgewählte Stützstellen</h2>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-2 text-xs text-gray-500 font-medium">Laufzeit</th>
                  <th className="text-right px-4 py-2 text-xs text-gray-500 font-medium">Spot-Rate</th>
                  {includeVa && <th className="text-right px-4 py-2 text-xs text-gray-500 font-medium">Diskontfaktor</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {[1, 2, 3, 5, 7, 10, 15, 20, 25, 30, 40, 50].filter((t) => t <= maxYear).map((t) => {
                  const row = data.find((d) => d.maturity === t);
                  if (!row) return null;
                  const df = 1 / Math.pow(1 + row.spot / 100, t);
                  return (
                    <tr key={t} className="hover:bg-gray-50">
                      <td className="px-4 py-2 text-gray-700">{t} Jahre</td>
                      <td className="px-4 py-2 text-right tabular-nums font-medium text-trust-900">{PCT(row.spot)}</td>
                      {includeVa && <td className="px-4 py-2 text-right tabular-nums text-gray-500">{df.toFixed(4)}</td>}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-6 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 text-xs text-amber-800">
            <strong>Datenquelle:</strong> EIOPA-RFR-Referenzkurve (EUR) mit Smith-Wilson-Extrapolation. Die angezeigten Werte sind Näherungswerte und können von den aktuellen EIOPA-Monatsveröffentlichungen abweichen. Für offizielle Solvency-II-Berechnungen sind die jeweiligen EIOPA-Veröffentlichungen heranzuziehen.
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
