'use client';

import Navbar from '../../components/Navbar';
import { Calculator, Shield, BarChart3, Check, ArrowRight, Database, FileText } from 'lucide-react';
import Link from 'next/link';

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-white">
            <Navbar />

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-[1000px] bg-gradient-to-br from-trust-50/50 to-white -z-10 rounded-b-[5rem]" />
                <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-trust-100/20 blur-[120px] rounded-full -z-10" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-20 items-center">
                        <div className="animate-fade-in-up">
                            <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-growth-50 text-growth-700 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-8 border border-growth-100 shadow-sm">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-growth-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-growth-500"></span>
                                </span>
                                Test Phase - Open Access
                            </div>
                            <h1 className="text-6xl lg:text-8xl font-heading font-black text-trust-950 leading-[0.95] mb-8 tracking-tighter">
                                IFRS 17 &<br />
                                <span className="text-trust-600">Solvency II</span><br />
                                <span className="italic font-light">Analytics.</span>
                            </h1>
                            <p className="text-xl text-gray-400 mb-10 max-w-lg leading-relaxed font-medium">
                                Institutional-grade actuarial platform for regulatory compliance. Precision CSM, BEL, SCR calculations with German regulatory standards.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-5 mb-14">
                                <Link href="/dashboard" className="group flex items-center justify-center px-10 py-5 bg-trust-950 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-trust-900 transition-all hover:-translate-y-1 shadow-2xl shadow-trust-900/20 active:scale-95">
                                    Launch Platform
                                    <ArrowRight size={18} className="ml-3 text-growth-400 group-hover:translate-x-1 transition-transform" />
                                </Link>
                                <Link href="/methodology" className="flex items-center justify-center px-10 py-5 bg-white text-trust-900 border border-gray-100 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-gray-50 transition-all shadow-sm active:scale-95">
                                    View Methodology
                                </Link>
                            </div>

                            <div className="flex flex-wrap gap-10 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">
                                <div className="flex items-center gap-3">
                                    <div className="h-2 w-2 rounded-full bg-growth-500" />
                                    IFRS 17 Compliant
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="h-2 w-2 rounded-full bg-growth-500" />
                                    Solvency II Ready
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="h-2 w-2 rounded-full bg-growth-500" />
                                    BaFin Standards
                                </div>
                            </div>
                        </div>

                        {/* Platform Preview Widget */}
                        <div className="relative animate-scale-in" style={{ animationDelay: '0.2s' }}>
                            <div className="absolute -inset-10 bg-gradient-to-tr from-trust-200/30 to-growth-200/30 rounded-[4rem] blur-[80px] opacity-40"></div>
                            <div className="relative bg-white/80 backdrop-blur-2xl rounded-[3rem] p-10 shadow-glass border border-white/50">
                                <div className="flex items-center justify-between mb-10">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-trust-600 uppercase tracking-[0.3em] mb-1">Actuarial Sandbox</span>
                                        <h3 className="text-3xl font-heading font-black text-trust-950 tracking-tight">Quick Access.</h3>
                                    </div>
                                    <div className="h-12 w-12 bg-trust-950 rounded-2xl flex items-center justify-center text-growth-400 shadow-lg">
                                        <Calculator size={24} className="fill-growth-400" />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {[
                                        { title: 'IFRS 17 Engine', desc: 'CSM, BEL & Risk Adjustment', href: '/calculators/ifrs17' },
                                        { title: 'Solvency II Audit', desc: 'SCR & MCR Calculations', href: '/calculators/solvency' },
                                        { title: 'Premium Modeler', desc: 'Pricing & Sensitivity Analysis', href: '/calculators/pricing' },
                                        { title: 'Actuarial Tables', desc: 'DAV Mortality Tables', href: '/calculators/mortality' }
                                    ].map((calc, i) => (
                                        <Link
                                            key={i}
                                            href={calc.href}
                                            className="flex items-center justify-between p-5 bg-gray-50/50 border border-gray-100 rounded-2xl hover:bg-trust-50 hover:border-trust-200 transition-all group"
                                        >
                                            <div>
                                                <h4 className="text-sm font-bold text-trust-900">{calc.title}</h4>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{calc.desc}</p>
                                            </div>
                                            <ArrowRight size={16} className="text-gray-300 group-hover:text-trust-600 group-hover:translate-x-1 transition-all" />
                                        </Link>
                                    ))}
                                </div>

                                <div className="mt-8 pt-6 border-t border-gray-100">
                                    <Link
                                        href="/calculators"
                                        className="w-full py-5 bg-trust-950 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-trust-900 transition-all shadow-2xl shadow-trust-900/20 active:scale-95 flex items-center justify-center gap-2"
                                    >
                                        View All Calculators
                                        <ArrowRight size={14} className="text-growth-400" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-32 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-20">
                        <span className="text-[10px] font-black text-growth-600 uppercase tracking-[0.4em]">Enterprise Platform</span>
                        <h2 className="mt-4 text-5xl font-heading font-black text-trust-950 tracking-tight leading-[1.1]">Institutional-Grade<br />Actuarial Analytics.</h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-12">
                        {[
                            {
                                icon: Calculator,
                                title: "IFRS 17 Engine",
                                desc: "Complete CSM determination, Risk Adjustment calculations, and BEL projections aligned with latest IASB standards."
                            },
                            {
                                icon: Shield,
                                title: "Solvency II Compliance",
                                desc: "SCR stress testing, MCR calibration, and Pillar 1 capital validation with BaFin regulatory alignment."
                            },
                            {
                                icon: BarChart3,
                                title: "Advanced Analytics",
                                desc: "Session persistence, multi-format exports, and comparative analysis against historical runs."
                            }
                        ].map((feature, i) => (
                            <div key={i} className="p-10 rounded-[3rem] bg-gray-50/50 border border-gray-100 hover:bg-white hover:shadow-glass hover:-translate-y-2 transition-all duration-500 group">
                                <div className="w-16 h-16 bg-white rounded-[1.5rem] flex items-center justify-center shadow-sm mb-8 text-trust-900 group-hover:bg-trust-950 group-hover:text-white transition-all duration-500">
                                    <feature.icon size={32} />
                                </div>
                                <h3 className="text-xl font-black font-heading text-trust-900 mb-4 uppercase tracking-tight">{feature.title}</h3>
                                <p className="text-sm text-gray-500 font-medium leading-relaxed">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-trust-950">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-[10px] font-black text-white/70 uppercase tracking-[0.2em] mb-6">
                        <Check size={12} className="text-growth-400" />
                        No Sign-in Required for Testing
                    </div>
                    <h2 className="text-4xl md:text-5xl font-heading font-black text-white mb-6 tracking-tight">
                        Ready to Explore?
                    </h2>
                    <p className="text-lg text-white/60 mb-10 max-w-2xl mx-auto">
                        Access all IFRS 17 and Solvency II calculators instantly. No registration required during the test phase.
                    </p>
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center gap-3 px-12 py-6 bg-white text-trust-950 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-growth-400 transition-all shadow-2xl active:scale-95"
                    >
                        Launch Platform
                        <ArrowRight size={18} />
                    </Link>
                </div>
            </section>
        </div>
    );
}
