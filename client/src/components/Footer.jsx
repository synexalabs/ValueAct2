import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col items-center md:items-start gap-1">
            <span className="text-sm font-semibold text-trust-950">ValueAct Rechner</span>
            <p className="text-gray-400 text-xs">
              © 2026 Zaur Guliyev / Synexa Labs. Alle Rechte vorbehalten.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-6">
            {[
              { label: 'Impressum', path: '/impressum' },
              { label: 'Datenschutz', path: '/datenschutz' },
              { label: 'AGB', path: '/agb' },
              { label: 'Methodik', path: '/methodik' },
            ].map((link) => (
              <Link key={link.path} href={link.path}
                className="text-sm text-gray-500 hover:text-trust-950 transition-colors">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
