import Navbar from '../../../../components/Navbar';
import Footer from '../../../../components/Footer';
import MortalityBrowser from '../../../../components/calculators/MortalityBrowser';

export const metadata = {
  title: 'DAV Sterbetafeln Online | ValueAct Rechner',
  description: 'Interaktiver Browser für DAV 2008 T und DAV 2004 R Sterbetafeln. Sterbewahrscheinlichkeiten, Überlebenswahrscheinlichkeiten und Lebenserwartung. Kostenlos.',
  keywords: 'DAV 2008 T, DAV 2004 R, Sterbetafel, Sterbewahrscheinlichkeit, qx, Versicherungsmathematik',
  openGraph: {
    title: 'DAV Sterbetafeln Online — Sterbewahrscheinlichkeiten',
    description: 'Interaktiver Browser für DAV 2008 T und DAV 2004 R. Kostenlos, ohne Registrierung.',
    locale: 'de_DE',
  },
};

export default function SterbetafelnPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-trust-950">DAV Sterbetafeln</h1>
            <p className="text-gray-500 text-sm mt-1">Deutsche Aktuarvereinigung — DAV 2008 T & DAV 2004 R</p>
          </div>
          <MortalityBrowser />
        </div>
      </main>
      <Footer />
    </div>
  );
}
