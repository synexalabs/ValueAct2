import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col items-center md:items-start gap-1">
            <span className="text-sm font-semibold text-trust-950">Valuact</span>
            <p className="text-gray-500 text-sm">
              © 2025{' '}
              <a
                href="https://www.synexalabs.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-trust-950 transition-colors"
              >
                Synexa Labs
              </a>
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-6">
            {[
              { label: 'Legal Notice', path: '/impressum' },
              { label: 'Privacy', path: '/privacy' },
              { label: 'Terms', path: '/terms' },
              { label: 'GDPR', path: '/gdpr-compliance' }
            ].map((link, i) => (
              <Link
                key={i}
                href={link.path}
                className="text-sm text-gray-500 hover:text-trust-950 transition-colors"
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
