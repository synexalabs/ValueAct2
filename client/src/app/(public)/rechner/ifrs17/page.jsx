import Navbar from '../../../../components/Navbar';
import Footer from '../../../../components/Footer';
import IFRS17Calculator from '../../../../components/calculators/IFRS17Calculator';

export const metadata = {
  title: 'IFRS 17 CSM Rechner | ValueAct Rechner',
  description: 'Kostenloser IFRS 17 Rechner für die Vertragliche Servicemarge (CSM). Mit DAV-Sterbetafeln, EIOPA-Zinskurve und vollständigem Prüfpfad.',
  keywords: 'IFRS 17, CSM, Vertragliche Servicemarge, Rechner, Versicherungsmathematik, DAV, Sterbetafel',
  openGraph: {
    title: 'IFRS 17 CSM Rechner — Kostenlos berechnen',
    description: 'Sofortige CSM-Berechnung nach IFRS 17 mit deutschen Standards. DAV 2008 T Sterbetafeln inklusive.',
    locale: 'de_DE',
  },
};

export default function IFRS17Page() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-trust-950">IFRS 17 Rechner</h1>
            <p className="text-gray-500 text-sm mt-1">Vertragliche Servicemarge (CSM) & Verlustkomponente</p>
          </div>
          <IFRS17Calculator />
        </div>
      </main>
      <Footer />
    </div>
  );
}
