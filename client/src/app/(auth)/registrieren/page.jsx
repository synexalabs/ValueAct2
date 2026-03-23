import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';

export const metadata = {
  title: 'Registrieren | ValueAct Rechner',
};

export default function RegistrierenPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-md">
          <h1 className="text-2xl font-semibold text-trust-950 mb-6 text-center">Professional-Konto erstellen</h1>
          <p className="text-gray-400 text-sm text-center mb-8">
            Unbegrenzte Berechnungen, Prüfpfad, PDF-Export und mehr.
          </p>
          <a href="/preise" className="block w-full py-3 text-center bg-trust-950 text-white rounded-lg font-medium hover:bg-trust-900 transition-colors">
            Preise ansehen
          </a>
        </div>
      </main>
      <Footer />
    </div>
  );
}
