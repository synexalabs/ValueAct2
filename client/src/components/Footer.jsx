import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 mt-auto lg:ml-64 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-gray-100 to-transparent" />
      <div className="max-w-7xl mx-auto px-10 py-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-black text-trust-950 uppercase tracking-[0.3em]">Institutional Grade</span>
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">
              © 2025 <a href="https://www.synexalabs.org/" target="_blank" rel="noopener noreferrer" className="hover:text-trust-950 transition-colors">synexa labs</a>. All rights reserved.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-8">
            {[
              { label: 'Legal Notice', path: '/impressum' },
              { label: 'Privacy', path: '/privacy' },
              { label: 'Terms', path: '/terms' },
              { label: 'GDPR', path: '/gdpr-compliance' },
              { label: 'Cookies', path: '/cookies' }
            ].map((link, i) => (
              <Link
                key={i}
                href={link.path}
                className="text-[9px] font-black text-gray-400 hover:text-trust-950 uppercase tracking-[0.2em] transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
