import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto lg:ml-64">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-gray-500 text-sm">
            © 2025 synexa labs. All rights reserved.
          </p>
          <div className="flex flex-wrap gap-4 sm:gap-6">
            <Link href="/impressum" className="text-gray-500 hover:text-blue-600 transition-colors text-sm">Impressum</Link>
            <Link href="/privacy" className="text-gray-500 hover:text-blue-600 transition-colors text-sm">Privacy</Link>
            <Link href="/terms" className="text-gray-500 hover:text-blue-600 transition-colors text-sm">Terms</Link>
            <Link href="/gdpr-compliance" className="text-gray-500 hover:text-blue-600 transition-colors text-sm">GDPR</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
