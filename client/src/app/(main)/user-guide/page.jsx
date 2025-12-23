'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Calculator, Database, FileText, Settings, BookOpen, TrendingUp, Shield, DollarSign, Activity, AlertTriangle } from 'lucide-react';

export default function UserGuidePage() {
    return (
        <div className="space-y-12 pb-20">
            {/* Hero Section */}
            <div className="relative overflow-hidden bg-gradient-to-br from-trust-900 to-trust-950 rounded-[3rem] p-12 lg:p-16 text-white shadow-2xl">
                <div className="absolute top-0 right-0 p-20 opacity-10">
                    <BookOpen className="h-64 w-64" />
                </div>
                <div className="relative z-10 max-w-2xl">
                    <div className="px-4 py-1.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] mb-6 inline-block">
                        Knowledge Base
                    </div>
                    <h1 className="text-4xl lg:text-5xl font-heading font-bold mb-6">Master the Platform</h1>
                    <p className="text-lg text-white/70 leading-relaxed mb-8">
                        Valuact is a premium actuarial gateway for life insurance engineering. This guide details every algorithm,
                        data architecture, and regulatory cross-walk within the system.
                    </p>
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-growth-400" />
                            <span className="text-xs font-bold uppercase tracking-wider text-white/50">V2.0 Documentation</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-accent-400" />
                            <span className="text-xs font-bold uppercase tracking-wider text-white/50">BaFin Compliant</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto space-y-20">
                {/* What is Valuact */}
                <section>
                    <div className="flex items-center gap-4 mb-8">
                        <div className="h-10 w-10 bg-trust-50 rounded-xl flex items-center justify-center">
                            <Activity className="h-5 w-5 text-trust-600" />
                        </div>
                        <h2 className="text-3xl font-heading font-bold text-trust-900 uppercase tracking-tight">Core Architecture</h2>
                    </div>
                    <div className="prose prose-slate max-w-none">
                        <p className="text-lg text-gray-500 leading-relaxed mb-10">
                            Our platform serves as a unified digital layer for actuaries and risk handlers,
                            built on four primary structural pillars:
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {[
                                { title: 'IFRS 17 Gateway', desc: 'Full-spectrum reporting engine for unearned profit and risk adjustment.' },
                                { title: 'Solvency II Audit', desc: 'Real-time capital requirement validation and Pillar 3 reporting.' },
                                { title: 'Dynamic Pricing', desc: 'Algorithmic premium modeling with integrated profit margin testing.' },
                                { title: 'Actuarial Logic', desc: 'Proprietary mortality curve processing using global benchmarks.' }
                            ].map((item, i) => (
                                <div key={i} className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                                    <h4 className="font-bold text-trust-900 mb-2">{item.title}</h4>
                                    <p className="text-sm text-gray-400 leading-relaxed">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* IFRS 17 Section */}
                <section className="bg-white rounded-[2.5rem] border border-gray-100 p-10 shadow-sm">
                    <div className="flex items-center space-x-4 mb-8">
                        <div className="p-3 bg-trust-900 rounded-2xl text-white">
                            <Calculator className="w-6 h-6" />
                        </div>
                        <h2 className="text-2xl font-heading font-bold text-trust-900">IFRS 17 Master Specs</h2>
                    </div>

                    <div className="bg-trust-50/50 rounded-2xl p-6 border border-trust-100 mb-10">
                        <p className="text-trust-900/70 text-sm leading-relaxed">
                            <strong className="text-trust-900">Technical Context:</strong> The system computes the Contractual Service Margin (CSM)
                            following the General Model (BBA) as defined in IFRS 17 Appendix C. All cash flows are discounted using the bottom-up approach.
                        </p>
                    </div>

                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Required Data Architecture</h3>
                    <div className="overflow-hidden border border-gray-50 rounded-2xl">
                        <table className="min-w-full text-sm">
                            <thead className="bg-gray-50/50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Field ID</th>
                                    <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Type</th>
                                    <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Logic</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 bg-white">
                                {[
                                    { id: 'policy_id', type: 'UUID/String', desc: 'Primary key for actuarial ledger' },
                                    { id: 'face_amount', type: 'Numeric', desc: 'Total death benefit liability' },
                                    { id: 'premium', type: 'Numeric', desc: 'Gross annual premium intake' },
                                    { id: 'issue_age', type: 'Int', desc: 'Policyholder risk age at entry' }
                                ].map((row, i) => (
                                    <tr key={i} className="hover:bg-trust-50/20 transition-colors">
                                        <td className="px-6 py-4 font-mono text-trust-600 font-bold">{row.id}</td>
                                        <td className="px-6 py-4 text-gray-400">{row.type}</td>
                                        <td className="px-6 py-4 text-gray-900 font-medium">{row.desc}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* Solvency II Section */}
                <section className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    <div>
                        <div className="flex items-center space-x-3 mb-6">
                            <div className="p-3 bg-growth-600 rounded-2xl text-white">
                                <Shield className="w-6 h-6" />
                            </div>
                            <h2 className="text-2xl font-heading font-bold text-trust-900">Solvency II Logic</h2>
                        </div>
                        <p className="text-gray-400 leading-relaxed mb-6">
                            Our SCR engine executes a 99.5% VaR (Value-at-Risk) over a 1-year horizon,
                            aligning with the Standard Formula approach.
                        </p>
                        <ul className="space-y-4">
                            {[
                                { label: 'SCR Calibration', icon: TrendingUp },
                                { label: 'MCR Absolute Floors', icon: AlertTriangle },
                                { label: 'Pillar 3 Disclosure', icon: FileText }
                            ].map((item, i) => (
                                <li key={i} className="flex items-center gap-3 bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                                    <item.icon className="h-4 w-4 text-growth-600" />
                                    <span className="text-sm font-bold text-trust-900 uppercase tracking-wider">{item.label}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="bg-growth-50/50 p-8 rounded-[2.5rem] border border-growth-100">
                        <div className="space-y-4">
                            <h4 className="font-bold text-growth-900">Regulatory Target</h4>
                            <div className="flex items-end gap-2">
                                <span className="text-5xl font-heading font-bold text-growth-600">100%</span>
                                <span className="text-xs font-bold text-growth-900/40 uppercase mb-2">SCR Threshold</span>
                            </div>
                            <p className="text-sm text-growth-900/60 leading-relaxed">
                                Maintaining a ratio above 100% is mandatory. Our system flags any scenario reaching 115% as a "Compliance Alert" zone.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Transparency Commitment */}
                <section className="p-12 bg-white border border-gray-100 rounded-[3rem] shadow-sm text-center">
                    <h2 className="text-3xl font-heading font-bold text-trust-900 mb-6">Security & Decryption</h2>
                    <p className="text-gray-400 max-w-xl mx-auto mb-10">
                        We operate under a "Box Zero" transparency policy. Every actuarial factor is traced back to its regulatory or population source.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        {['AES-256 Encrypted', 'BaFin Aligned', 'ISO 27001 Certified', 'GDPR Compliant'].map((tag, i) => (
                            <span key={i} className="px-4 py-2 bg-trust-50 text-trust-600 text-[10px] font-bold uppercase tracking-widest rounded-lg border border-trust-100 italic">
                                {tag}
                            </span>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}
