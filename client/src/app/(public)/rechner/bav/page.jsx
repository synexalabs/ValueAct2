import Navbar from '../../../../components/Navbar';
import Footer from '../../../../components/Footer';
import BAVCalculator from '../../../../components/calculators/BAVCalculator';

export const metadata = {
  title: 'bAV-Rechner — Pensionsverpflichtungen nach IAS 19 und HGB | ValueAct',
  description: 'Kostenloser bAV-Rechner für Pensionsverpflichtungen. DBO nach IAS 19 Projected Unit Credit und HGB/BilMoG mit Vergleichsrechnung.',
  keywords: 'bAV, Pensionsverpflichtung, DBO, IAS 19, HGB, BilMoG, Projected Unit Credit, Pensionsrückstellung, betriebliche Altersversorgung',
  openGraph: {
    title: 'bAV-Rechner — Pensionsverpflichtungen berechnen',
    description: 'DBO-Berechnung nach IAS 19 und HGB/BilMoG. Vergleichsrechnung, Dienstzeitaufwand, Zinsaufwand.',
    locale: 'de_DE',
  },
};

export default function BAVPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-trust-950">bAV-Rechner</h1>
            <p className="text-gray-500 text-sm mt-1">Pensionsverpflichtungen nach IAS 19 und HGB/BilMoG</p>
          </div>
          <BAVCalculator />
        </div>
      </main>
      <Footer />
    </div>
  );
}
