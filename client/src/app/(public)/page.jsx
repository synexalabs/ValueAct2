'use client';

import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { Calculator, Shield, BarChart3 } from 'lucide-react';
import Link from 'next/link';

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-white flex flex-col">
            <Navbar />

            {/* Hero Section */}
            <section className="pt-28 pb-16 lg:pt-36 lg:pb-24">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="grid lg:grid-cols-2 gap-16 items-start">
                        <div>
                            <p className="text-trust-600 font-medium mb-4">
                                Open Access · Test Phase
                            </p>
                            <h1 className="text-4xl lg:text-5xl font-semibold text-trust-950 leading-tight mb-6">
                                IFRS 17 & Solvency II
                                <br />
                                <span className="text-gray-400">Actuarial Platform</span>
                            </h1>
                            <p className="text-lg text-gray-500 mb-8 max-w-md leading-relaxed">
                                Institutional-grade calculations for regulatory compliance.
                                CSM, BEL, SCR with German regulatory standards.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-3 mb-10">
                                <Link
                                    href="/dashboard"
                                    className="px-6 py-3 bg-trust-950 text-white rounded-lg font-medium hover:bg-trust-900 transition-colors text-center"
                                >
                                    Open Platform
                                </Link>
                                <Link
                                    href="/methodology"
                                    className="px-6 py-3 bg-white text-trust-900 border border-gray-200 rounded-lg font-medium hover:bg-gray-50 transition-colors text-center"
                                >
                                    Methodology
                                </Link>
                            </div>

                            <div className="flex flex-wrap gap-6 text-sm text-gray-500">
                                <span>IFRS 17 Compliant</span>
                                <span>Solvency II Ready</span>
                                <span>BaFin Standards</span>
                            </div>
                        </div>

                        {/* Calculator Quick Access */}
                        <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                            <div className="mb-6">
                                <h2 className="text-lg font-semibold text-trust-950 mb-1">
                                    Quick Access
                                </h2>
                                <p className="text-sm text-gray-500">
                                    Actuarial calculation tools
                                </p>
                            </div>

                            <div className="space-y-2">
                                {[
                                    { title: 'IFRS 17 Engine', desc: 'CSM, BEL & Risk Adjustment', href: '/calculators/ifrs17' },
                                    { title: 'Solvency II', desc: 'SCR & MCR Calculations', href: '/calculators/solvency' },
                                    { title: 'Premium Modeler', desc: 'Pricing & Sensitivity', href: '/calculators/pricing' },
                                    { title: 'Mortality Tables', desc: 'DAV German Tables', href: '/calculators/mortality' }
                                ].map((calc, i) => (
                                    <Link
                                        key={i}
                                        href={calc.href}
                                        className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-lg hover:border-trust-200 hover:bg-trust-50/50 transition-colors group"
                                    >
                                        <div>
                                            <h3 className="text-sm font-medium text-trust-900">{calc.title}</h3>
                                            <p className="text-xs text-gray-400">{calc.desc}</p>
                                        </div>
                                        <span className="text-gray-300 group-hover:text-trust-500 transition-colors">→</span>
                                    </Link>
                                ))}
                            </div>

                            <Link
                                href="/calculators"
                                className="block w-full mt-4 py-3 bg-trust-950 text-white rounded-lg font-medium hover:bg-trust-900 transition-colors text-center text-sm"
                            >
                                All Calculators
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-16 bg-gray-50/50">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="text-center max-w-2xl mx-auto mb-12">
                        <h2 className="text-2xl lg:text-3xl font-semibold text-trust-950 mb-3">
                            Enterprise-Grade Analytics
                        </h2>
                        <p className="text-gray-500">
                            Built for actuaries who need precision and compliance
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            {
                                icon: Calculator,
                                title: 'IFRS 17 Engine',
                                desc: 'Complete CSM determination, Risk Adjustment calculations, and BEL projections aligned with IASB standards.'
                            },
                            {
                                icon: Shield,
                                title: 'Solvency II',
                                desc: 'SCR stress testing, MCR calibration, and Pillar 1 capital validation with BaFin regulatory alignment.'
                            },
                            {
                                icon: BarChart3,
                                title: 'Analytics',
                                desc: 'Session persistence, multi-format exports, and comparative analysis against historical runs.'
                            }
                        ].map((feature, i) => (
                            <div key={i} className="p-6 bg-white rounded-xl border border-gray-100">
                                <div className="w-10 h-10 bg-trust-50 rounded-lg flex items-center justify-center mb-4 text-trust-700">
                                    <feature.icon size={20} />
                                </div>
                                <h3 className="text-base font-semibold text-trust-900 mb-2">{feature.title}</h3>
                                <p className="text-sm text-gray-500 leading-relaxed">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 border-t border-gray-100">
                <div className="max-w-2xl mx-auto px-6 text-center">
                    <h2 className="text-2xl font-semibold text-trust-950 mb-3">
                        Start calculating
                    </h2>
                    <p className="text-gray-500 mb-6">
                        All calculators available without registration during the test phase.
                    </p>
                    <Link
                        href="/dashboard"
                        className="inline-block px-8 py-3 bg-trust-950 text-white rounded-lg font-medium hover:bg-trust-900 transition-colors"
                    >
                        Open Platform
                    </Link>
                </div>
            </section>

            <Footer />
        </div>
    );
}
