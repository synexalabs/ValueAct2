'use client';

import React, { useState } from 'react';
import { Scale, Gavel, FileSignature, CheckCircle2, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TermsPage() {
    const [language, setLanguage] = useState('en');

    return (
        <div className="space-y-12 pb-20">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div className="mb-10">
                    <div className="flex items-center gap-3 mb-4">
                        <Scale className="h-5 w-5 text-trust-900" />
                        <span className="text-[10px] font-black text-trust-600 uppercase tracking-[0.4em]">Legal Framework</span>
                    </div>
                    <h1 className="text-5xl lg:text-7xl font-heading font-black text-trust-950 tracking-tighter leading-none mb-6">
                        {language === 'de' ? 'Bedingungen.' : 'Terms.'}
                    </h1>
                    <p className="text-xl text-gray-400 font-medium max-w-xl leading-relaxed">
                        The protocols governing our partnership. Transparent, fair, and legally sound architecture.
                    </p>
                </div>

                <div className="flex gap-2 p-1 bg-white rounded-xl border border-gray-100 shadow-sm">
                    {['DE', 'EN'].map((lang) => (
                        <button
                            key={lang}
                            onClick={() => setLanguage(lang.toLowerCase())}
                            className={`px-4 py-2 rounded-lg text-[10px] font-black tracking-widest transition-all ${language === lang.toLowerCase()
                                ? 'bg-trust-950 text-white shadow-lg'
                                : 'text-gray-400 hover:text-trust-900'
                                }`}
                        >
                            {lang}
                        </button>
                    ))}
                </div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="prose prose-trust max-w-none"
            >
                <div className="space-y-12">
                    {language === 'de' ? (
                        <>
                            <section className="bg-white border border-gray-100 p-10 rounded-[2.5rem] relative overflow-hidden group hover:border-trust-100 transition-all shadow-sm">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="h-10 w-10 bg-trust-50 rounded-xl flex items-center justify-center text-trust-900">
                                        <Gavel size={20} />
                                    </div>
                                    <h2 className="text-[10px] font-black text-trust-900 uppercase tracking-[0.2em] m-0">§ 1 GELTUNGSBEREICH</h2>
                                </div>
                                <div className="text-sm text-gray-500 font-medium leading-relaxed">
                                    <p className="mb-4">
                                        Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für die Nutzung der Valuact-Plattform von Zaur Guliyev.
                                    </p>
                                    <p className="m-0">
                                        Mit der Nutzung des Dienstes erkennen Sie diese AGB als verbindlich an. Sollten einzelne Bestimmungen unwirksam sein, bleibt die Wirksamkeit der übrigen Bestimmungen unberührt.
                                    </p>
                                </div>
                            </section>

                            <section className="space-y-6">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="h-10 w-10 bg-trust-50 rounded-xl flex items-center justify-center text-trust-900">
                                        <FileSignature size={20} />
                                    </div>
                                    <h2 className="text-2xl font-black font-heading tracking-tight text-trust-950 m-0 uppercase">§ 2 LEISTUNGSBESCHREIBUNG</h2>
                                </div>
                                <p className="text-sm text-gray-500 font-medium leading-relaxed">
                                    Valuact ist eine SaaS-Plattform für präzise versicherungsmathematische Analysen. Unser Dienst umfasst:
                                </p>
                                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 list-none p-0">
                                    {['IFRS 17 COMPUTATIONS', 'SOLVENCY II METRICS', 'PRICING ENGINE', 'MORTALITY ANALYSIS'].map(item => (
                                        <li key={item} className="flex items-center gap-3 text-[10px] font-black text-trust-900 uppercase tracking-widest bg-gray-50 p-4 rounded-xl border border-gray-100">
                                            <CheckCircle2 size={14} className="text-growth-500" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </section>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-10 border-t border-gray-100 text-sm text-gray-400 font-medium leading-relaxed">
                                <div className="bg-gray-50 p-8 rounded-3xl border border-gray-100">
                                    <h3 className="text-trust-900 font-black uppercase tracking-widest text-[11px] mb-3">§ 5 ZAHLUNGEN</h3>
                                    <p>Abonnements sind monatlich oder jährlich im Voraus zu leisten und grundsätzlich nicht erstattungsfähig.</p>
                                </div>
                                <div className="bg-gray-50 p-8 rounded-3xl border border-gray-100">
                                    <h3 className="text-trust-900 font-black uppercase tracking-widest text-[11px] mb-3">§ 6 HAFTUNG</h3>
                                    <p>Wir haften nur für Vorsatz und grobe Fahrlässigkeit. Ergebnisse basieren auf Nutzer-Eingaben und sind als Unterstützung zu verstehen.</p>
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <section className="bg-white border border-gray-100 p-10 rounded-[2.5rem] relative overflow-hidden group hover:border-trust-100 transition-all shadow-sm">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="h-10 w-10 bg-trust-50 rounded-xl flex items-center justify-center text-trust-900">
                                        <Gavel size={20} />
                                    </div>
                                    <h2 className="text-[10px] font-black text-trust-900 uppercase tracking-[0.2em] m-0">§ 1 SCOPE OF APPLICATION</h2>
                                </div>
                                <div className="text-sm text-gray-500 font-medium leading-relaxed">
                                    <p className="mb-4">
                                        These Terms and Conditions (T&C) apply to the professional use of the Valuact platform provided by Zaur Guliyev.
                                    </p>
                                    <p className="m-0">
                                        By accessing the service, you acknowledge these protocols as binding. If individual provisions are deemed invalid, the integrity of remaining mandates remains intact.
                                    </p>
                                </div>
                            </section>

                            <section className="space-y-6">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="h-10 w-10 bg-trust-50 rounded-xl flex items-center justify-center text-trust-900">
                                        <FileSignature size={20} />
                                    </div>
                                    <h2 className="text-2xl font-black font-heading tracking-tight text-trust-950 m-0 uppercase">§ 2 SERVICE DESCRIPTION</h2>
                                </div>
                                <p className="text-sm text-gray-500 font-medium leading-relaxed">
                                    Valuact provides professional SaaS infrastructure for actuarial precision. Services include:
                                </p>
                                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 list-none p-0">
                                    {['IFRS 17 COMPUTATIONS', 'SOLVENCY II METRICS', 'PRICING ENGINE', 'MORTALITY ANALYSIS'].map(item => (
                                        <li key={item} className="flex items-center gap-3 text-[10px] font-black text-trust-900 uppercase tracking-widest bg-gray-50 p-4 rounded-xl border border-gray-100">
                                            <CheckCircle2 size={14} className="text-growth-500" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </section>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-10 border-t border-gray-100 text-sm text-gray-400 font-medium leading-relaxed">
                                <div className="bg-gray-50 p-8 rounded-3xl border border-gray-100">
                                    <h3 className="text-trust-900 font-black uppercase tracking-widest text-[11px] mb-3">§ 5 PAYMENTS</h3>
                                    <p>Subscription fees are settled in advance on a cyclic basis and are definitively non-refundable.</p>
                                </div>
                                <div className="bg-gray-50 p-8 rounded-3xl border border-gray-100">
                                    <h3 className="text-trust-900 font-black uppercase tracking-widest text-[11px] mb-3">§ 6 LIABILITY</h3>
                                    <p>Liability is restricted to intentional or gross negligence. Analytic outputs are derivative of user-provided data parameters.</p>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </motion.div>

            {/* Support Callout */}
            <div className="p-10 bg-trust-950 text-white rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden mt-12">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Scale size={100} className="text-growth-400" />
                </div>
                <div className="relative z-10 text-center md:text-left">
                    <h3 className="text-xl font-heading font-black tracking-tight mb-2 uppercase">Need clarifying?</h3>
                    <p className="text-trust-400 text-xs font-medium max-w-sm">Contact our legal desk for deep-dive analysis of specific contractual clauses or jurisdictional variations.</p>
                </div>
                <button className="relative z-10 px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all">
                    Legal Desk
                </button>
            </div>
        </div>
    );
}
