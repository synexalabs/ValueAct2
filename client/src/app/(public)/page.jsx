import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { Calculator, Shield, FileText, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'ValueAct Rechner — IFRS 17 & Solvency II für Aktuare',
  description: 'Kostenloser IFRS 17 und Solvency II Rechner für deutsche Versicherungsmathematiker. Sofortige CSM-, SCR- und MCR-Berechnungen mit DAV-Sterbetafeln.',
  openGraph: {
    title: 'ValueAct Rechner — IFRS 17 & Solvency II für Aktuare',
    description: 'Sofortige CSM-, SCR- und MCR-Berechnungen mit DAV-Sterbetafeln und EIOPA-Zinskurve. Vollständige Nachvollziehbarkeit.',
    locale: 'de_DE',
  },
};

const features = [
  {
    icon: Calculator,
    title: 'IFRS 17 konform',
    desc: 'CSM-Berechnung nach GMM, PAA und VFA mit korrekter Verlustkomponenten-Erkennung gem. IFRS 17 Abs. 38.',
  },
  {
    icon: Shield,
    title: 'Solvency II Standard',
    desc: 'SCR nach Standardformel mit allen Risikomodulen und Korrelationsmatrizen gem. Delegierte Verordnung (EU) 2015/35.',
  },
  {
    icon: FileText,
    title: 'Prüfpfad',
    desc: 'Jeder Berechnungsschritt dokumentiert — Formeln, Annahmen, Zwischenergebnisse. Bereit für Wirtschaftsprüfer und BaFin.',
  },
  {
    icon: CheckCircle,
    title: 'Deutsche Standards',
    desc: 'DAV 2008 T und DAV 2004 R Sterbetafeln, EIOPA-Zinskurve, EUR-Formatierung nach DIN.',
  },
];

const trustSignals = [
  'DAV-Sterbetafeln',
  'EIOPA-konform',
  'Solvency II Standardformel',
  'IFRS 17 Abs. 38',
  'BaFin-Standards',
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="pt-28 pb-16 lg:pt-36 lg:pb-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <div>
              <p className="text-trust-600 font-medium mb-4 text-sm">
                Entwickelt für den deutschen Versicherungsmarkt
              </p>
              <h1 className="text-4xl lg:text-5xl font-semibold text-trust-950 leading-tight mb-4">
                IFRS 17 & Solvency II
                <br />
                <span className="text-gray-400">Rechner</span>
              </h1>
              <p className="text-lg text-gray-500 mb-3 font-medium">
                für deutsche Versicherungsmathematiker
              </p>
              <p className="text-base text-gray-400 mb-8 max-w-md leading-relaxed">
                Sofortige CSM-, SCR- und MCR-Berechnungen mit DAV-Sterbetafeln
                und EIOPA-Zinskurve. Vollständige Nachvollziehbarkeit.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mb-10">
                <Link
                  href="/rechner"
                  className="px-6 py-3 bg-trust-950 text-white rounded-lg font-medium hover:bg-trust-900 transition-colors text-center"
                >
                  Kostenlos berechnen
                </Link>
                <Link
                  href="/preise"
                  className="px-6 py-3 bg-white text-trust-900 border border-gray-200 rounded-lg font-medium hover:bg-gray-50 transition-colors text-center"
                >
                  Preise ansehen
                </Link>
              </div>

              <div className="flex flex-wrap gap-3">
                {trustSignals.map((s) => (
                  <span
                    key={s}
                    className="text-xs px-3 py-1 bg-gray-50 border border-gray-100 rounded-full text-gray-500"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Quick access card */}
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
              <div className="mb-5">
                <h2 className="text-lg font-semibold text-trust-950 mb-1">Rechner</h2>
                <p className="text-sm text-gray-500">Sofort starten, keine Registrierung nötig</p>
              </div>

              <div className="space-y-2">
                {[
                  { title: 'IFRS 17 Rechner', desc: 'CSM & Verlustkomponente', href: '/rechner/ifrs17' },
                  { title: 'Solvency II Rechner', desc: 'SCR & MCR Berechnung', href: '/rechner/solvency' },
                  { title: 'DAV Sterbetafeln', desc: 'DAV 2008 T / DAV 2004 R', href: '/rechner/sterbetafeln' },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-lg hover:border-trust-200 hover:bg-trust-50/50 transition-colors group"
                  >
                    <div>
                      <p className="text-sm font-medium text-trust-900">{item.title}</p>
                      <p className="text-xs text-gray-400">{item.desc}</p>
                    </div>
                    <span className="text-gray-300 group-hover:text-trust-500 transition-colors">→</span>
                  </Link>
                ))}
              </div>

              <Link
                href="/rechner"
                className="block w-full mt-4 py-3 bg-trust-950 text-white rounded-lg font-medium hover:bg-trust-900 transition-colors text-center text-sm"
              >
                Alle Rechner
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-gray-50/50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl lg:text-3xl font-semibold text-trust-950 mb-3">
              Versicherungsmathematische Präzision
            </h2>
            <p className="text-gray-500">
              Entwickelt für Aktuare, die Genauigkeit und regulatorische Konformität benötigen.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) => (
              <div key={f.title} className="p-6 bg-white rounded-xl border border-gray-100">
                <div className="w-10 h-10 bg-trust-50 rounded-lg flex items-center justify-center mb-4 text-trust-700">
                  <f.icon size={20} />
                </div>
                <h3 className="text-base font-semibold text-trust-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 border-t border-gray-100">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-semibold text-trust-950 mb-3">
            Jetzt kostenlos testen
          </h2>
          <p className="text-gray-500 mb-6">
            3 Berechnungen pro Tag kostenlos. Keine Registrierung nötig.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/rechner"
              className="inline-block px-8 py-3 bg-trust-950 text-white rounded-lg font-medium hover:bg-trust-900 transition-colors"
            >
              Berechnen starten
            </Link>
            <Link
              href="/preise"
              className="inline-block px-8 py-3 bg-white text-trust-950 border border-gray-200 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Professional — 79 €/Monat
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
