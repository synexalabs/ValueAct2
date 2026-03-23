import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import Link from 'next/link';
import { Check } from 'lucide-react';

export const metadata = {
  title: 'Preise | ValueAct Rechner',
  description: 'Kostenlos oder Professional — IFRS 17 und Solvency II Rechner für deutsche Aktuare. 79 €/Monat für unbegrenzte Berechnungen, Prüfpfad und PDF-Export.',
};

const freeFeatures = [
  '3 Berechnungen pro Tag',
  'IFRS 17 CSM-Rechner (Basis)',
  'Solvency II SCR-Rechner (Basis)',
  'DAV-Sterbetafeln Browser',
  'Keine Registrierung nötig',
];

const proFeatures = [
  'Unbegrenzte Berechnungen',
  'Vollständiger Prüfpfad mit Formeldokumentation',
  'PDF-Export mit allen Berechnungsdetails',
  'Sensitivitätsanalyse',
  'CSM-Abwicklungsmuster',
  'EIOPA-Zinskurvenintegration',
  'Portfolio-Modus (bis 100 Policen)',
  'Berechnungshistorie',
  'E-Mail-Support',
];

export default function PreisePage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <main className="flex-1 pt-28 pb-16">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-semibold text-trust-950 mb-3">Preise</h1>
            <p className="text-gray-500">Transparent. Kein Abo-Zwang. Monatlich kündbar.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Free */}
            <div className="border border-gray-200 rounded-2xl p-8 flex flex-col">
              <div className="mb-6">
                <p className="text-sm text-gray-500 font-medium mb-2">Kostenlos</p>
                <div className="flex items-end gap-1">
                  <span className="text-4xl font-semibold text-trust-950">0 €</span>
                  <span className="text-gray-400 mb-1">/ für immer</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {freeFeatures.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                    <Check size={16} className="text-green-500 mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <Link href="/rechner"
                className="block w-full py-3 text-center border border-gray-200 text-trust-900 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                Kostenlos berechnen
              </Link>
            </div>

            {/* Pro */}
            <div className="border-2 border-trust-950 rounded-2xl p-8 flex flex-col relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-trust-950 text-white text-xs px-3 py-1 rounded-full font-medium">Beliebt</span>
              </div>

              <div className="mb-6">
                <p className="text-sm text-trust-700 font-medium mb-2">Professional</p>
                <div className="flex items-end gap-1">
                  <span className="text-4xl font-semibold text-trust-950">79 €</span>
                  <span className="text-gray-400 mb-1">/ Monat</span>
                </div>
                <p className="text-sm text-gray-400 mt-1">oder 69 €/Monat bei Jahreszahlung</p>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {proFeatures.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                    <Check size={16} className="text-trust-700 mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <Link href="/registrieren"
                className="block w-full py-3 text-center bg-trust-950 text-white rounded-lg font-medium hover:bg-trust-900 transition-colors">
                Jetzt starten
              </Link>
            </div>
          </div>

          <p className="text-center text-sm text-gray-400 mt-8">
            Zahlung per Kreditkarte oder SEPA-Lastschrift. Monatlich kündbar.
            Alle Preise zzgl. MwSt.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
