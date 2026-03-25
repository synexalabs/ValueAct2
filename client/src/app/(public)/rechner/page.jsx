import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import Link from 'next/link';

export const metadata = {
  title: 'Rechner — ValueAct Rechner',
  description: 'IFRS 17 CSM-Rechner, Solvency II SCR-Rechner und DAV Sterbetafeln. Kostenlos, ohne Registrierung.',
};

export default function RechnerPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <main className="flex-1 pt-28 pb-16">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="text-3xl font-semibold text-trust-950 mb-2">Rechner</h1>
          <p className="text-gray-500 mb-10">Wählen Sie einen Rechner. Keine Registrierung erforderlich.</p>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                href: '/rechner/ifrs17',
                title: 'IFRS 17 Rechner',
                subtitle: 'Vertragliche Servicemarge (CSM)',
                desc: 'CSM und Verlustkomponente nach GMM, PAA und VFA mit korrekter IFRS 17-Konvention.',
                badge: 'Kostenlos',
              },
              {
                href: '/rechner/solvency',
                title: 'Solvency II Rechner',
                subtitle: 'SCR & MCR',
                desc: 'Solvenzkapitalanforderung nach Standardformel mit allen Risikomodulen.',
                badge: 'Kostenlos',
              },
              {
                href: '/rechner/sterbetafeln',
                title: 'DAV Sterbetafeln',
                subtitle: 'DAV 2008 T / DAV 2004 R',
                desc: 'Sterbewahrscheinlichkeiten, Überlebenswahrscheinlichkeiten und fernere Lebenserwartung.',
                badge: 'Kostenlos',
              },
              {
                href: '/rechner/zinskurve',
                title: 'EIOPA Zinskurve',
                subtitle: 'Risikofreie Zinssätze EUR',
                desc: 'Smith-Wilson-Extrapolation der EIOPA RFR-Kurve mit optionaler Volatilitätsanpassung (VA).',
                badge: 'Kostenlos',
              },
              {
                href: '/rechner/bav',
                title: 'bAV-Rechner',
                subtitle: 'Pensionsverpflichtungen',
                desc: 'DBO nach IAS 19 Projected Unit Credit und HGB/BilMoG. Vergleichsrechnung, Dienstzeitaufwand, PSVaG.',
                badge: 'Neu',
              },
            ].map((item) => (

              <Link
                key={item.href}
                href={item.href}
                className="block p-6 bg-white border border-gray-100 rounded-xl hover:border-trust-200 hover:shadow-sm transition-all group"
              >
                <div className="flex items-start justify-between mb-3">
                  <h2 className="text-base font-semibold text-trust-900">{item.title}</h2>
                  <span className="text-xs px-2 py-0.5 bg-green-50 text-green-700 rounded-full">{item.badge}</span>
                </div>
                <p className="text-sm text-trust-600 font-medium mb-2">{item.subtitle}</p>
                <p className="text-sm text-gray-400 leading-relaxed">{item.desc}</p>
                <p className="mt-4 text-sm text-trust-600 group-hover:text-trust-800 transition-colors">
                  Öffnen →
                </p>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
