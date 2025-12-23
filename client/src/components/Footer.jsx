import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white mt-auto lg:ml-64">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-gray-400 text-sm">
            © 2025 synexa labs. All rights reserved.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="/impressum" className="text-gray-400 hover:text-white transition-colors text-sm">Impressum</Link>
            <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors text-sm">Privacy</Link>
            <Link href="/terms" className="text-gray-400 hover:text-white transition-colors text-sm">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
