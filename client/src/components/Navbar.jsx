'use client';

import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, logout } = useAuth();

  const navLinks = [
    { label: 'Rechner', path: '/rechner' },
    { label: 'Sterbetafeln', path: '/rechner/sterbetafeln' },
    { label: 'Methodik', path: '/methodik' },
    { label: 'Preise', path: '/preise' },
  ];

  return (
    <nav className="fixed w-full z-50 bg-white/90 backdrop-blur-sm border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex justify-between h-16 items-center">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-trust-950 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">V</span>
            </div>
            <span className="font-semibold text-xl text-trust-950">ValueAct Rechner</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link key={link.path} href={link.path}
                className="text-sm text-gray-600 hover:text-trust-950 transition-colors">
                {link.label}
              </Link>
            ))}

            {isAuthenticated ? (
              <>
                <Link href="/dashboard"
                  className="text-sm text-gray-600 hover:text-trust-950 transition-colors">
                  Dashboard
                </Link>
                <button onClick={logout}
                  className="text-sm text-gray-500 hover:text-trust-950 transition-colors">
                  Abmelden
                </button>
              </>
            ) : (
              <>
                <Link href="/anmelden"
                  className="text-sm text-gray-600 hover:text-trust-950 transition-colors">
                  Anmelden
                </Link>
                <Link href="/rechner"
                  className="bg-trust-950 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-trust-900 transition-colors">
                  Kostenlos testen
                </Link>
              </>
            )}
          </div>

          <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-trust-900 p-2" aria-label="Menü">
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 absolute w-full shadow-lg py-6 px-6">
          <div className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link key={link.path} href={link.path} onClick={() => setIsOpen(false)}
                className="text-base text-trust-950 font-medium py-2">
                {link.label}
              </Link>
            ))}
            {isAuthenticated ? (
              <button onClick={() => { logout(); setIsOpen(false); }}
                className="text-base text-gray-500 font-medium py-2 text-left">
                Abmelden
              </button>
            ) : (
              <Link href="/rechner" onClick={() => setIsOpen(false)}
                className="bg-trust-950 text-white px-5 py-3 rounded-lg text-sm font-medium text-center mt-2">
                Kostenlos testen
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
