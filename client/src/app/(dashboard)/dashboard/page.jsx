'use client';
import { useAuth } from '../../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import Link from 'next/link';

export default function DashboardPage() {
  const { isAuthenticated, user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/anmelden');
    }
  }, [isAuthenticated, loading, router]);

  if (loading || !isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="text-2xl font-semibold text-trust-950 mb-2">Dashboard</h1>
          <p className="text-gray-500 mb-8">Willkommen, {user?.email}</p>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { href: '/rechner/ifrs17', title: 'IFRS 17 Rechner', desc: 'CSM & Verlustkomponente' },
              { href: '/rechner/solvency', title: 'Solvency II Rechner', desc: 'SCR & MCR Berechnung' },
            ].map((item) => (
              <Link key={item.href} href={item.href}
                className="p-5 border border-gray-100 rounded-xl hover:border-trust-200 hover:shadow-sm transition-all">
                <h2 className="font-medium text-trust-900">{item.title}</h2>
                <p className="text-sm text-gray-400">{item.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
