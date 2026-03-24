'use client';
import { useAuth } from '../../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import Link from 'next/link';
import axios from 'axios';

function formatDate(dateStr) {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch {
    return dateStr;
  }
}

function formatCurrency(v) {
  if (v == null || isNaN(v)) return '—';
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(v);
}

export default function DashboardPage() {
  const { isAuthenticated, user, loading, token } = useAuth();
  const router = useRouter();
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/anmelden');
    }
  }, [isAuthenticated, loading, router]);

  useEffect(() => {
    if (!isAuthenticated || !token) return;
    setHistoryLoading(true);
    axios.get('/api/calculations/history', { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setHistory(res.data?.calculations || []))
      .catch(() => {})
      .finally(() => setHistoryLoading(false));
  }, [isAuthenticated, token]);

  if (loading || !isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="text-2xl font-semibold text-trust-950 mb-2">Dashboard</h1>
          <p className="text-gray-500 mb-8">Willkommen, {user?.email}</p>

          <div className="grid md:grid-cols-3 gap-4 mb-10">
            {[
              { href: '/rechner/ifrs17', title: 'IFRS 17 Rechner', desc: 'CSM & Verlustkomponente' },
              { href: '/rechner/solvency', title: 'Solvency II Rechner', desc: 'SCR & MCR Berechnung' },
              { href: '/rechner/sterbetafel', title: 'Sterbetafel-Browser', desc: 'DAV 2008 T / 2004 R' },
            ].map((item) => (
              <Link key={item.href} href={item.href}
                className="p-5 border border-gray-100 rounded-xl hover:border-trust-200 hover:shadow-sm transition-all">
                <h2 className="font-medium text-trust-900">{item.title}</h2>
                <p className="text-sm text-gray-400">{item.desc}</p>
              </Link>
            ))}
          </div>

          {/* Calculation history */}
          <div>
            <h2 className="text-lg font-semibold text-trust-950 mb-4">Berechnungsverlauf</h2>
            {historyLoading ? (
              <p className="text-sm text-gray-400">Lädt...</p>
            ) : history.length === 0 ? (
              <div className="bg-gray-50 rounded-xl border border-gray-100 px-6 py-10 text-center">
                <p className="text-sm text-gray-400">Noch keine Berechnungen vorhanden. Starten Sie mit dem IFRS 17 oder Solvency II Rechner.</p>
              </div>
            ) : (
              <div className="border border-gray-100 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium uppercase tracking-wide">Typ</th>
                      <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium uppercase tracking-wide">Datum</th>
                      <th className="text-right px-4 py-3 text-xs text-gray-500 font-medium uppercase tracking-wide">Ergebnis</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {history.map((calc, i) => {
                      const isIfrs = calc.calculationType === 'ifrs17';
                      const summary = calc.summary || calc.results?.aggregate_metrics || {};
                      const mainValue = isIfrs
                        ? (summary.csm ?? calc.summary?.csm)
                        : (summary.scr ?? calc.summary?.scr);
                      const label = isIfrs ? 'CSM' : 'SCR';
                      return (
                        <tr key={calc.id || i} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium ${isIfrs ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'}`}>
                              {isIfrs ? 'IFRS 17' : 'Solvency II'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-500">{formatDate(calc.createdAt?.toDate?.() || calc.createdAt)}</td>
                          <td className="px-4 py-3 text-right font-medium text-trust-900 tabular-nums">
                            <span className="text-xs text-gray-400 mr-1">{label}</span>
                            {formatCurrency(mainValue)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
