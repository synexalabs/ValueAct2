'use client';
import React, { useRef, useState } from 'react';
import Papa from 'papaparse';
import { Upload, FileText, AlertCircle, CheckCircle2 } from 'lucide-react';

const SAMPLE_CSV = `policy_id,face_amount,premium,issue_age,policy_term,gender,policy_type
P001,100000,2800,35,20,M,term_life
P002,150000,4200,42,15,F,term_life
P003,200000,3600,38,25,M,whole_life
P004,80000,2100,50,10,F,term_life
P005,120000,5500,45,20,M,annuity
`;

const REQUIRED_COLUMNS = ['policy_id', 'face_amount', 'premium', 'issue_age', 'policy_term'];

function downloadSample() {
  const blob = new Blob([SAMPLE_CSV], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'valuact_muster_portfolio.csv';
  a.click();
  URL.revokeObjectURL(url);
}

export default function PortfolioUpload({ onPortfolioLoaded }) {
  const fileRef = useRef(null);
  const [status, setStatus] = useState(null); // null | 'success' | 'error'
  const [message, setMessage] = useState('');
  const [dragging, setDragging] = useState(false);

  const parseFile = (file) => {
    if (!file || !file.name.endsWith('.csv')) {
      setStatus('error');
      setMessage('Bitte laden Sie eine CSV-Datei hoch.');
      return;
    }
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim().toLowerCase().replace(/\s+/g, '_'),
      transform: (value) => value.trim(),
      complete: ({ data, errors }) => {
        if (errors.length > 0) {
          setStatus('error');
          setMessage(`CSV-Fehler: ${errors[0].message}`);
          return;
        }
        if (data.length === 0) {
          setStatus('error');
          setMessage('Die CSV-Datei enthält keine Daten.');
          return;
        }
        const cols = Object.keys(data[0]);
        const missing = REQUIRED_COLUMNS.filter((c) => !cols.includes(c));
        if (missing.length > 0) {
          setStatus('error');
          setMessage(`Fehlende Spalten: ${missing.join(', ')}`);
          return;
        }
        // Normalise types
        const policies = data.map((row) => ({
          policy_id: row.policy_id,
          face_amount: parseFloat(row.face_amount) || 0,
          premium: parseFloat(row.premium) || 0,
          issue_age: parseInt(row.issue_age) || 35,
          policy_term: parseInt(row.policy_term) || 20,
          gender: (row.gender || 'M').toUpperCase().charAt(0),
          policy_type: row.policy_type || 'term_life',
        })).filter((p) => p.face_amount > 0);

        if (policies.length === 0) {
          setStatus('error');
          setMessage('Keine gültigen Policen gefunden. Prüfen Sie die Spalte face_amount.');
          return;
        }
        setStatus('success');
        setMessage(`${policies.length} Policen geladen`);
        onPortfolioLoaded(policies);
      },
      error: (err) => {
        setStatus('error');
        setMessage(`Fehler beim Lesen der Datei: ${err.message}`);
      },
    });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    parseFile(e.dataTransfer.files[0]);
  };

  return (
    <div className="space-y-3">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
          dragging ? 'border-trust-400 bg-trust-50' : 'border-gray-200 hover:border-trust-300 hover:bg-gray-50'
        }`}
      >
        <Upload size={24} className="mx-auto mb-2 text-gray-400" />
        <p className="text-sm text-gray-600">CSV-Datei hierher ziehen oder <span className="text-trust-600 font-medium">durchsuchen</span></p>
        <p className="text-xs text-gray-400 mt-1">Erforderliche Spalten: policy_id, face_amount, premium, issue_age, policy_term</p>
        <input ref={fileRef} type="file" accept=".csv" className="hidden"
          onChange={(e) => parseFile(e.target.files[0])} />
      </div>

      {status === 'success' && (
        <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-100 rounded-lg text-sm text-green-700">
          <CheckCircle2 size={15} />
          {message}
        </div>
      )}
      {status === 'error' && (
        <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-100 rounded-lg text-sm text-red-700">
          <AlertCircle size={15} />
          {message}
        </div>
      )}

      <button onClick={downloadSample}
        className="flex items-center gap-2 text-xs text-gray-500 hover:text-trust-600 transition-colors">
        <FileText size={13} />
        Muster-CSV herunterladen
      </button>
    </div>
  );
}
