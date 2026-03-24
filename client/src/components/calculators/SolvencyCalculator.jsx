'use client';

import React, { useState, useCallback } from 'react';
import { ChevronDown, ChevronUp, Lock, Loader2 } from 'lucide-react';
import { formatCurrency, formatPercentage } from '../../utils/formatters';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

const DEFAULT_INPUTS = {
  faceAmount: 100000,
  premium: 3000,
  issueAge: 35,
  policyTerm: 20,
  gender: 'unisex',
  policyType: 'term_life',
  ownFunds: 5000000,
};

const DEFAULT_ASSETS = {
  equityPct: 0.10,
  propertyPct: 0.05,
  bondPct: 0.60,
  fxPct: 0.10,
};

function clientSCREstimate(inputs, assets) {
  const face = inputs.faceAmount;
  const premium = inputs.premium;

  // Simplified market risk
  const equityRisk = inputs.ownFunds * assets.equityPct * 0.39;
  const propertyRisk = inputs.ownFunds * assets.propertyPct * 0.25;
  const interestRisk = inputs.ownFunds * assets.bondPct * 0.10;
  const fxRisk = inputs.ownFunds * assets.fxPct * 0.25;
  const marketRisk = Math.sqrt(equityRisk ** 2 + propertyRisk ** 2 + interestRisk ** 2 + fxRisk ** 2);

  const mortalityRisk = face * 0.0015 * 15;
  const lapseRisk = (face * 0.5) * 0.10;
  const expenseRisk = premium * 0.10;
  const lifeUW = Math.sqrt(mortalityRisk ** 2 + lapseRisk ** 2 + expenseRisk ** 2);

  const counterparty = premium * 0.15;

  const bscr = Math.sqrt(marketRisk ** 2 + lifeUW ** 2 + counterparty ** 2
    + 2 * 0.25 * marketRisk * lifeUW);

  const opRisk = Math.min(0.30 * bscr, Math.max(0.04 * premium, 0.0045 * face * 0.95));
  const scr = bscr + opRisk;

  const mcr_linear = 0.045 * face * 0.80 + 0.0085 * face * 0.15 + 0.0015 * face * 0.50;
  const mcr = Math.max(3_700_000, Math.min(0.45 * scr, Math.max(0.25 * scr, mcr_linear)));

  const solvencyRatio = inputs.ownFunds / scr;

  return {
    scr, mcr, bscr, opRisk, solvencyRatio,
    riskModules: { marketRisk, lifeUW, counterparty, opRisk },
    diversification: bscr - (marketRisk + lifeUW + counterparty),
  };
}

export default function SolvencyCalculator() {
  const { isAuthenticated, plan } = useAuth();
  const isPro = isAuthenticated && plan === 'pro';

  const [inputs, setInputs] = useState(DEFAULT_INPUTS);
  const [assets, setAssets] = useState(DEFAULT_ASSETS);
  const [showAssets, setShowAssets] = useState(false);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleInput = (e) => {
    const { name, value } = e.target;
    setInputs((p) => ({ ...p, [name]: ['faceAmount', 'premium', 'issueAge', 'policyTerm', 'ownFunds'].includes(name) ? Number(value) : value }));
  };

  const handleAsset = (e) => {
    const { name, value } = e.target;
    setAssets((p) => ({ ...p, [name]: Number(value) }));
  };

  const handleCalculate = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      if (isPro) {
        const response = await axios.post('/api/calculations/solvency', {
          policies: [{ ...inputs, policy_id: 'P001' }],
          assumptions: { ...assets, confidence_level: 0.995, time_horizon: 1 },
        });
        setResults({ ...response.data, source: 'server' });
      } else {
        const est = clientSCREstimate(inputs, assets);
        setResults({ ...est, source: 'client' });
      }
    } catch (err) {
      if (err.response?.status === 429) {
        setError('Tageslimit erreicht. Upgraden Sie auf Professional für unbegrenzte Berechnungen.');
      } else {
        setError('Berechnung fehlgeschlagen. Bitte überprüfen Sie die Eingaben.');
      }
    } finally {
      setLoading(false);
    }
  }, [inputs, assets, isPro]);

  const ratioColor = results
    ? results.solvencyRatio >= 1.5 ? 'text-green-600' : results.solvencyRatio >= 1.0 ? 'text-yellow-600' : 'text-red-600'
    : 'text-trust-900';

  return (
    <div className="grid lg:grid-cols-5 gap-6">
      {/* Input panel */}
      <div className="lg:col-span-2 space-y-4">
        <div className="bg-white border border-gray-100 rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-trust-950 uppercase tracking-wide">Eingabeparameter</h2>

          {[
            { name: 'faceAmount', label: 'Versicherungssumme (€)', step: 1000 },
            { name: 'premium', label: 'Jahresprämie (€)', step: 100 },
            { name: 'ownFunds', label: 'Eigenmittel (€)', step: 100000 },
          ].map(({ name, label, step }) => (
            <div key={name}>
              <label className="block text-sm text-gray-600 mb-1">{label}</label>
              <input type="number" name={name} value={inputs[name]} onChange={handleInput}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-trust-400"
                min={0} step={step} />
            </div>
          ))}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Eintrittsalter</label>
              <input type="number" name="issueAge" value={inputs.issueAge} onChange={handleInput}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-trust-400"
                min={18} max={85} />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Laufzeit (Jahre)</label>
              <input type="number" name="policyTerm" value={inputs.policyTerm} onChange={handleInput}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-trust-400"
                min={1} max={50} />
            </div>
          </div>
        </div>

        {/* Asset allocation */}
        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
          <button onClick={() => setShowAssets((v) => !v)}
            className="w-full flex items-center justify-between px-5 py-4 text-sm font-semibold text-trust-950 hover:bg-gray-50 transition-colors">
            <span>Asset-Allokation</span>
            {showAssets ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {showAssets && (
            <div className="px-5 pb-5 space-y-4 border-t border-gray-100">
              {[
                { name: 'equityPct', label: 'Aktienquote', max: 0.5 },
                { name: 'propertyPct', label: 'Immobilienquote', max: 0.3 },
                { name: 'bondPct', label: 'Anleihenquote', max: 0.9 },
                { name: 'fxPct', label: 'Fremdwährungsquote', max: 0.3 },
              ].map(({ name, label, max }) => (
                <div key={name}>
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>{label}</span>
                    <span className="text-trust-700 font-medium">{formatPercentage(assets[name])}</span>
                  </div>
                  <input type="range" name={name} min={0} max={max} step={0.01}
                    value={assets[name]} onChange={handleAsset}
                    className="w-full accent-trust-700" />
                </div>
              ))}
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 rounded-lg px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        <button onClick={handleCalculate} disabled={loading}
          className="w-full py-3 bg-trust-950 text-white rounded-lg font-medium hover:bg-trust-900 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
          {loading && <Loader2 size={16} className="animate-spin" />}
          {loading ? 'Berechnung läuft...' : 'Berechnen'}
        </button>
      </div>

      {/* Results */}
      <div className="lg:col-span-3 space-y-4">
        {results ? (
          <>
            {/* Solvency ratio */}
            <div className="bg-white border border-gray-100 rounded-xl p-5">
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Solvenzquote</p>
              <p className={`text-3xl font-semibold ${ratioColor}`}>
                {formatPercentage(results.solvencyRatio)}
              </p>
              <div className="w-full bg-gray-100 rounded-full h-2 mt-3">
                <div className={`h-2 rounded-full transition-all ${results.solvencyRatio >= 1.5 ? 'bg-green-500' : results.solvencyRatio >= 1.0 ? 'bg-yellow-500' : 'bg-red-500'}`}
                  style={{ width: `${Math.min(100, results.solvencyRatio * 66.7)}%` }} />
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>0%</span><span>100% (MCR)</span><span>150% (gut)</span>
              </div>
            </div>

            {/* SCR / MCR */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white border border-gray-100 rounded-xl p-5">
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">SCR</p>
                <p className="text-xl font-semibold text-trust-950">{formatCurrency(results.scr)}</p>
                <p className="text-xs text-gray-400 mt-1">Solvenzkapitalanforderung</p>
              </div>
              <div className="bg-white border border-gray-100 rounded-xl p-5">
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">MCR</p>
                <p className="text-xl font-semibold text-trust-950">{formatCurrency(results.mcr)}</p>
                <p className="text-xs text-gray-400 mt-1">Mindestkapitalanforderung</p>
              </div>
            </div>

            {/* Risk modules */}
            <div className="bg-white border border-gray-100 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-trust-950 mb-4">Risikomodule</h3>
              <div className="space-y-3">
                {[
                  { label: 'Marktrisiko', value: results.riskModules?.marketRisk },
                  { label: 'Lebensversicherungstechnisches Risiko', value: results.riskModules?.lifeUW },
                  { label: 'Gegenparteiausfallrisiko', value: results.riskModules?.counterparty },
                  { label: 'Operationelles Risiko', value: results.riskModules?.opRisk || results.opRisk },
                  { label: 'Diversifikationseffekt', value: results.diversification, negative: true },
                ].filter(r => r.value != null).map(({ label, value, negative }) => (
                  <div key={label} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                    <p className="text-sm text-trust-900">{label}</p>
                    <p className={`text-sm font-medium tabular-nums ${negative ? 'text-green-600' : 'text-trust-900'}`}>
                      {negative ? '−' : ''}{formatCurrency(Math.abs(value))}
                    </p>
                  </div>
                ))}
              </div>
              {results.source === 'client' && (
                <p className="text-xs text-gray-400 mt-3">Vereinfachte Schätzung (kostenloses Tier)</p>
              )}
            </div>

            {/* Pro-gated */}
            <div className="bg-white border border-gray-100 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-trust-950 mb-3">Professional-Funktionen</h3>
              <div className="space-y-2">
                {['Vollständige Risikomodul-Aufschlüsselung', 'Stresstest-Szenarien', 'PDF-Export', 'LAC-DT-Berechnung'].map((f) => (
                  <div key={f} className="flex items-center gap-2 text-sm text-gray-400">
                    <Lock size={14} />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
              {!isPro && (
                <a href="/preise" className="block mt-4 py-2 text-center text-sm bg-trust-50 text-trust-700 border border-trust-100 rounded-lg hover:bg-trust-100 transition-colors">
                  Professional — 79 €/Monat
                </a>
              )}
            </div>
          </>
        ) : (
          <div className="bg-gray-50 rounded-xl border border-gray-100 p-12 flex flex-col items-center justify-center text-center">
            <p className="text-gray-400 text-sm">Geben Sie die Parameter ein und klicken Sie auf "Berechnen".</p>
          </div>
        )}
      </div>
    </div>
  );
}
