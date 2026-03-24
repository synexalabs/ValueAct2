'use client';

import React, { useState, useEffect } from 'react';
import { formatNumber, formatPercentage } from '../../utils/formatters';
import axios from 'axios';

const TABLE_OPTIONS = [
  { value: 'DAV_2008_T', label: 'DAV 2008 T — Risikolebensversicherung' },
  { value: 'DAV_2004_R', label: 'DAV 2004 R — Rentenversicherung' },
];

const GENDER_OPTIONS = [
  { value: 'unisex', label: 'Unisex' },
  { value: 'male', label: 'Männlich' },
  { value: 'female', label: 'Weiblich' },
];

// Static qx data for the free tier (DAV 2008 T Unisex, selected ages)
const SAMPLE_QX = {
  DAV_2008_T: {
    20: 0.000745, 25: 0.000760, 30: 0.000970, 35: 0.001360, 40: 0.002140,
    45: 0.003660, 50: 0.006450, 55: 0.011370, 60: 0.020140, 65: 0.035970,
    70: 0.064730, 75: 0.117200, 80: 0.213730, 85: 0.393330,
  },
  DAV_2004_R: {
    20: 0.000580, 25: 0.000610, 30: 0.000780, 35: 0.001060, 40: 0.001580,
    45: 0.002730, 50: 0.004820, 55: 0.008490, 60: 0.015060, 65: 0.027000,
    70: 0.049690, 75: 0.092320, 80: 0.172280, 85: 0.315660,
  },
};

export default function MortalityBrowser() {
  const [table, setTable] = useState('DAV_2008_T');
  const [gender, setGender] = useState('unisex');
  const [calcAge, setCalcAge] = useState(45);
  const [calcTerm, setCalcTerm] = useState(10);

  const qxData = SAMPLE_QX[table] || {};
  const ages = Object.keys(qxData).map(Number).sort((a, b) => a - b);

  // Rough survival probability
  const survivalProb = () => {
    const q = qxData[calcAge] || 0.005;
    return Math.pow(1 - q, calcTerm);
  };

  // Curtate future lifetime using Gompertz mortality progression
  const lifeExpectancy = () => {
    const q0 = qxData[calcAge] || 0.005;
    let ex = 0;
    let sp = 1;
    for (let t = 1; t <= 80; t++) {
      // Gompertz: mortality roughly doubles every 8-10 years (β ≈ 0.085)
      const qx_t = Math.min(1, q0 * Math.exp(0.085 * t));
      sp *= (1 - qx_t);
      if (sp < 0.001) break;
      ex += sp;
    }
    return ex;
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-white border border-gray-100 rounded-xl p-5">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Sterbetafel</label>
            <select value={table} onChange={(e) => setTable(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-trust-400 bg-white">
              {TABLE_OPTIONS.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Geschlecht</label>
            <div className="flex gap-2">
              {GENDER_OPTIONS.map(({ value, label }) => (
                <button key={value} onClick={() => setGender(value)}
                  className={`flex-1 py-1.5 rounded-lg text-sm border transition-colors ${gender === value ? 'bg-trust-950 text-white border-trust-950' : 'bg-white text-gray-600 border-gray-200 hover:border-trust-300'}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-trust-950">Sterbewahrscheinlichkeiten qx (je 1.000 Versicherte)</h2>
          <p className="text-xs text-gray-400 mt-1">Ausgewählte Altersgruppen</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3 text-xs text-gray-500 font-medium">Alter</th>
                <th className="text-right px-5 py-3 text-xs text-gray-500 font-medium">qx (‰)</th>
                <th className="text-right px-5 py-3 text-xs text-gray-500 font-medium">Sterbewahrsch.</th>
                <th className="text-right px-5 py-3 text-xs text-gray-500 font-medium">Überlebenswahrsch.</th>
              </tr>
            </thead>
            <tbody>
              {ages.map((age) => {
                const qx = qxData[age];
                return (
                  <tr key={age} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 font-medium text-trust-900">{age}</td>
                    <td className="px-5 py-3 text-right tabular-nums text-gray-700">{formatNumber(qx * 1000, 'de-DE', 3)}</td>
                    <td className="px-5 py-3 text-right tabular-nums text-gray-700">{formatPercentage(qx, 'de-DE', 4)}</td>
                    <td className="px-5 py-3 text-right tabular-nums text-gray-700">{formatPercentage(1 - qx, 'de-DE', 4)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Calculator */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white border border-gray-100 rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-trust-950">Überlebenswahrscheinlichkeit</h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Alter</label>
              <input type="number" value={calcAge} min={20} max={85} step={5}
                onChange={(e) => setCalcAge(Number(e.target.value))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-trust-400" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Laufzeit (Jahre)</label>
              <input type="number" value={calcTerm} min={1} max={30}
                onChange={(e) => setCalcTerm(Number(e.target.value))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-trust-400" />
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-xs text-gray-400 mb-1">Überlebenswahrscheinlichkeit</p>
            <p className="text-2xl font-semibold text-trust-950">{formatPercentage(survivalProb(), 'de-DE', 2)}</p>
            <p className="text-xs text-gray-400 mt-1">
              Person, Alter {calcAge}, überlebt {calcTerm} Jahre
            </p>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-trust-950">Fernere Lebenserwartung</h2>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Alter</label>
            <input type="number" value={calcAge} min={20} max={85} step={5}
              onChange={(e) => setCalcAge(Number(e.target.value))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-trust-400" />
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-xs text-gray-400 mb-1">Fernere Lebenserwartung</p>
            <p className="text-2xl font-semibold text-trust-950">
              {formatNumber(lifeExpectancy(), 'de-DE', 1)} Jahre
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Curtate future lifetime ex ab Alter {calcAge}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
