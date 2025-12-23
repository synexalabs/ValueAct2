'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Calculator, Database, FileText, Settings, BookOpen, TrendingUp, Shield, DollarSign } from 'lucide-react';

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

            <div className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="bg-white rounded-lg shadow-sm p-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">User Guide</h1>
                    <p className="text-gray-600 mb-8">
                        Valuact is a professional actuarial platform for life insurance calculations. This guide explains every feature,
                        input format, and output to help you understand exactly how your calculations are performed.
                    </p>

                    {/* What is Valuact */}
                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">What is Valuact?</h2>
                        <p className="text-gray-700 mb-4">
                            Valuact is a Software-as-a-Service (SaaS) platform designed for actuaries, insurance professionals, and financial analysts.
                            It provides tools for:
                        </p>
                        <ul className="list-disc list-inside text-gray-700 ml-4 space-y-2">
                            <li><strong>IFRS 17 Calculations</strong> – International Financial Reporting Standard for insurance contracts</li>
                            <li><strong>Solvency II Calculations</strong> – EU regulatory framework for insurance capital requirements</li>
                            <li><strong>Pricing & Product Development</strong> – Premium calculations for life insurance products</li>
                            <li><strong>Mortality Analysis</strong> – Life expectancy and survival probability calculations</li>
                        </ul>
                    </section>

                    {/* IFRS 17 Section */}
                    <section className="mb-10">
                        <div className="flex items-center space-x-3 mb-4">
                            <Calculator className="w-7 h-7 text-blue-600" />
                            <h2 className="text-2xl font-bold text-gray-900">IFRS 17 Calculator</h2>
                        </div>

                        <div className="bg-blue-50 rounded-lg p-4 mb-4">
                            <p className="text-blue-800 text-sm">
                                <strong>What is IFRS 17?</strong> It's an accounting standard that defines how insurance companies must report their insurance contracts.
                                It requires calculating the Contractual Service Margin (CSM), which represents unearned profit that will be recognized over the coverage period.
                            </p>
                        </div>

                        <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">Input Data Format</h3>
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-sm border border-gray-200 rounded-lg">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="px-4 py-2 text-left font-medium text-gray-700">Field</th>
                                        <th className="px-4 py-2 text-left font-medium text-gray-700">Format</th>
                                        <th className="px-4 py-2 text-left font-medium text-gray-700">Example</th>
                                        <th className="px-4 py-2 text-left font-medium text-gray-700">Description</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    <tr><td className="px-4 py-2">policy_id</td><td className="px-4 py-2">String</td><td className="px-4 py-2">POL001</td><td className="px-4 py-2">Unique identifier</td></tr>
                                    <tr className="bg-gray-50"><td className="px-4 py-2">issue_date</td><td className="px-4 py-2">YYYY-MM-DD</td><td className="px-4 py-2">2020-01-15</td><td className="px-4 py-2">Policy start date</td></tr>
                                    <tr><td className="px-4 py-2">maturity_date</td><td className="px-4 py-2">YYYY-MM-DD</td><td className="px-4 py-2">2045-01-15</td><td className="px-4 py-2">Policy end date</td></tr>
                                    <tr className="bg-gray-50"><td className="px-4 py-2">face_amount</td><td className="px-4 py-2">Number</td><td className="px-4 py-2">100000</td><td className="px-4 py-2">Sum assured (death benefit)</td></tr>
                                    <tr><td className="px-4 py-2">premium</td><td className="px-4 py-2">Number</td><td className="px-4 py-2">1200</td><td className="px-4 py-2">Annual premium amount</td></tr>
                                    <tr className="bg-gray-50"><td className="px-4 py-2">issue_age</td><td className="px-4 py-2">Integer</td><td className="px-4 py-2">35</td><td className="px-4 py-2">Age at policy issue</td></tr>
                                    <tr><td className="px-4 py-2">gender</td><td className="px-4 py-2">M/F</td><td className="px-4 py-2">M</td><td className="px-4 py-2">Policyholder gender</td></tr>
                                </tbody>
                            </table>
                        </div>

                        <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">Assumptions Required</h3>
                        <ul className="list-disc list-inside text-gray-700 ml-4 space-y-1">
                            <li><strong>Discount Rate (0-10%):</strong> Rate used to discount future cash flows (e.g., 3.5%)</li>
                            <li><strong>Lapse Rate (0-20%):</strong> Expected annual policy surrender rate (e.g., 5%)</li>
                            <li><strong>Mortality Table:</strong> CSO 2017, CSO 2001, or GAM 1994</li>
                            <li><strong>Expense Inflation (0-5%):</strong> Annual increase in expenses (e.g., 2%)</li>
                        </ul>

                        <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">Output Metrics</h3>
                        <ul className="list-disc list-inside text-gray-700 ml-4 space-y-1">
                            <li><strong>CSM (Contractual Service Margin):</strong> Unearned profit = PV(Premiums) - PV(Benefits) - Risk Adjustment</li>
                            <li><strong>Fulfilment Cash Flows (FCF):</strong> Expected future cash flows discounted to present value</li>
                            <li><strong>Risk Adjustment:</strong> Compensation for uncertainty in non-financial risks</li>
                            <li><strong>Loss Component:</strong> Appears if contract is onerous (expected loss)</li>
                        </ul>
                    </section>

                    {/* Solvency II Section */}
                    <section className="mb-10">
                        <div className="flex items-center space-x-3 mb-4">
                            <Shield className="w-7 h-7 text-green-600" />
                            <h2 className="text-2xl font-bold text-gray-900">Solvency II Calculator</h2>
                        </div>

                        <div className="bg-green-50 rounded-lg p-4 mb-4">
                            <p className="text-green-800 text-sm">
                                <strong>What is Solvency II?</strong> It's the EU regulatory framework requiring insurers to hold sufficient capital to survive
                                a 1-in-200 year adverse event (99.5% confidence level). The SCR (Solvency Capital Requirement) is the key metric.
                            </p>
                        </div>

                        <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">Output Metrics</h3>
                        <ul className="list-disc list-inside text-gray-700 ml-4 space-y-1">
                            <li><strong>SCR (Solvency Capital Requirement):</strong> Capital needed to survive 1-in-200 year loss</li>
                            <li><strong>MCR (Minimum Capital Requirement):</strong> Absolute minimum capital (25-45% of SCR)</li>
                            <li><strong>Solvency Ratio:</strong> Own Funds ÷ SCR (must be &gt; 100%)</li>
                            <li><strong>SCR Breakdown:</strong> Market risk, Underwriting risk, Credit risk, Operational risk</li>
                        </ul>
                    </section>

                    {/* Pricing Section */}
                    <section className="mb-10">
                        <div className="flex items-center space-x-3 mb-4">
                            <DollarSign className="w-7 h-7 text-purple-600" />
                            <h2 className="text-2xl font-bold text-gray-900">Pricing Calculator</h2>
                        </div>

                        <div className="bg-purple-50 rounded-lg p-4 mb-4">
                            <p className="text-purple-800 text-sm">
                                <strong>How does pricing work?</strong> Life insurance premiums are calculated using the equivalence principle:
                                present value of premiums = present value of benefits + expenses + profit margin.
                            </p>
                        </div>

                        <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">Key Formulas</h3>
                        <div className="bg-gray-100 rounded-lg p-4 font-mono text-sm">
                            <p className="mb-2"><strong>Annuity Factor:</strong> Σ (v^t × tpx) for t = 1 to n</p>
                            <p className="mb-2"><strong>Net Premium:</strong> (Sum Assured × Ax) ÷ äx</p>
                            <p><strong>Where:</strong> v = 1/(1+i), tpx = survival probability, Ax = insurance factor</p>
                        </div>
                    </section>

                    {/* Mortality Section */}
                    <section className="mb-10">
                        <div className="flex items-center space-x-3 mb-4">
                            <TrendingUp className="w-7 h-7 text-orange-600" />
                            <h2 className="text-2xl font-bold text-gray-900">Mortality Calculator</h2>
                        </div>

                        <div className="bg-orange-50 rounded-lg p-4 mb-4">
                            <p className="text-orange-800 text-sm">
                                <strong>Mortality Tables Explained:</strong> These tables show the probability of death at each age, derived from
                                population statistics. We use CSO 2017 (Commissioners Standard Ordinary) as the default.
                            </p>
                        </div>

                        <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">Available Mortality Tables</h3>
                        <ul className="list-disc list-inside text-gray-700 ml-4 space-y-1">
                            <li><strong>CSO 2017:</strong> Latest US mortality table (recommended)</li>
                            <li><strong>CSO 2001:</strong> Previous standard table</li>
                            <li><strong>GAM 1994:</strong> Group Annuity Mortality table</li>
                        </ul>
                    </section>

                    {/* Transparency Section */}
                    <section className="mb-10 p-6 bg-gray-50 rounded-lg border border-gray-200">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Our Commitment to Transparency</h2>
                        <ul className="space-y-2 text-gray-700">
                            <li>✓ All calculation formulas are documented in the <Link href="/methodology" className="text-blue-600 hover:underline">Methodology</Link> section</li>
                            <li>✓ Regulatory sources are cited (IFRS 17.37, Solvency II Directive Article 172)</li>
                            <li>✓ No black-box calculations – every step is explainable</li>
                            <li>✓ Your data is encrypted and never shared with third parties</li>
                        </ul>
                    </section>

                    {/* Contact */}
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                        <p className="text-blue-800 text-sm">
                            <strong>Questions?</strong> Contact us at <a href="mailto:service@synexalabs.com" className="underline">service@synexalabs.com</a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
