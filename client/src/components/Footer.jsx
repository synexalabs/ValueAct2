import React from 'react';
import Link from 'next/link';
import { Calculator } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white mt-auto lg:ml-64">
      <div className="border-t-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="col-span-2">
            <div className="flex items-center space-x-2 mb-6">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <Calculator className="w-5 h-5 text-white" />
              </div>
              <span className="font-heading font-bold text-xl">Valuact</span>
            </div>
            <p className="text-gray-400 mb-6 max-w-md">
              Professional actuarial solutions platform for life insurance professionals. Advanced tools for IFRS 17, Solvency II, Pricing, and Risk Management.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4">Legal</h3>
            <ul className="space-y-3">
              <li><Link href="/impressum" className="text-gray-400 hover:text-white transition-colors hover:underline">Impressum</Link></li>
              <li><Link href="/privacy" className="text-gray-400 hover:text-white transition-colors hover:underline">Privacy</Link></li>
              <li><Link href="/terms" className="text-gray-400 hover:text-white transition-colors hover:underline">Terms</Link></li>
              <li><Link href="/cookies" className="text-gray-400 hover:text-white transition-colors hover:underline">Cookies</Link></li>
              <li><Link href="/gdpr-compliance" className="text-gray-400 hover:text-white transition-colors hover:underline">GDPR</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2025 synexa labs. All rights reserved.
          </p>
          <div className="flex flex-wrap gap-4 mt-4 md:mt-0">
            <Link href="/impressum" className="text-gray-400 hover:text-white transition-colors hover:underline text-sm">Impressum</Link>
            <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors hover:underline text-sm">Privacy</Link>
            <Link href="/terms" className="text-gray-400 hover:text-white transition-colors hover:underline text-sm">Terms</Link>
            <Link href="/cookies" className="text-gray-400 hover:text-white transition-colors hover:underline text-sm">Cookies</Link>
            <Link href="/gdpr-compliance" className="text-gray-400 hover:text-white transition-colors hover:underline text-sm">GDPR</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

