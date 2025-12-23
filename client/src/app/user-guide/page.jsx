'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Calculator, Database, FileText, Settings, BookOpen } from 'lucide-react';

export default function UserGuidePage() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <nav className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <Link href="/" className="flex items-center space-x-2">
                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                            <span className="text-lg font-semibold text-gray-900">Back to Dashboard</span>
                        </Link>
                    </div>
                </div>
            </nav>

            <div className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="bg-white rounded-lg shadow-sm p-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">User Guide</h1>
                    <p className="text-gray-600 mb-8">Learn how to use Valuact for your actuarial calculations.</p>

                    <div className="space-y-8">
                        <section>
                            <div className="flex items-center space-x-3 mb-4">
                                <Database className="w-6 h-6 text-blue-600" />
                                <h2 className="text-xl font-semibold text-gray-900">1. Upload Your Data</h2>
                            </div>
                            <p className="text-gray-700 mb-3">
                                Navigate to <strong>Data Management</strong> to upload your policy portfolio. Supported formats include CSV and Excel files.
                            </p>
                            <ul className="list-disc list-inside text-gray-600 ml-4 space-y-1">
                                <li>Upload policy data with columns for policy ID, issue date, face amount, premium</li>
                                <li>System validates data and shows any formatting errors</li>
                                <li>Data is securely stored and encrypted</li>
                            </ul>
                        </section>

                        <section>
                            <div className="flex items-center space-x-3 mb-4">
                                <Calculator className="w-6 h-6 text-blue-600" />
                                <h2 className="text-xl font-semibold text-gray-900">2. Run Calculations</h2>
                            </div>
                            <p className="text-gray-700 mb-3">
                                Use <strong>Valuations</strong> for full portfolio analysis or <strong>Quick Calculators</strong> for individual calculations.
                            </p>
                            <ul className="list-disc list-inside text-gray-600 ml-4 space-y-1">
                                <li><strong>IFRS 17:</strong> Calculate CSM, Risk Adjustment, and Fulfilment Cash Flows</li>
                                <li><strong>Solvency II:</strong> Compute SCR, MCR, and Solvency Ratios</li>
                                <li><strong>Pricing:</strong> Premium calculations with mortality tables</li>
                                <li><strong>Mortality:</strong> Life expectancy and survival probability analysis</li>
                            </ul>
                        </section>

                        <section>
                            <div className="flex items-center space-x-3 mb-4">
                                <FileText className="w-6 h-6 text-blue-600" />
                                <h2 className="text-xl font-semibold text-gray-900">3. Review Results</h2>
                            </div>
                            <p className="text-gray-700 mb-3">
                                Results are displayed with detailed breakdowns and visualizations. Export to PDF or Excel for reporting.
                            </p>
                        </section>

                        <section>
                            <div className="flex items-center space-x-3 mb-4">
                                <BookOpen className="w-6 h-6 text-blue-600" />
                                <h2 className="text-xl font-semibold text-gray-900">4. Understand the Methodology</h2>
                            </div>
                            <p className="text-gray-700">
                                Visit the <Link href="/methodology" className="text-blue-600 hover:underline">Methodology</Link> page for detailed explanations of our calculation formulas and regulatory compliance.
                            </p>
                        </section>

                        <section>
                            <div className="flex items-center space-x-3 mb-4">
                                <Settings className="w-6 h-6 text-blue-600" />
                                <h2 className="text-xl font-semibold text-gray-900">5. Configure Settings</h2>
                            </div>
                            <p className="text-gray-700">
                                Adjust your preferences in <strong>Settings</strong> including default assumptions, display preferences, and account management.
                            </p>
                        </section>
                    </div>

                    <div className="mt-10 p-4 bg-blue-50 rounded-lg border border-blue-100">
                        <p className="text-blue-800 text-sm">
                            <strong>Need help?</strong> Contact us at <a href="mailto:service@synexalabs.com" className="underline">service@synexalabs.com</a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
