'use client';

import React, { useState, useCallback } from 'react';
import { ChevronDown, ChevronUp, Lock, Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { calculateCSM, calculateLossComponent, calculatePresentValue, generateCSMRunoff } from '../../utils/ifrs17Calculations';
import { formatCurrency, formatPercentage, formatNumber } from '../../utils/formatters';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

const DEFAULT_INPUTS = {
  faceAmount: 100000,
  premium: 3000,
  issueAge: 35,
  policyTerm: 20,
  gender: 'unisex',
  policyType: 'term_life',
};

const DEFAULT_ASSUMPTIONS = {
  discountRate: 0.035,
  lapseRate: 0.05,
  mortalityTable: 'DAV_2008_T',
  expenseLoading: 0.05,
  expenseInflation: 0.02,
  riskAdjustmentFactor: 0.02,
  confidenceLevel: '0.90',
};

const MORTALITY_TABLES = [
  { value: 'DAV_2008_T', label: 'DAV 2008 T Unisex (Standard)' },
  { value: 'DAV_2008_T_MALE', label: 'DAV 2008 T Männlich' },
  { value: 'DAV_2008_T_FEMALE', label: 'DAV 2008 T Weiblich' },
  { value: 'DAV_2004_R', label: 'DAV 2004 R Unisex' },
  { value: 'DAV_2004_R_MALE', label: 'DAV 2004 R Männlich' },
  { value: 'DAV_2004_R_FEMALE', label: 'DAV 2004 R Weiblich' },
];

const POLICY_TYPES = [
  { value: 'term_life', label: 'Risikolebensversicherung' },
  { value: 'whole_life', label: 'Kapitallebensversicherung' },
  { value: 'annuity', label: 'Rentenversicherung' },
];

const getMeasurementModelLabel = (type) => {
  switch (type) {
    case 'annuity': return 'Variabler Gebührenansatz (VFA)';
    case 'whole_life': return 'Allgemeines Bewertungsmodell (GMM)';
    case 'term_life':
    default: return 'Allgemeines Bewertungsmodell (GMM)';
  }
};

function clientSideEstimate(inputs, assumptions) {
  const { faceAmount, premium, policyTerm, issueAge } = inputs;
  const r = assumptions.discountRate;
  const q = 0.003 + (issueAge - 18) * 0.001; // rough mortality estimate
  const expenseRate = assumptions.expenseLoading;

  const periods = Array.from({ length: policyTerm }, (_, i) => i + 1);
  const survival = periods.map((t) => Math.pow(1 - q, t));

  const pvPremiums = calculatePresentValue(
    periods.map((_, i) => premium * survival[i]),
    r,
    periods
  );
  const pvBenefits = calculatePresentValue(
    periods.map((_, i) => faceAmount * q * survival[i]),
    r,
    periods
  );
  const pvExpenses = calculatePresentValue(
    periods.map((_, i) => premium * expenseRate * survival[i] * Math.pow(1 + assumptions.expenseInflation, i)),
    r,
    periods
  );

  const ra = pvBenefits * assumptions.riskAdjustmentFactor;
  const csm = calculateCSM(pvPremiums, pvBenefits, pvExpenses, ra);
  const lossComponent = calculateLossComponent(pvPremiums, pvBenefits, pvExpenses, ra);
  const fcf = pvBenefits + pvExpenses - pvPremiums;

  const csmRunoff = generateCSMRunoff(csm, Array(policyTerm).fill(1 / policyTerm));

  return { pvPremiums, pvBenefits, pvExpenses, fcf, ra, csm, lossComponent, csmRunoff };
}

export default function IFRS17Calculator() {
  const { isAuthenticated, plan } = useAuth();
  const isPro = isAuthenticated && plan === 'pro';

  const [inputs, setInputs] = useState(DEFAULT_INPUTS);
  const [assumptions, setAssumptions] = useState(DEFAULT_ASSUMPTIONS);
  const [showAssumptions, setShowAssumptions] = useState(false);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleInput = (e) => {
    const { name, value } = e.target;
    setInputs((prev) => ({ ...prev, [name]: ['faceAmount', 'premium', 'issueAge', 'policyTerm'].includes(name) ? Number(value) : value }));
  };

  const handleAssumption = (e) => {
    const { name, value } = e.target;
    setAssumptions((prev) => ({ ...prev, [name]: ['discountRate', 'lapseRate', 'expenseLoading', 'expenseInflation', 'riskAdjustmentFactor'].includes(name) ? Number(value) : value }));
  };

  const handleCalculate = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      if (isPro) {
        const response = await axios.post('/api/calculations/ifrs17', {
          policies: [{ ...inputs, policy_id: 'P001' }],
          assumptions,
        });
        setResults({ ...response.data, source: 'server' });
      } else {
        const est = clientSideEstimate(inputs, assumptions);
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
  }, [inputs, assumptions, isPro]);

  const isOnerous = results && results.lossComponent > 0;

  return (
    <div className="grid lg:grid-cols-5 gap-6">
      {/* Input panel */}
      <div className="lg:col-span-2 space-y-4">
        {/* Main inputs */}
        <div className="bg-white border border-gray-100 rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-trust-950 uppercase tracking-wide">Eingabeparameter</h2>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Versicherungssumme (€)</label>
            <input type="number" name="faceAmount" value={inputs.faceAmount} onChange={handleInput}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-trust-400"
              min={0} step={1000} />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Jahresprämie (€)</label>
            <input type="number" name="premium" value={inputs.premium} onChange={handleInput}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-trust-400"
              min={0} step={100} />
          </div>

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

          <div>
            <label className="block text-sm text-gray-600 mb-1">Geschlecht</label>
            <div className="flex gap-2">
              {[{ v: 'unisex', l: 'Unisex' }, { v: 'male', l: 'Männlich' }, { v: 'female', l: 'Weiblich' }].map(({ v, l }) => (
                <button key={v} onClick={() => setInputs((p) => ({ ...p, gender: v }))}
                  className={`flex-1 py-1.5 rounded-lg text-sm border transition-colors ${inputs.gender === v ? 'bg-trust-950 text-white border-trust-950' : 'bg-white text-gray-600 border-gray-200 hover:border-trust-300'}`}>
                  {l}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Versicherungsart</label>
            <select name="policyType" value={inputs.policyType} onChange={handleInput}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-trust-400 bg-white">
              {POLICY_TYPES.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
            </select>
          </div>
        </div>

        {/* Assumptions (collapsible) */}
        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
          <button onClick={() => setShowAssumptions((v) => !v)}
            className="w-full flex items-center justify-between px-5 py-4 text-sm font-semibold text-trust-950 hover:bg-gray-50 transition-colors">
            <span>Annahmen (Erweitert)</span>
            {showAssumptions ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {showAssumptions && (
            <div className="px-5 pb-5 space-y-4 border-t border-gray-100">
              {[
                { name: 'discountRate', label: 'Diskontierungssatz', min: 0, max: 0.1, step: 0.001 },
                { name: 'lapseRate', label: 'Stornoquote', min: 0, max: 0.2, step: 0.001 },
                { name: 'expenseLoading', label: 'Kostenzuschlag', min: 0, max: 0.15, step: 0.001 },
                { name: 'expenseInflation', label: 'Kosteninflation', min: 0, max: 0.05, step: 0.001 },
                { name: 'riskAdjustmentFactor', label: 'Risikoanpassungsfaktor', min: 0, max: 0.1, step: 0.001 },
              ].map(({ name, label, min, max, step }) => (
                <div key={name}>
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>{label}</span>
                    <span className="text-trust-700 font-medium">{formatPercentage(assumptions[name])}</span>
                  </div>
                  <input type="range" name={name} min={min} max={max} step={step}
                    value={assumptions[name]} onChange={handleAssumption}
                    className="w-full accent-trust-700" />
                </div>
              ))}

              <div>
                <label className="block text-sm text-gray-600 mb-1">Sterbetafel</label>
                <select name="mortalityTable" value={assumptions.mortalityTable} onChange={handleAssumption}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-trust-400 bg-white">
                  {MORTALITY_TABLES.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">Konfidenzniveau (RA)</label>
                <select name="confidenceLevel" value={assumptions.confidenceLevel} onChange={handleAssumption}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-trust-400 bg-white">
                  {['0.75', '0.90', '0.95', '0.99'].map((v) => <option key={v} value={v}>{(Number(v) * 100).toFixed(0)} %</option>)}
                </select>
              </div>
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

      {/* Results panel */}
      <div className="lg:col-span-3 space-y-4">
        {results ? (
          <>
            {/* Status badge */}
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium w-fit ${isOnerous ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-green-50 text-green-700 border border-green-100'}`}>
              <span className={`w-2 h-2 rounded-full ${isOnerous ? 'bg-red-500' : 'bg-green-500'}`} />
              {isOnerous ? 'Belastender Vertrag' : 'Profitabler Vertrag'}
            </div>

            {/* Key metrics */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white border border-gray-100 rounded-xl p-5">
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">CSM</p>
                <p className="text-2xl font-semibold text-trust-950">{formatCurrency(results.csm)}</p>
                <p className="text-xs text-gray-400 mt-1">Vertragliche Servicemarge</p>
              </div>
              <div className="bg-white border border-gray-100 rounded-xl p-5">
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Verlustkomponente</p>
                <p className="text-2xl font-semibold text-red-600">{formatCurrency(results.lossComponent)}</p>
                <p className="text-xs text-gray-400 mt-1">Loss Component</p>
              </div>
            </div>

            {/* Breakdown */}
            <div className="bg-white border border-gray-100 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-trust-950 mb-4">Aufschlüsselung</h3>
              <div className="space-y-3">
                {[
                  { label: 'Barwert der Prämien', value: results.pvPremiums, note: 'PV Prämien' },
                  { label: 'Barwert der Leistungen', value: results.pvBenefits, note: 'PV Leistungen', negative: true },
                  { label: 'Barwert der Kosten', value: results.pvExpenses, note: 'PV Kosten', negative: true },
                  { label: 'Erfüllungszahlungsströme (FCF)', value: results.fcf, note: 'FCF = PV(Leistungen) + PV(Kosten) − PV(Prämien)' },
                  { label: 'Risikoanpassung (RA)', value: results.ra, note: 'Risk Adjustment', negative: true },
                ].map(({ label, value, note }) => (
                  <div key={label} className="flex justify-between items-start py-2 border-b border-gray-50 last:border-0">
                    <div>
                      <p className="text-sm text-trust-900">{label}</p>
                      <p className="text-xs text-gray-400">{note}</p>
                    </div>
                    <p className={`text-sm font-medium tabular-nums ${value < 0 ? 'text-red-600' : 'text-trust-900'}`}>
                      {formatCurrency(value)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Bewertungsmodell */}
            <div className="bg-white border border-gray-100 rounded-xl p-5">
              <p className="text-xs text-gray-400 mb-1">Bewertungsmodell</p>
              <p className="text-sm font-medium text-trust-900">
                {getMeasurementModelLabel(inputs.policyType)}
              </p>
              {results.source === 'client' && (
                <p className="text-xs text-gray-400 mt-1">Vereinfachte Schätzung (kostenloses Tier)</p>
              )}
            </div>

            {/* CSM release pattern chart */}
            {results.csmRunoff && results.csmRunoff.length > 0 && (
              <div className="bg-white border border-gray-100 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-trust-950 mb-4">CSM-Abwicklungsmuster</h3>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={results.csmRunoff.map((v, i) => ({ period: i + 1, csmRelease: v }))}>
                      <XAxis dataKey="period" tick={{ fontSize: 11 }} label={{ value: 'Jahr', position: 'insideBottom', offset: -5, fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                      <Tooltip
                        formatter={(value) => [formatCurrency(value), 'CSM-Auflösung']}
                        labelFormatter={(label) => `Jahr ${label}`}
                      />
                      <Bar dataKey="csmRelease" fill="#1e293b" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-xs text-gray-400 mt-2">Verteilung der CSM-Auflösung über die Deckungsperiode</p>
              </div>
            )}

            {/* Pro-gated features */}
            <div className="bg-white border border-gray-100 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-trust-950 mb-3">Professional-Funktionen</h3>
              <div className="space-y-2">
                {[
                  'Vollständiger Prüfpfad (Python-Engine)',
                  'PDF-Export mit Berechnungsdetails',
                  'Sensitivitätsanalyse',
                ].map((f) => (
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
