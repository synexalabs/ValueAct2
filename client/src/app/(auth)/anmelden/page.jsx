import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import LoginForm from '../../../components/Login';

export const metadata = {
  title: 'Anmelden | ValueAct Rechner',
};

export default function AnmeldenPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <LoginForm />
      </main>
      <Footer />
    </div>
  );
}
