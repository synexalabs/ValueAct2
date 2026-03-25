'use client';
import React, { useState, useCallback } from 'react';
import { estimateDBO, getHGBRate } from '../../utils/bavCalculations';

const fmt = (n) => typeof n === 'number' ? n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '—';
const fmtPct = (n) => typeof n === 'number' ? (n * 100).toFixed(2) + ' %' : '—';

const STANDARDS = [
  { value: 'ias19', label: 'IAS 19' },
  { value: 'hgb', label: 'HGB' },
  { value: 'comparison', label: 'Vergleich' },
];

const DEFAULT_INPUTS = {
  birthDate: '1975-01-01',
  entryDate: '2000-01-01',
  gender: 'M',
  annualPension: 12000,
  benefitType: 'festbetrag',
  currentSalary: 60000,
  pensionFactor: 1.0,
  valuationDate: '2024-12-31',
  standard: 'ias19',
};

const DEFAULT_ASSUMPTIONS = {
  retirementAge: 67,
  pensionTrend: 1.5,
  salaryTrend: 2.5,
  fluctuationRate: 3.0,
  hasSurvivors: true,
  survivorsFraction: 60,
  hasInvalidity: true,
  mortalityTable: 'DAV_2004_R',
  hgbPeriod: 7,
};

function ResultCard({ label, value, highlight, sub }) {
  return (
    <div className={`rounded-xl border p-4 ${highlight ? 'border-trust-300 bg-trust-50' : 'border-gray-100 bg-white'}`}>
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className={`text-xl font-bold tabular-nums ${highlight ? 'text-trust-900' : 'text-gray-900'}`}>
        {value}
      </div>
      {sub && <div className="text-xs text-gray-400 mt-1">{sub}</div>}
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
      <span className="text-sm text-gray-600">{label}</span>
      <span className="text-sm font-medium tabular-nums text-gray-900">{value}</span>
    </div>
  );
}

export default function BAVCalculator() {
  const [inputs, setInputs] = useState(DEFAULT_INPUTS);
  const [assumptions, setAssumptions] = useState(DEFAULT_ASSUMPTIONS);
  const [results, setResults] = useState(null);
  const [hgbResults, setHgbResults] = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleInput = (e) => {
    const { name, value, type, checked } = e.target;
    setInputs(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleAssumption = (e) => {
    const { name, value, type, checked } = e.target;
    setAssumptions(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const calculate = useCallback(() => {
    setLoading(true);
    try {
      const discountRate = 0.034; // IAS 19 default
      const hgbRate = getHGBRate(inputs.valuationDate, Number(assumptions.hgbPeriod));

      const base = {
        birthDate: inputs.birthDate,
        entryDate: inputs.entryDate,
        annualPension: Number(inputs.annualPension),
        retirementAge: Number(assumptions.retirementAge),
        pensionTrend: Number(assumptions.pensionTrend) / 100,
        fluctuationRate: Number(assumptions.fluctuationRate) / 100,
        survivorsFraction: Number(assumptions.survivorsFraction) / 100,
        hasSurvivors: assumptions.hasSurvivors,
      };

      const r = estimateDBO({ ...base, discountRate });
      setResults(r);

      if (inputs.standard === 'hgb' || inputs.standard === 'comparison') {
        const h = estimateDBO({ ...base, discountRate: hgbRate });
        setHgbResults(h);
      } else {
        setHgbResults(null);
      }
    } finally {
      setLoading(false);
    }
  }, [inputs, assumptions]);

  const showComparison = inputs.standard === 'comparison' && results && hgbResults;
  const activeResults = inputs.standard === 'hgb' ? hgbResults : results;

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* ── INPUT PANEL ── */}
      <div className="lg:w-80 flex-shrink-0 space-y-4">
        <div className="border border-gray-100 rounded-xl p-5 bg-white">
          <h2 className="text-sm font-semibold text-trust-950 mb-4">Pensionszusage</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Bewertungsstandard</label>
              <div className="flex rounded-lg overflow-hidden border border-gray-200">
                {STANDARDS.map(s => (
                  <button
                    key={s.value}
                    onClick={() => setInputs(p => ({ ...p, standard: s.value }))}
                    className={`flex-1 py-1.5 text-xs font-medium transition-colors ${
                      inputs.standard === s.value
                        ? 'bg-trust-950 text-white'
                        : 'bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Geburtsdatum</label>
              <input type="date" name="birthDate" value={inputs.birthDate} onChange={handleInput}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-trust-400" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Eintrittsdatum</label>
              <input type="date" name="entryDate" value={inputs.entryDate} onChange={handleInput}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-trust-400" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Geschlecht</label>
              <div className="flex gap-4">
                {[['M', 'Männlich'], ['F', 'Weiblich']].map(([v, l]) => (
                  <label key={v} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                    <input type="radio" name="gender" value={v} checked={inputs.gender === v} onChange={handleInput} />
                    {l}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Leistungsart</label>
              <select name="benefitType" value={inputs.benefitType} onChange={handleInput}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-trust-400 bg-white">
                <option value="festbetrag">Festbetrag</option>
                <option value="gehaltsabhaengig">Gehaltsabhängig</option>
                <option value="beitragsorientiert">Beitragsorientiert</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Jährliche Rente (€)</label>
              <input type="number" name="annualPension" value={inputs.annualPension} onChange={handleInput}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-trust-400" />
            </div>
            {inputs.benefitType === 'gehaltsabhaengig' && (
              <>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Jahresgehalt (€)</label>
                  <input type="number" name="currentSalary" value={inputs.currentSalary} onChange={handleInput}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-trust-400" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Pensionsfaktor (% pro Dienstjahr)</label>
                  <input type="number" step="0.1" name="pensionFactor" value={inputs.pensionFactor} onChange={handleInput}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-trust-400" />
                </div>
              </>
            )}
            <div>
              <label className="block text-xs text-gray-500 mb-1">Bewertungsstichtag</label>
              <input type="date" name="valuationDate" value={inputs.valuationDate} onChange={handleInput}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-trust-400" />
            </div>
          </div>
        </div>

        {/* Advanced assumptions */}
        <div className="border border-gray-100 rounded-xl bg-white overflow-hidden">
          <button
            onClick={() => setShowAdvanced(p => !p)}
            className="w-full flex items-center justify-between px-5 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <span>Erweiterte Annahmen</span>
            <span className="text-gray-400">{showAdvanced ? '▲' : '▼'}</span>
          </button>
          {showAdvanced && (
            <div className="px-5 pb-5 space-y-3 border-t border-gray-100">
              {[
                ['Renteneintrittsalter', 'retirementAge', 'number', 1, ''],
                ['Rententrend (%)', 'pensionTrend', 'number', 0.1, ''],
                ['Gehaltstrend (%)', 'salaryTrend', 'number', 0.1, ''],
                ['Fluktuation (%)', 'fluctuationRate', 'number', 0.5, ''],
              ].map(([label, name, type, step]) => (
                <div key={name}>
                  <label className="block text-xs text-gray-500 mb-1 mt-3">{label}</label>
                  <input type={type} step={step} name={name} value={assumptions[name]} onChange={handleAssumption}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-trust-400" />
                </div>
              ))}
              <div className="mt-3 flex items-center gap-2">
                <input type="checkbox" name="hasSurvivors" id="hasSurvivors" checked={assumptions.hasSurvivors} onChange={handleAssumption} className="rounded border-gray-300" />
                <label htmlFor="hasSurvivors" className="text-sm text-gray-700">Hinterbliebenenversorgung</label>
              </div>
              {assumptions.hasSurvivors && (
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Hinterbliebenenquote (%)</label>
                  <input type="number" step="5" name="survivorsFraction" value={assumptions.survivorsFraction} onChange={handleAssumption}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-trust-400" />
                </div>
              )}
              <div>
                <label className="block text-xs text-gray-500 mb-1 mt-3">Sterbetafel</label>
                <select name="mortalityTable" value={assumptions.mortalityTable} onChange={handleAssumption}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-trust-400 bg-white">
                  <option value="DAV_2004_R">DAV 2004 R (Rente)</option>
                  <option value="DAV_2008_T">DAV 2008 T (Risiko)</option>
                </select>
              </div>
              {(inputs.standard === 'hgb' || inputs.standard === 'comparison') && (
                <div>
                  <label className="block text-xs text-gray-500 mb-1 mt-3">HGB-Durchschnittszeitraum</label>
                  <div className="flex rounded-lg overflow-hidden border border-gray-200">
                    {['7', '10'].map(y => (
                      <button key={y} onClick={() => setAssumptions(p => ({ ...p, hgbPeriod: y }))}
                        className={`flex-1 py-1.5 text-xs font-medium transition-colors ${
                          String(assumptions.hgbPeriod) === y ? 'bg-trust-950 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
                        }`}>{y} Jahre</button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <button
          onClick={calculate}
          disabled={loading}
          className="w-full bg-trust-950 text-white rounded-xl py-3 text-sm font-semibold hover:bg-trust-800 transition-colors disabled:opacity-60"
        >
          {loading ? 'Berechne…' : 'DBO berechnen'}
        </button>
      </div>

      {/* ── RESULTS PANEL ── */}
      <div className="flex-1 space-y-4">
        {!results ? (
          <div className="h-64 flex items-center justify-center border border-gray-100 rounded-xl text-gray-400 text-sm">
            Bewertungsparameter eingeben und „DBO berechnen" klicken.
          </div>
        ) : showComparison ? (
          /* Comparison view */
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="border border-blue-100 bg-blue-50 rounded-xl p-4">
                <div className="text-xs font-semibold text-blue-700 mb-2">IAS 19 (IFRS)</div>
                <div className="text-2xl font-bold tabular-nums text-blue-900">{fmt(results.dbo)} €</div>
                <div className="text-xs text-blue-600 mt-1">Zins: {fmtPct(results.discountRate)}</div>
              </div>
              <div className="border border-amber-100 bg-amber-50 rounded-xl p-4">
                <div className="text-xs font-semibold text-amber-700 mb-2">HGB / BilMoG</div>
                <div className="text-2xl font-bold tabular-nums text-amber-900">{fmt(hgbResults.dbo)} €</div>
                <div className="text-xs text-amber-600 mt-1">Zins: {fmtPct(getHGBRate(inputs.valuationDate, Number(assumptions.hgbPeriod)))}</div>
              </div>
            </div>
            <div className="border border-gray-100 rounded-xl p-4 bg-white">
              <div className="text-xs text-gray-500 mb-1">Differenz IAS 19 − HGB</div>
              <div className={`text-xl font-bold tabular-nums ${results.dbo >= hgbResults.dbo ? 'text-green-700' : 'text-red-700'}`}>
                {results.dbo >= hgbResults.dbo ? '+' : ''}{fmt(results.dbo - hgbResults.dbo)} €
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {results.dbo > hgbResults.dbo
                  ? 'IFRS-DBO liegt über HGB-Rückstellung (höherer Rechnungszins)'
                  : 'HGB-Rückstellung liegt über IFRS-DBO (niedrigerer Rechnungszins)'}
              </div>
            </div>
            <ComparisonDetails r={results} label="IAS 19 Details" />
          </>
        ) : (
          /* Single standard view */
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <ResultCard label="Defined Benefit Obligation (DBO)" value={`${fmt(activeResults?.dbo)} €`} highlight />
              <ResultCard label="Dienstzeitaufwand (p.a.)" value={`${fmt(activeResults?.currentServiceCost)} €`} />
              <ResultCard label="Zinsaufwand" value={`${fmt(activeResults?.interestCost)} €`} />
            </div>
            <ComparisonDetails r={activeResults} label="Berechnungsdetails" />
          </>
        )}

        {results && (
          <>
            <div className="border border-gray-100 rounded-xl p-4 bg-white">
              <h3 className="text-sm font-semibold text-trust-950 mb-3">PSVaG &amp; Weitere</h3>
              <Row label="PSVaG-Beitrag (geschätzt ≈ 3‰)" value={`${fmt(activeResults?.psvagContribution || results.psvagContribution)} €`} />
              <Row label="Alter bei Stichtag" value={`${results.age} Jahre`} />
              <Row label="Verbleibende Dienstzeit" value={`${results.yearsToRetirement} Jahre`} />
              <Row label="Erdiente Dienstzeit (Past Service)" value={`${results.pastService} Jahre`} />
            </div>

            <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 text-xs text-amber-800">
              <strong>Hinweis:</strong> Diese Schätzung basiert auf vereinfachten biometrischen Annahmen (DAV-Sterbetafeln als Näherung). Für offizielle versicherungsmathematische Gutachten sind die Heubeck Richttafeln RT 2018 G und eine vollständige PUC-Bewertung erforderlich. Diese Berechnung ersetzt kein versicherungsmathematisches Gutachten.
            </div>

            {/* Pro upsell */}
            <div className="border border-trust-200 bg-trust-50 rounded-xl px-4 py-4 text-sm">
              <div className="font-semibold text-trust-900 mb-1">Pro-Version: Vollbewertung</div>
              <ul className="text-trust-700 space-y-0.5 text-xs list-disc list-inside">
                <li>IAS 19 Projected Unit Credit (Server-seitig, vollständig)</li>
                <li>IAS 19 vs. HGB Vergleichsrechnung</li>
                <li>Portfolio bis 50 Zusagen (CSV-Upload)</li>
                <li>Prüfpfad &amp; PDF-Export</li>
                <li>Sensitivitätsanalyse</li>
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function ComparisonDetails({ r, label }) {
  if (!r) return null;
  return (
    <div className="border border-gray-100 rounded-xl p-4 bg-white">
      <h3 className="text-sm font-semibold text-trust-950 mb-3">{label}</h3>
      <Row label="Projizierte Jahresrente" value={`${(r.projectedPension || r.projected_pension || 0).toLocaleString('de-DE')} €`} />
      <Row label="Rentenbarwertfaktor (ä)" value={(r.annuityFactor || r.annuity_factor || 0).toFixed(4)} />
      <Row label="Erdienungsquote (Past/Total)" value={`${((r.attributionRatio || r.attribution_ratio || 0) * 100).toFixed(1)} %`} />
      <Row label="Hinterbliebenenzuschlag" value={(r.survivorsFactor || r.survivors_factor || 0).toFixed(4)} />
      <Row label="Fluktuationsabschlag" value={(r.fluctuationDiscount || r.fluctuation_discount || 0).toFixed(4)} />
      <Row label="Rechnungszins" value={`${((r.discountRate || r.discount_rate || 0) * 100).toFixed(2)} %`} />
    </div>
  );
}
