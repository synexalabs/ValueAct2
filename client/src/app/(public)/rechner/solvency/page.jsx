import Navbar from '../../../../components/Navbar';
import Footer from '../../../../components/Footer';
import SolvencyCalculator from '../../../../components/calculators/SolvencyCalculator';

export const metadata = {
  title: 'Solvency II SCR Rechner | ValueAct Rechner',
  description: 'Kostenloser Solvency II Rechner für SCR und MCR nach Standardformel. Mit allen Risikomodulen und Korrelationsmatrizen.',
  openGraph: {
    title: 'Solvency II SCR Rechner',
    description: 'SCR und MCR nach Solvency II Standardformel. Diversifikationseffekte, Risikomodule, Solvenzquote.',
    locale: 'de_DE',
  },
};

export default function SolvencyPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-trust-950">Solvency II Rechner</h1>
            <p className="text-gray-500 text-sm mt-1">Solvenzkapitalanforderung (SCR) & Mindestkapitalanforderung (MCR)</p>
          </div>
          <SolvencyCalculator />
        </div>
      </main>
      <Footer />
    </div>
  );
}
